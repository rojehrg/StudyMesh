/**
 * Momentum Lock Inference Module
 *
 * Uses AI to extract lock fields from Slack thread context.
 * Follows the "single question" rule - if critical field missing, only ask one.
 */

import { createLogger } from "@/lib/logger";
import {
  getCurrentHourInTimezone,
  getNextOccurrenceOfHour,
  isInWorkingHours,
} from "@/lib/timezone-utils";

const log = createLogger({ service: "momentum-lock" });

// Slack message structure (simplified)
export interface SlackMessage {
  user: string;          // Slack user ID
  text: string;
  ts: string;            // Timestamp
  thread_ts?: string;
  type: string;
}

// Confidence scoring for inference results
export interface InferenceConfidence {
  overall: 'high' | 'medium' | 'low';
  ownerScore: number;      // 0-100
  outcomeScore: number;    // 0-100
  deadlineScore: number;   // 0-100
  factors: string[];       // Reasons for confidence level
}

// Inferred lock fields
export interface InferredLock {
  requiredOutcome: string | null;
  primaryOwner: string | null;      // Slack user ID
  fallbackOwner: string | null;     // Slack user ID
  deadline: Date | null;
  deadlineSource: 'explicit' | 'inferred' | 'default' | null;  // How deadline was determined
  impactStatement: string | null;
  confidence: 'high' | 'medium' | 'low';
  confidenceDetails: InferenceConfidence | null;  // Detailed confidence scoring
  missingField: 'owner' | 'deadline' | 'outcome' | null;  // Most critical missing field
}

// Owner context for intelligent defaults
export interface OwnerContext {
  timezone: string | null;
  localTime: string;
  isInWorkingHours: boolean;
  hoursUntilWorkStart: number | null;
  availabilityStatus: 'available' | 'outside_hours' | 'unknown';
}

// Historical response pattern (for future tracking)
export interface ResponsePattern {
  averageResponseTimeHours: number;
  preferredResponseHours: number[];  // Hours of day (0-23) when they typically respond
  responseRate: number;  // 0-1 percentage
}

// Patterns for detecting owners
const OWNER_PATTERNS = [
  /<@(\w+)>\s*(?:can you|could you|please|would you)/i,
  /waiting (?:on|for)\s*<@(\w+)>/i,
  /need\s*<@(\w+)>\s*to/i,
  /assigned to\s*<@(\w+)>/i,
  /blocked (?:on|by)\s*<@(\w+)>/i,
  /<@(\w+)>\s*(?:owns|is responsible)/i,
];

// Patterns for detecting deadlines with timezone awareness
// These return either fixed hours or a function to compute based on owner timezone
interface DeadlinePattern {
  pattern: RegExp;
  hours: number | null;
  computeDeadline?: (ownerTimezone: string, now: Date) => Date;
  source: 'explicit' | 'inferred';
  confidence: number;  // 0-100
}

