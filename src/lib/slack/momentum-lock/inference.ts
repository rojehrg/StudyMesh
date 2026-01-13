/**
 * Momentum Lock Inference Module
 *
 * Uses AI to extract lock fields from Slack thread context.
 * Follows the "single question" rule - if critical field missing, only ask one.
 */

import { createLogger } from "@/lib/logger";

const log = createLogger({ service: "momentum-lock" });

// Slack message structure (simplified)
export interface SlackMessage {
  user: string;          // Slack user ID
  text: string;
  ts: string;            // Timestamp
  thread_ts?: string;
  type: string;
}

// Inferred lock fields
export interface InferredLock {
  requiredOutcome: string | null;
  primaryOwner: string | null;      // Slack user ID
  fallbackOwner: string | null;     // Slack user ID
  deadline: Date | null;
  impactStatement: string | null;
  confidence: 'high' | 'medium' | 'low';
  missingField: 'owner' | 'deadline' | 'outcome' | null;  // Most critical missing field
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

// Patterns for detecting deadlines
const DEADLINE_PATTERNS = [
  { pattern: /(?:due|by|before|need(?:ed)?(?:\s+by)?)\s+(?:end of day|eod|today)/i, hours: 8 },
  { pattern: /(?:due|by|before|need(?:ed)?(?:\s+by)?)\s+tomorrow/i, hours: 24 },
  { pattern: /(?:due|by|before|need(?:ed)?(?:\s+by)?)\s+(?:next|this)\s+week/i, hours: 120 },
  { pattern: /asap|urgent|immediately/i, hours: 3 },
  { pattern: /(?:due|by|before)\s+(\d{1,2})\s*(?:am|pm)/i, hours: null }, // Parse specific time
];

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

/**
 * Detect primary owner from thread messages
 */
function inferPrimaryOwner(messages: SlackMessage[], requesterId: string): string | null {
  const fullText = messages.map(m => m.text).join(' ');

  // Try explicit patterns first
  for (const pattern of OWNER_PATTERNS) {
    const match = fullText.match(pattern);
    if (match && match[1] && match[1] !== requesterId) {
      return match[1];
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
  return sorted.length > 0 ? sorted[0][0] : null;
}

/**
 * Detect deadline from thread messages
 */
function inferDeadline(messages: SlackMessage[]): Date | null {
  const fullText = messages.map(m => m.text).join(' ');
  const now = new Date();

  for (const { pattern, hours } of DEADLINE_PATTERNS) {
    if (pattern.test(fullText)) {
      if (hours !== null) {
        return new Date(now.getTime() + hours * 60 * 60 * 1000);
      }
    }
  }

  // Default: tomorrow morning (8 hours from now if after 5pm, else next 9am)
  return null;
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
 * Calculate confidence based on what was inferred
 */
function calculateConfidence(lock: Partial<InferredLock>): 'high' | 'medium' | 'low' {
  let score = 0;
  if (lock.primaryOwner) score += 2;
  if (lock.requiredOutcome) score += 2;
  if (lock.deadline) score += 1;

  if (score >= 4) return 'high';
  if (score >= 2) return 'medium';
  return 'low';
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
  teamId: string
): Promise<InferredLock> {
  log.info("Inferring lock from thread", { messageCount: messages.length, requesterId });

  if (messages.length === 0) {
    return {
      requiredOutcome: null,
      primaryOwner: null,
      fallbackOwner: null,
      deadline: null,
      impactStatement: null,
      confidence: 'low',
      missingField: 'owner',
    };
  }

  // Run inferences in parallel
  const [aiOutcome, aiImpact] = await Promise.all([
    inferOutcomeWithAI(messages),
    inferImpactWithAI(messages),
  ]);

  const primaryOwner = inferPrimaryOwner(messages, requesterId);
  const deadline = inferDeadline(messages);

  // Use AI outcome or fall back to keyword extraction
  const requiredOutcome = aiOutcome || inferOutcomeFromKeywords(messages);

  const lock: Partial<InferredLock> = {
    requiredOutcome,
    primaryOwner,
    fallbackOwner: null, // Will be suggested separately via person-suggester
    deadline,
    impactStatement: aiImpact,
  };

  const confidence = calculateConfidence(lock);
  const missingField = getMissingField(lock);

  log.info("Lock inference complete", {
    hasOutcome: !!requiredOutcome,
    hasOwner: !!primaryOwner,
    hasDeadline: !!deadline,
    confidence,
    missingField,
  });

  return {
    requiredOutcome: requiredOutcome || null,
    primaryOwner: primaryOwner || null,
    fallbackOwner: null,
    deadline: deadline || null,
    impactStatement: aiImpact || null,
    confidence,
    missingField,
  };
}

/**
 * Get default deadline options for the modal
 */
export function getDeadlineOptions(ownerTimezone?: string): Array<{ label: string; value: string; }> {
  const now = new Date();

  return [
    {
      label: "In 3 hours",
      value: new Date(now.getTime() + 3 * 60 * 60 * 1000).toISOString(),
    },
    {
      label: "End of my day",
      value: new Date(now.getTime() + 8 * 60 * 60 * 1000).toISOString(),
    },
    {
      label: "Tomorrow morning",
      value: new Date(now.getTime() + 16 * 60 * 60 * 1000).toISOString(),
    },
    {
      label: "In 24 hours",
      value: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
    },
  ];
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
