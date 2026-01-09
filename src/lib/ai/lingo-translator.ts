/**
 * Cross-Team Lingo Translation
 *
 * Translates questions between team-specific terminology using Groq AI.
 * When a Sales person asks about "deal velocity issues," this translates it
 * to engineering-speak: "lead conversion performance in the pipeline."
 */

import { createClient } from '@/lib/supabase/server';
import { createLogger } from '@/lib/logger';

const log = createLogger({ service: 'lingo-translator' });

export interface LingoProfile {
  department: string;
  terms: Array<{ term: string; meaning: string; context?: string }>;
  communicationStyle: string | null;
  commonPhrases: string[];
}

export interface TermMapping {
  sourceTerm: string;
  targetTerm: string;
  confidence: number;
}

export interface TranslationResult {
  translatedQuestion: string;
  originalQuestion: string;
  sourceDepartment: string;
  targetDepartment: string;
  wasTranslated: boolean;
}

/**
 * Fetch lingo profile for a department
 */
async function getLingoProfile(
  organizationId: string,
  department: string
): Promise<LingoProfile | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('department_lingo_profiles')
    .select('department, terms, communication_style, common_phrases')
    .eq('organization_id', organizationId)
    .eq('department', department)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    department: data.department,
    terms: (data.terms as LingoProfile['terms']) || [],
    communicationStyle: data.communication_style,
    commonPhrases: (data.common_phrases as string[]) || [],
  };
}

/**
 * Fetch known term translations between departments
 */
async function getKnownTranslations(
  organizationId: string,
  sourceDepartment: string,
  targetDepartment: string
): Promise<TermMapping[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('term_translations')
    .select('source_term, target_term, confidence')
    .eq('organization_id', organizationId)
    .eq('source_department', sourceDepartment)
    .eq('target_department', targetDepartment)
    .gte('confidence', 50) // Only use high-confidence translations
    .order('confidence', { ascending: false })
    .limit(20);

  if (error || !data) {
    return [];
  }

  return data.map(t => ({
    sourceTerm: t.source_term,
    targetTerm: t.target_term,
    confidence: t.confidence,
  }));
}

/**
 * Build the prompt for Groq to translate between department lingos
 */
function buildTranslationPrompt(
  originalText: string,
  sourceDept: string,
  targetDept: string,
  sourceLingo: LingoProfile | null,
  targetLingo: LingoProfile | null,
  knownTranslations: TermMapping[]
): string {
  let termMappings = '';
  if (knownTranslations.length > 0) {
    termMappings = `\nKnown translations: ${knownTranslations.map(t => `${t.sourceTerm}→${t.targetTerm}`).join(', ')}\n`;
  }

  return `Translate this ${sourceDept} skill into ${targetDept} terms.

Input: "${originalText}"
${termMappings}
RULES:
- Keep it SHORT. Match the input length. 2-word input = 2-4 word output.
- Just translate the jargon, don't explain what it means.
- Sound like a person, not a corporate memo.
- No full sentences unless the input was a full sentence.
- Never start with "How can we" or "Ability to" or "Helps with".

EXAMPLES:
Good: "scalable APIs" → "handles customer growth"
Bad: "scalable APIs" → "How can we ensure our systems handle large numbers of customers..."

Good: "performance optimization" → "makes things faster"
Bad: "performance optimization" → "Streamlining processes to improve speed and efficiency"

Good: "CI/CD pipelines" → "automated releases"
Bad: "CI/CD pipelines" → "Systems that help deploy code automatically to production"

Output the translation only. No quotes, no explanation.`;
}

/**
 * Main translation function
 * Translates a question from one department's lingo to another
 */