const DEADLINE_PATTERNS: DeadlinePattern[] = [
  // "by EOD" or "end of day" - end of owner's working day
  {
    pattern: /(?:by\s+)?(?:end\s+of\s+(?:the\s+)?day|eod|today(?:\s+evening)?)/i,
    hours: null,
    computeDeadline: (ownerTimezone: string, now: Date) => {
      return getNextOccurrenceOfHour(ownerTimezone, 17, now);  // 5 PM owner time
    },
    source: 'explicit',
    confidence: 85,
  },
  // "tomorrow morning" - 9 AM owner time next day
  {
    pattern: /tomorrow\s+(?:morning|am)/i,
    hours: null,
    computeDeadline: (ownerTimezone: string, now: Date) => {
      const tomorrow9am = getNextOccurrenceOfHour(ownerTimezone, 9, now);
      // Ensure it's actually tomorrow
      if (tomorrow9am.getTime() - now.getTime() < 8 * 60 * 60 * 1000) {
        return new Date(tomorrow9am.getTime() + 24 * 60 * 60 * 1000);
      }
      return tomorrow9am;
    },
    source: 'explicit',
    confidence: 90,
  },
  // "tomorrow" (generic) - 9 AM owner time
  {
    pattern: /(?:by\s+)?tomorrow(?:\s+(?:afternoon|evening))?/i,
    hours: null,
    computeDeadline: (ownerTimezone: string, now: Date) => {
      const hour = /afternoon/i.test('') ? 14 : /evening/i.test('') ? 17 : 9;
      const deadline = getNextOccurrenceOfHour(ownerTimezone, hour, now);
      if (deadline.getTime() - now.getTime() < 8 * 60 * 60 * 1000) {
        return new Date(deadline.getTime() + 24 * 60 * 60 * 1000);
      }
      return deadline;
    },
    source: 'explicit',
    confidence: 80,
  },
  // "this week" or "by end of week" - Friday 5 PM owner time
  {
    pattern: /(?:by\s+)?(?:this\s+week|end\s+of\s+(?:the\s+)?week|friday|eow)/i,
    hours: null,
    computeDeadline: (ownerTimezone: string, now: Date) => {
      return getNextFriday5PM(ownerTimezone, now);
    },
    source: 'explicit',
    confidence: 75,
  },
  // "asap" or "urgent" - 3 hours from now
  {
    pattern: /asap|urgent(?:ly)?|immediately|right\s+away/i,
    hours: 3,
    source: 'explicit',
    confidence: 95,
  },
  // "within X hours"
  {
    pattern: /within\s+(\d+)\s+hours?/i,
    hours: null,  // Will be parsed from match
    source: 'explicit',
    confidence: 90,
  },
  // "by [time]" - specific time today
  {
    pattern: /by\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i,
    hours: null,
    source: 'explicit',
    confidence: 95,
  },
  // "next week" - Monday 9 AM owner time
  {
    pattern: /next\s+week/i,
    hours: null,
    computeDeadline: (ownerTimezone: string, now: Date) => {
      return getNextMonday9AM(ownerTimezone, now);
    },
    source: 'explicit',
    confidence: 70,
  },
];

/**
 * Get next Friday at 5 PM in owner's timezone
 */
function getNextFriday5PM(timezone: string, now: Date): Date {
  const currentDay = now.getDay();  // 0 = Sunday, 5 = Friday
  let daysUntilFriday = (5 - currentDay + 7) % 7;

  // If it's Friday and past 5 PM, go to next Friday
  if (daysUntilFriday === 0) {
    const currentHour = getCurrentHourInTimezone(timezone);
    if (currentHour >= 17) {
      daysUntilFriday = 7;
    }
  }

  const friday = new Date(now.getTime() + daysUntilFriday * 24 * 60 * 60 * 1000);
  return getNextOccurrenceOfHour(timezone, 17, friday);
}

/**
 * Get next Monday at 9 AM in owner's timezone
 */
function getNextMonday9AM(timezone: string, now: Date): Date {
  const currentDay = now.getDay();  // 0 = Sunday, 1 = Monday
  let daysUntilMonday = (1 - currentDay + 7) % 7;

  if (daysUntilMonday === 0) {
    daysUntilMonday = 7;  // If Monday, go to next Monday
  }

  const monday = new Date(now.getTime() + daysUntilMonday * 24 * 60 * 60 * 1000);
  return getNextOccurrenceOfHour(timezone, 9, monday);
}

/**
 * Extract mentioned user IDs from text
 */
function extractMentions(text: string): string[] {
  const mentionRegex = /<@(\w+)>/g;
  const mentions: string[] = [];
  let match;
  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push(match[1]);
  }
  return mentions;
}

// inferPrimaryOwner is replaced by inferPrimaryOwnerWithDetails below

/**
 * Deadline inference result with confidence
 */
interface DeadlineInferenceResult {
  deadline: Date | null;
  source: 'explicit' | 'inferred' | 'default' | null;
  confidence: number;
  matchedPattern: string | null;
}

