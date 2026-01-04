/**
 * AI-powered semantic search for Find Help
 * Uses Groq (FREE tier: 30 req/min, 14,400/day) with Llama 3.1
 *
 * Get your free API key at: https://console.groq.com
 */

interface ExpertiseProfile {
  user_id: string;
  first_name: string;
  last_name: string;
  expertise_text: string;
  department?: string;
  major?: string;
}

interface MatchResult {
  user_id: string;
  score: number;
  reason: string;
}

/**
 * Use LLM to semantically match a query against expertise profiles
 */
export async function semanticMatch(
  query: string,
  profiles: ExpertiseProfile[],
): Promise<MatchResult[]> {
  if (!process.env.GROQ_API_KEY) {
    console.warn('GROQ_API_KEY not configured - add it to .env.local');
    return [];
  }

  if (profiles.length === 0) {
    return [];
  }

  // Build concise prompt for speed
  const profileList = profiles.map((p, i) =>
    `${i + 1}. [${p.user_id}] ${p.first_name} ${p.last_name}${p.department ? ` (${p.department})` : ''}: ${p.expertise_text}`
  ).join('\n');

  const systemPrompt = `You match help requests to experts. Return ONLY a JSON array:
[{"user_id":"exact-id-from-list", "score":0-100, "reason":"5 words max"}]
Rules:
- Only include people with score > 30
- Sort by score descending
- Match semantic meaning, not just keywords
- Return [] if no good matches
- NO markdown, NO explanation, ONLY valid JSON`;

  const userPrompt = `Request: "${query}"

People:
${profileList}`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.1,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const error = await response.text();

      // Handle rate limiting
      if (response.status === 429) {
        const retryAfter = response.headers.get('retry-after');
        console.warn(`Groq rate limit hit. Retry after: ${retryAfter}s. Falling back to text search.`);
        // Return special marker so the API can inform the user
        return [{ user_id: '__RATE_LIMITED__', score: 0, reason: `Rate limit - retry in ${retryAfter}s` }];
      }

      console.error('Groq API error:', response.status, error);
      return [];
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error('No content in Groq response');
      return [];
    }

    // Parse the JSON response
    try {
      const jsonStr = content.replace(/```json\n?|\n?```/g, '').trim();
      const results: MatchResult[] = JSON.parse(jsonStr);

      // Validate results have valid user_ids from our profiles
      const validUserIds = new Set(profiles.map(p => p.user_id));
      const validResults = results.filter(r =>
        validUserIds.has(r.user_id) &&
        typeof r.score === 'number' &&
        r.score > 30
      );

      return validResults.sort((a, b) => b.score - a.score);
    } catch (parseError) {
      console.error('Failed to parse Groq response:', content);
      return [];
    }
  } catch (error) {
    console.error('Semantic search error:', error);
    return [];
  }
}