export async function translateToLingo(
  originalQuestion: string,
  sourceDepartment: string,
  targetDepartment: string,
  organizationId: string
): Promise<TranslationResult> {
  // If same department, no translation needed
  if (sourceDepartment.toLowerCase() === targetDepartment.toLowerCase()) {
    return {
      translatedQuestion: originalQuestion,
      originalQuestion,
      sourceDepartment,
      targetDepartment,
      wasTranslated: false,
    };
  }

  // Check for API key
  if (!process.env.GROQ_API_KEY) {
    log.warn('GROQ_API_KEY not configured - skipping lingo translation');
    return {
      translatedQuestion: originalQuestion,
      originalQuestion,
      sourceDepartment,
      targetDepartment,
      wasTranslated: false,
    };
  }

  try {
    // Fetch lingo profiles and known translations in parallel
    const [sourceLingo, targetLingo, knownTranslations] = await Promise.all([
      getLingoProfile(organizationId, sourceDepartment),
      getLingoProfile(organizationId, targetDepartment),
      getKnownTranslations(organizationId, sourceDepartment, targetDepartment),
    ]);

    // Build the translation prompt
    const prompt = buildTranslationPrompt(
      originalQuestion,
      sourceDepartment,
      targetDepartment,
      sourceLingo,
      targetLingo,
      knownTranslations
    );

    // Call Groq API
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'user', content: prompt },
        ],
        temperature: 0.2, // Low temperature for consistent, concise translations
        max_tokens: 50, // Keep outputs short
      }),
    });

    if (!response.ok) {
      const error = await response.text();

      if (response.status === 429) {
        log.warn('Groq rate limit hit during translation');
      } else {
        log.error('Groq API error during translation', { status: response.status, error });
      }

      // Return original question on error
      return {
        translatedQuestion: originalQuestion,
        originalQuestion,
        sourceDepartment,
        targetDepartment,
        wasTranslated: false,
      };
    }

    const data = await response.json();
    const translatedText = data.choices?.[0]?.message?.content?.trim();

    if (!translatedText) {
      log.error('Empty response from Groq during translation');
      return {
        translatedQuestion: originalQuestion,
        originalQuestion,
        sourceDepartment,
        targetDepartment,
        wasTranslated: false,
      };
    }

    // Log the translation event for learning
    await logTranslationEvent(
      organizationId,
      null, // userId will be set by the caller if available
      sourceDepartment,
      targetDepartment,
      originalQuestion,
      translatedText
    );

    log.info('Translated question between departments', {
      sourceDepartment,
      targetDepartment,
      originalLength: originalQuestion.length,
      translatedLength: translatedText.length,
    });

    return {
      translatedQuestion: translatedText,
      originalQuestion,
      sourceDepartment,
      targetDepartment,
      wasTranslated: true,
    };
  } catch (error) {
    log.error('Lingo translation error', { error });
    return {
      translatedQuestion: originalQuestion,
      originalQuestion,
      sourceDepartment,
      targetDepartment,
      wasTranslated: false,
    };
  }
}

/**
 * Log a translation event for analytics and learning
 */
export async function logTranslationEvent(
  organizationId: string,
  userId: string | null,
  sourceDepartment: string,
  targetDepartment: string,
  originalText: string,
  translatedText: string
): Promise<void> {
  try {
    const supabase = await createClient();

    await supabase.from('translation_events').insert({
      organization_id: organizationId,
      user_id: userId,
      source_department: sourceDepartment,
      target_department: targetDepartment,
      original_text: originalText,
      translated_text: translatedText,
    });
  } catch (error) {
    // Don't fail the translation if logging fails
    log.error('Failed to log translation event', { error });
  }
}

/**
 * Record user feedback on a translation
 */
export async function recordTranslationFeedback(
  translationEventId: string,
  wasHelpful: boolean,
  feedback?: string
): Promise<boolean> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('translation_events')
      .update({
        was_helpful: wasHelpful,
        feedback: feedback || null,
      })
      .eq('id', translationEventId);

    if (error) {
      log.error('Failed to record translation feedback', { error });
      return false;
    }

    return true;
  } catch (error) {
    log.error('Error recording translation feedback', { error });
    return false;
  }
}

/**
 * Get or create a department lingo profile with default values
 */
export async function ensureLingoProfile(
  organizationId: string,
  department: string
): Promise<LingoProfile> {
  const existing = await getLingoProfile(organizationId, department);

  if (existing) {
    return existing;
  }

  // Create a default profile for the department
  const supabase = await createClient();

  const defaultProfile: LingoProfile = {
    department,
    terms: [],
    communicationStyle: getDefaultCommunicationStyle(department),
    commonPhrases: [],
  };

  await supabase.from('department_lingo_profiles').insert({
    organization_id: organizationId,
    department,
    terms: defaultProfile.terms,
    communication_style: defaultProfile.communicationStyle,
    common_phrases: defaultProfile.commonPhrases,
  });

  return defaultProfile;
}