/**
 * Detect deadline from thread messages with timezone awareness
 */
function inferDeadline(
  messages: SlackMessage[],
  ownerTimezone: string | null
): DeadlineInferenceResult {
  const fullText = messages.map(m => m.text).join(' ');
  const now = new Date();
  const tz = ownerTimezone || 'America/New_York';

  // Try each pattern
  for (const pattern of DEADLINE_PATTERNS) {
    const match = fullText.match(pattern.pattern);
    if (match) {
      // Handle "within X hours" pattern
      if (pattern.pattern.source.includes('within') && match[1]) {
        const hours = parseInt(match[1], 10);
        if (!isNaN(hours)) {
          return {
            deadline: new Date(now.getTime() + hours * 60 * 60 * 1000),
            source: 'explicit',
            confidence: pattern.confidence,
            matchedPattern: match[0],
          };
        }
      }

      // Handle "by [time] am/pm" pattern
      if (pattern.pattern.source.includes('am|pm') && match[1] && match[3]) {
        let hour = parseInt(match[1], 10);
        const minutes = match[2] ? parseInt(match[2], 10) : 0;
        const isPM = match[3].toLowerCase() === 'pm';

        if (isPM && hour < 12) hour += 12;
        if (!isPM && hour === 12) hour = 0;

        const deadline = getNextOccurrenceOfHour(tz, hour, now);
        return {
          deadline,
          source: 'explicit',
          confidence: pattern.confidence,
          matchedPattern: match[0],
        };
      }

      // Use computed deadline if available
      if (pattern.computeDeadline) {
        return {
          deadline: pattern.computeDeadline(tz, now),
          source: pattern.source,
          confidence: pattern.confidence,
          matchedPattern: match[0],
        };
      }

      // Use fixed hours
      if (pattern.hours !== null) {
        return {
          deadline: new Date(now.getTime() + pattern.hours * 60 * 60 * 1000),
          source: pattern.source,
          confidence: pattern.confidence,
          matchedPattern: match[0],
        };
      }
    }
  }

  // No deadline found
  return {
    deadline: null,
    source: null,
    confidence: 0,
    matchedPattern: null,
  };
}

/**
 * Use Groq/Llama to summarize the required outcome
 */
async function inferOutcomeWithAI(messages: SlackMessage[]): Promise<string | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    log.info("Skipping AI inference: GROQ_API_KEY not set");
    return null;
  }

  const context = messages
    .map(m => m.text)
    .join('\n')
    .slice(0, 2000); // Limit context size

  const prompt = `Analyze this Slack thread and extract the main ask or request in ONE short sentence (under 100 characters).

Focus on: What does someone need to do? What is being asked for?

Use action verbs like: review, approve, fix, update, merge, ship, confirm, respond.

Thread:
${context}

Required outcome (one sentence):`;

  try {
    // 2-second timeout to stay within Slack's response window
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "user", content: prompt }
        ],
        max_tokens: 100,
        temperature: 0.3,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      log.error("Groq API error", { status: response.status });
      return null;
    }

    const data = await response.json();
    const outcome = data.choices?.[0]?.message?.content?.trim();

    // Clean up the response - remove quotes, leading dashes, etc.
    return outcome?.replace(/^["'-\s]+|["'-\s]+$/g, '') || null;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      log.warn("Groq API timeout (outcome inference)");
    } else {
      log.error("AI inference failed", { error: error.message });
    }
    return null;
  }
}

/**
 * Use AI to generate impact statement
 */
async function inferImpactWithAI(messages: SlackMessage[]): Promise<string | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  const context = messages
    .map(m => m.text)
    .join('\n')
    .slice(0, 1500);

  const prompt = `From this Slack thread, extract why this request matters in ONE short sentence.

If there's a deadline, mention it. If it blocks others, say so. If unclear, say "Keeps work moving."

Thread:
${context}

Why it matters (one sentence):`;

  try {
    // 2-second timeout to stay within Slack's response window
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "user", content: prompt }
        ],
        max_tokens: 80,
        temperature: 0.3,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) return null;

    const data = await response.json();
    return data.choices?.[0]?.message?.content?.trim() || "Keeps work moving.";
  } catch {
    return "Keeps work moving.";
  }
}

