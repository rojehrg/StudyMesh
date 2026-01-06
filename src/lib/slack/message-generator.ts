/**
 * AI Message Generator for Slack "Ask for Help"
 *
 * Uses Groq (FREE tier) with Llama 3.1 to generate low-pressure,
 * contextual messages that reduce social friction when asking for help.
 *
 * This is the HERO VALUE of Attunly - making "how to ask" effortless.
 */

interface MessageGeneratorConfig {
  context: string;
  recipientName?: string;
  senderName?: string;
}

interface GeneratedMessage {
  message: string;
  fallback: boolean; // true if AI failed and we used template
}

/**
 * Generates a polished, low-pressure help request message.
 *
 * The tone should:
 * - Be respectful and non-urgent
 * - Give the recipient an easy out
 * - Feel natural, not robotic
 * - Be concise but complete
 */
export async function generateHelpMessage(
  config: MessageGeneratorConfig
): Promise<GeneratedMessage> {
  const { context, recipientName, senderName } = config;

  // If Groq isn't configured, use fallback template
  if (!process.env.GROQ_API_KEY) {
    console.warn('[Message Generator] GROQ_API_KEY not configured');
    return {
      message: generateFallbackMessage(context, recipientName),
      fallback: true,
    };
  }

  const systemPrompt = `You write brief, friendly Slack messages for someone asking a coworker for help.

Your messages should:
- Be 2-4 sentences max
- Sound natural and human (not robotic or formal)
- Include a low-pressure phrase like "when you have a sec" or "no rush"
- Give the recipient an easy out like "if you're busy, no worries"
- NOT include greetings like "Hey [Name]!" - the system adds those
- NOT include signatures or sign-offs
- Focus on the ask, not small talk

Example outputs:
- "Quick question about the payments API - I'm seeing some weird 500 errors on checkout. Mind taking a look when you have a sec? No rush if you're heads-down."
- "Working on the onboarding flow and hit a wall with the OAuth redirect. Would love 5 mins to bounce ideas if you're free, but totally understand if not."
- "Could use a second pair of eyes on this PR. Nothing urgent, just want to make sure I'm not missing something obvious."`;

  const userPrompt = `Write a help request message for this context:
"${context.trim()}"

${recipientName ? `The message is for ${recipientName}.` : 'The recipient is not yet selected.'}
${senderName ? `The sender's name is ${senderName}.` : ''}

Return ONLY the message text, no quotes or formatting.`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7, // Slightly creative for natural-sounding messages
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      const error = await response.text();

      if (response.status === 429) {
        console.warn('[Message Generator] Groq rate limit hit');
      } else {
        console.error('[Message Generator] Groq API error:', response.status, error);
      }

      return {
        message: generateFallbackMessage(context, recipientName),
        fallback: true,
      };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim();

    if (!content) {
      console.error('[Message Generator] No content in Groq response');
      return {
        message: generateFallbackMessage(context, recipientName),
        fallback: true,
      };
    }

    // Clean up any accidental quotes or formatting
    const cleanedMessage = content
      .replace(/^["']|["']$/g, '') // Remove surrounding quotes
      .replace(/^\*\*|\*\*$/g, '') // Remove markdown bold
      .trim();

    return {
      message: cleanedMessage,
      fallback: false,
    };
  } catch (error) {
    console.error('[Message Generator] Error:', error);
    return {
      message: generateFallbackMessage(context, recipientName),
      fallback: true,
    };
  }
}

/**
 * Fallback message template when AI is unavailable.
 * Still aims to be low-pressure and friendly.
 */
function generateFallbackMessage(context: string, recipientName?: string): string {
  const trimmedContext = context.trim();

  // Very short context - inline it
  if (trimmedContext.length < 30) {
    return `Quick question when you have a sec - ${trimmedContext.toLowerCase().replace(/\.$/, '')}. No rush if you're busy.`;
  }

  // Longer context - format as block
  return `Quick question when you have a sec.\n\n${trimmedContext}\n\nNo rush if you're busy - happy to wait for a good time.`;
}

/**
 * Builds the full message with greeting for Slack DM.
 */
export function buildFullMessage(
  generatedMessage: string,
  recipientName?: string
): string {
  const greeting = recipientName ? `Hey ${recipientName}! ` : 'Hey! ';
  return greeting + generatedMessage;
}