/**
 * Get a default communication style based on common department patterns
 */
function getDefaultCommunicationStyle(department: string): string {
  const styles: Record<string, string> = {
    engineering: 'Technical, precise, focuses on implementation details and system behavior',
    sales: 'Results-oriented, uses revenue metrics (MRR, ARR), focuses on customer impact',
    marketing: 'Brand-aware, uses campaign metrics (CAC, LTV), focuses on positioning',
    product: 'User-centric, uses product metrics (DAU, retention), balances technical and business',
    design: 'Visual-focused, emphasizes user experience and accessibility',
    finance: 'Numbers-driven, uses financial metrics and compliance terminology',
    legal: 'Precise, risk-focused, uses regulatory and contractual language',
    hr: 'People-focused, uses compliance and policy terminology',
    support: 'Customer-focused, uses ticket and satisfaction metrics',
    ops: 'Process-focused, uses efficiency and workflow terminology',
  };

  const normalizedDept = department.toLowerCase();

  // Check for partial matches
  for (const [key, style] of Object.entries(styles)) {
    if (normalizedDept.includes(key) || key.includes(normalizedDept)) {
      return style;
    }
  }

  return 'Professional, clear communication';
}

/**
 * Expand a search query for cross-department matching
 *
 * Takes a query in the user's department language and expands it
 * with synonyms and terminology from other departments to improve
 * cross-functional search results.
 */
export interface QueryExpansionResult {
  originalQuery: string;
  expandedQuery: string;
  wasExpanded: boolean;
  sourceDepartment: string | null;
}

export async function expandQueryForSearch(
  query: string,
  userDepartment: string | null,
  organizationId: string
): Promise<QueryExpansionResult> {
  // If no department or no API key, return original
  if (!userDepartment || !process.env.GROQ_API_KEY) {
    return {
      originalQuery: query,
      expandedQuery: query,
      wasExpanded: false,
      sourceDepartment: userDepartment,
    };
  }

  try {
    // Get user's lingo profile for context
    const userLingo = await getLingoProfile(organizationId, userDepartment);

    const prompt = `You are a search query expander for a workplace expertise-finding tool.

CONTEXT:
- User is from the ${userDepartment} department
- They're searching for someone who can help with: "${query}"
${userLingo?.communicationStyle ? `- Their department typically: ${userLingo.communicationStyle}` : ''}

TASK:
Expand this query with synonyms and equivalent terms from other departments so we can find experts across the organization.

For example:
- "deal velocity" (Sales) → also search: "lead conversion rate", "pipeline throughput", "sales cycle speed"
- "tech debt" (Engineering) → also search: "code maintenance", "legacy system issues", "refactoring needs"
- "churn rate" (Product) → also search: "customer retention", "user drop-off", "subscription cancellation"

OUTPUT FORMAT:
Return a single search string that combines the original query with 3-5 equivalent terms from other departments.
Format: "original query" OR "synonym1" OR "synonym2" OR "synonym3"

Only output the expanded search string, nothing else.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        log.warn('Groq rate limit hit during query expansion');
      } else {
        log.error('Groq API error during query expansion', { status: response.status });
      }
      return {
        originalQuery: query,
        expandedQuery: query,
        wasExpanded: false,
        sourceDepartment: userDepartment,
      };
    }

    const data = await response.json();
    const expandedQuery = data.choices?.[0]?.message?.content?.trim();

    if (!expandedQuery) {
      return {
        originalQuery: query,
        expandedQuery: query,
        wasExpanded: false,
        sourceDepartment: userDepartment,
      };
    }

    log.info('Expanded search query', {
      originalQuery: query,
      expandedLength: expandedQuery.length,
      department: userDepartment,
    });

    return {
      originalQuery: query,
      expandedQuery,
      wasExpanded: true,
      sourceDepartment: userDepartment,
    };
  } catch (error) {
    log.error('Query expansion error', { error });
    return {
      originalQuery: query,
      expandedQuery: query,
      wasExpanded: false,
      sourceDepartment: userDepartment,
    };
  }
}