/**
 * Simple keyword-based outcome extraction (fallback when AI unavailable)
 */
function inferOutcomeFromKeywords(messages: SlackMessage[]): string | null {
  const fullText = messages.map(m => m.text).join(' ').toLowerCase();

  // Look for common request patterns
  const patterns = [
    { regex: /(?:please |can you |could you |need you to )([^.!?]+)/i, prefix: "" },
    { regex: /waiting (?:on|for) (?:you to |)([^.!?]+)/i, prefix: "" },
    { regex: /(?:review|approve|merge|fix|update|ship|confirm)\s+([^.!?]+)/i, prefix: "" },
  ];

  for (const { regex, prefix } of patterns) {
    const match = fullText.match(regex);
    if (match && match[1]) {
      const outcome = (prefix + match[1]).trim();
      // Capitalize first letter
      return outcome.charAt(0).toUpperCase() + outcome.slice(1);
    }
  }

  return null;
}

/**
 * Calculate detailed confidence based on what was inferred
 */
function calculateConfidence(
  lock: Partial<InferredLock>,
  deadlineResult: DeadlineInferenceResult,
  ownerExplicit: boolean
): InferenceConfidence {
  const factors: string[] = [];

  // Owner confidence
  let ownerScore = 0;
  if (lock.primaryOwner) {
    if (ownerExplicit) {
      ownerScore = 95;
      factors.push('Owner explicitly mentioned in request pattern');
    } else {
      ownerScore = 60;
      factors.push('Owner inferred from most mentioned user');
    }
  }

  // Outcome confidence
  let outcomeScore = 0;
  if (lock.requiredOutcome) {
    if (lock.requiredOutcome.length > 20) {
      outcomeScore = 80;
      factors.push('Outcome extracted with sufficient detail');
    } else {
      outcomeScore = 50;
      factors.push('Outcome is brief, may need clarification');
    }
  }

  // Deadline confidence
  let deadlineScore = deadlineResult.confidence;
  if (deadlineResult.source === 'explicit') {
    factors.push(`Deadline found: "${deadlineResult.matchedPattern}"`);
  } else if (deadlineResult.source === 'inferred') {
    factors.push('Deadline inferred from context');
  }

  // Calculate overall confidence
  const avgScore = (ownerScore + outcomeScore + deadlineScore) / 3;
  let overall: 'high' | 'medium' | 'low';
  if (avgScore >= 70) {
    overall = 'high';
  } else if (avgScore >= 40) {
    overall = 'medium';
  } else {
    overall = 'low';
  }

  return {
    overall,
    ownerScore,
    outcomeScore,
    deadlineScore,
    factors,
  };
}

/**
 * Get owner context information for intelligent defaults
 */
export function getOwnerContext(timezone: string | null): OwnerContext {
  const tz = timezone || 'America/New_York';
  const now = new Date();

  // Format local time
  const localTime = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: tz,
  }).format(now);

  // Check if in working hours (9 AM - 6 PM)
  const inWorkingHours = isInWorkingHours(tz, 9, 18);

  // Calculate hours until next work start
  let hoursUntilWorkStart: number | null = null;
  if (!inWorkingHours) {
    const currentHour = getCurrentHourInTimezone(tz);
    if (currentHour >= 18) {
      // After 6 PM - calculate hours until tomorrow 9 AM
      hoursUntilWorkStart = (24 - currentHour) + 9;
    } else {
      // Before 9 AM - calculate hours until 9 AM
      hoursUntilWorkStart = 9 - currentHour;
    }
  }

  // Determine availability status
  let availabilityStatus: 'available' | 'outside_hours' | 'unknown';
  if (timezone === null) {
    availabilityStatus = 'unknown';
  } else if (inWorkingHours) {
    availabilityStatus = 'available';
  } else {
    availabilityStatus = 'outside_hours';
  }

  return {
    timezone: tz,
    localTime,
    isInWorkingHours: inWorkingHours,
    hoursUntilWorkStart,
    availabilityStatus,
  };
}

/**
 * Get intelligent deadline default based on owner context and time of day
 */
export function getIntelligentDeadlineDefault(
  ownerTimezone: string | null,
  requesterTimezone: string | null
): Date {
  const tz = ownerTimezone || 'America/New_York';
  const now = new Date();
  const currentHour = getCurrentHourInTimezone(tz);

  // If owner is in working hours (9 AM - 6 PM), default to end of their day
  if (currentHour >= 9 && currentHour < 18) {
    return getNextOccurrenceOfHour(tz, 17, now);  // 5 PM owner time
  }

  // If it's evening (6 PM - 10 PM), default to tomorrow morning
  if (currentHour >= 18 && currentHour < 22) {
    const tomorrow9am = getNextOccurrenceOfHour(tz, 9, now);
    if (tomorrow9am.getTime() - now.getTime() < 8 * 60 * 60 * 1000) {
      return new Date(tomorrow9am.getTime() + 24 * 60 * 60 * 1000);
    }
    return tomorrow9am;
  }

  // If it's night or early morning, default to 9 AM owner time (same day or next)
  const next9am = getNextOccurrenceOfHour(tz, 9, now);
  return next9am;
}

/**
 * Determine the most critical missing field
 */
function getMissingField(lock: Partial<InferredLock>): 'owner' | 'deadline' | 'outcome' | null {
  // Priority order: owner > deadline > outcome
  if (!lock.primaryOwner) return 'owner';
  if (!lock.deadline) return 'deadline';
  if (!lock.requiredOutcome) return 'outcome';
  return null;
}

/**
 * Main inference function - extracts all lock fields from thread context
 */
export async function inferLockFromThread(
  messages: SlackMessage[],
  requesterId: string,
  teamId: string,
  ownerTimezone?: string | null
): Promise<InferredLock> {
  log.info("Inferring lock from thread", { messageCount: messages.length, requesterId });

  if (messages.length === 0) {
    return {
      requiredOutcome: null,
      primaryOwner: null,
      fallbackOwner: null,
      deadline: null,
      deadlineSource: null,
      impactStatement: null,
      confidence: 'low',
      confidenceDetails: null,
      missingField: 'owner',
    };
  }

  // Run inferences in parallel
  const [aiOutcome, aiImpact] = await Promise.all([
    inferOutcomeWithAI(messages),
    inferImpactWithAI(messages),
  ]);

  const ownerResult = inferPrimaryOwnerWithDetails(messages, requesterId);
  const deadlineResult = inferDeadline(messages, ownerTimezone || null);

  // Use AI outcome or fall back to keyword extraction
  const requiredOutcome = aiOutcome || inferOutcomeFromKeywords(messages);

  const lock: Partial<InferredLock> = {
    requiredOutcome,
    primaryOwner: ownerResult.owner,
    fallbackOwner: null, // Will be suggested separately via person-suggester
    deadline: deadlineResult.deadline,
    deadlineSource: deadlineResult.source,
    impactStatement: aiImpact,
  };

  const confidenceDetails = calculateConfidence(lock, deadlineResult, ownerResult.explicit);
  const missingField = getMissingField(lock);

  log.info("Lock inference complete", {
    hasOutcome: !!requiredOutcome,
    hasOwner: !!ownerResult.owner,
    hasDeadline: !!deadlineResult.deadline,
    deadlineSource: deadlineResult.source,
    confidence: confidenceDetails.overall,
    missingField,
  });

  return {
    requiredOutcome: requiredOutcome || null,
    primaryOwner: ownerResult.owner || null,
    fallbackOwner: null,
    deadline: deadlineResult.deadline || null,
    deadlineSource: deadlineResult.source,
    impactStatement: aiImpact || null,
    confidence: confidenceDetails.overall,
    confidenceDetails,
    missingField,
  };
}

/**
 * Infer primary owner with details about how they were detected
 */
function inferPrimaryOwnerWithDetails(
  messages: SlackMessage[],
  requesterId: string
): { owner: string | null; explicit: boolean } {
  const fullText = messages.map(m => m.text).join(' ');

  // Try explicit patterns first
  for (const pattern of OWNER_PATTERNS) {
    const match = fullText.match(pattern);
    if (match && match[1] && match[1] !== requesterId) {
      return { owner: match[1], explicit: true };
    }
  }

  // Fall back to most mentioned user (excluding requester)
  const allMentions = messages.flatMap(m => extractMentions(m.text));
  const mentionCounts = allMentions.reduce((acc, id) => {
    if (id !== requesterId) {
      acc[id] = (acc[id] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const sorted = Object.entries(mentionCounts).sort((a, b) => b[1] - a[1]);
  if (sorted.length > 0) {
    return { owner: sorted[0][0], explicit: false };
  }

  return { owner: null, explicit: false };
}

/**
 * Calculate next 8am in owner's timezone
 */
function getNextWorkStart(timezone: string, now: Date): Date {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      hour12: false,
    });
    const currentHour = parseInt(formatter.format(now), 10);

    // If before 8am, next work start is today at 8am
    // If 8am or later, next work start is tomorrow at 8am
    const hoursUntil8am = currentHour < 8 ? 8 - currentHour : 24 - currentHour + 8;
    return new Date(now.getTime() + hoursUntil8am * 60 * 60 * 1000);
  } catch {
    // Fallback: 16 hours from now
    return new Date(now.getTime() + 16 * 60 * 60 * 1000);
  }
}

/**
 * Calculate 6pm in owner's timezone (today or tomorrow if past 6pm)
 */
function getWorkEndToday(timezone: string, now: Date): Date {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      hour12: false,
    });
    const currentHour = parseInt(formatter.format(now), 10);

    // If past 6pm, use tomorrow at 6pm
    const hoursUntil6pm = currentHour < 18 ? 18 - currentHour : 24 - currentHour + 18;
    return new Date(now.getTime() + hoursUntil6pm * 60 * 60 * 1000);
  } catch {
    // Fallback: 8 hours from now
    return new Date(now.getTime() + 8 * 60 * 60 * 1000);
  }
}

/**
 * Get deadline options for the modal with timezone-aware options
 */
export function getDeadlineOptions(
  ownerTimezone?: string | null,
  ownerContext?: OwnerContext | null
): Array<{ label: string; value: string; description?: string; recommended?: boolean }> {
  const now = new Date();
  const tz = ownerTimezone || 'America/New_York';

  // Calculate owner's next work start (9am their time)
  const ownerNextWorkStart = getNextWorkStart(tz, now);

  // Calculate owner's work end (5pm their time)
  const ownerWorkEnd = getWorkEndToday(tz, now);

  // Calculate Friday 5 PM for "end of week"
  const fridayEvening = getNextFriday5PM(tz, now);

  // Determine which option to recommend based on context
  const currentHour = getCurrentHourInTimezone(tz);
  let recommendedIndex = 2; // Default: "End of their day"

  if (currentHour >= 15) {
    // After 3 PM, recommend "When they start tomorrow"
    recommendedIndex = 1;
  } else if (currentHour < 10) {
    // Before 10 AM, recommend "End of their day"
    recommendedIndex = 2;
  }

  const options = [
    {
      label: "In 3 hours",
      value: new Date(now.getTime() + 3 * 60 * 60 * 1000).toISOString(),
      description: "Urgent",
    },
    {
      label: "When they start tomorrow",
      value: ownerNextWorkStart.toISOString(),
      description: "9 AM their time",
    },
    {
      label: "End of their day",
      value: ownerWorkEnd.toISOString(),
      description: "5 PM their time",
    },
    {
      label: "In 24 hours",
      value: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      label: "End of week",
      value: fridayEvening.toISOString(),
      description: "Friday 5 PM their time",
    },
  ];

  // Mark the recommended option
  return options.map((opt, index) => ({
    ...opt,
    recommended: index === recommendedIndex,
  }));
}

/**
 * Smart person suggestions based on thread context and historical patterns
 */
export interface PersonSuggestion {
  userId: string;
  reason: string;
  score: number;  // 0-100 relevance score
  source: 'thread_participant' | 'mentioned' | 'historical';
}

/**
 * Suggest relevant people for lock assignment based on context
 */
export function suggestRelevantPeople(
  messages: SlackMessage[],
  requesterId: string,
  historicalPatterns?: Array<{ userId: string; lockCount: number }>
): PersonSuggestion[] {
  const suggestions: PersonSuggestion[] = [];
  const seenUsers = new Set<string>();

  // 1. Thread participants (people who have sent messages)
  const participants = messages
    .filter(m => m.user && m.user !== requesterId)
    .reduce((acc, m) => {
      acc[m.user] = (acc[m.user] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  Object.entries(participants)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .forEach(([userId, messageCount]) => {
      if (!seenUsers.has(userId)) {
        suggestions.push({
          userId,
          reason: `Active in thread (${messageCount} message${messageCount > 1 ? 's' : ''})`,
          score: Math.min(90, 50 + messageCount * 10),
          source: 'thread_participant',
        });
        seenUsers.add(userId);
      }
    });

  // 2. Mentioned users
  const mentions = messages.flatMap(m => extractMentions(m.text));
  const mentionCounts = mentions.reduce((acc, id) => {
    if (id !== requesterId) {
      acc[id] = (acc[id] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  Object.entries(mentionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .forEach(([userId, count]) => {
      if (!seenUsers.has(userId)) {
        suggestions.push({
          userId,
          reason: `Mentioned ${count} time${count > 1 ? 's' : ''} in thread`,
          score: Math.min(85, 40 + count * 15),
          source: 'mentioned',
        });
        seenUsers.add(userId);
      }
    });

  // 3. Historical patterns (if provided)
  if (historicalPatterns) {
    historicalPatterns
      .filter(p => !seenUsers.has(p.userId))
      .slice(0, 2)
      .forEach(pattern => {
        suggestions.push({
          userId: pattern.userId,
          reason: `${pattern.lockCount} previous lock${pattern.lockCount > 1 ? 's' : ''} from you`,
          score: Math.min(70, 30 + pattern.lockCount * 5),
          source: 'historical',
        });
        seenUsers.add(pattern.userId);
      });
  }

  // Sort by score and return top suggestions
  return suggestions.sort((a, b) => b.score - a.score).slice(0, 5);
}

/**
 * Format deadline for display (shows both relative and absolute)
 */
export function formatDeadline(
  deadline: Date,
  ownerTimezone?: string,
  requesterTimezone?: string
): string {
  const now = new Date();
  const diff = deadline.getTime() - now.getTime();
  const hours = Math.round(diff / (60 * 60 * 1000));

  let relative: string;
  if (hours < 1) {
    relative = "less than 1 hour";
  } else if (hours === 1) {
    relative = "1 hour";
  } else if (hours < 24) {
    relative = `${hours} hours`;
  } else {
    const days = Math.round(hours / 24);
    relative = days === 1 ? "1 day" : `${days} days`;
  }

  // Format absolute time
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  };

  const ownerTime = deadline.toLocaleTimeString('en-US', {
    ...timeOptions,
    timeZone: ownerTimezone || 'UTC',
  });

  return `${relative} (${ownerTime})`;
}
