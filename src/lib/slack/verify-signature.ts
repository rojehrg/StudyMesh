import crypto from 'crypto';

/**
 * Verifies that a request came from Slack using the signing secret.
 *
 * Slack sends:
 * - X-Slack-Request-Timestamp: Unix timestamp of request
 * - X-Slack-Signature: v0=<HMAC-SHA256 signature>
 *
 * We verify by computing our own signature and comparing.
 * Also checks timestamp to prevent replay attacks (5 min window).
 */
export function verifySlackSignature(
  signingSecret: string,
  timestamp: string,
  body: string,
  signature: string
): boolean {
  // Prevent replay attacks - reject if timestamp is more than 5 minutes old
  const fiveMinutesAgo = Math.floor(Date.now() / 1000) - 60 * 5;
  if (parseInt(timestamp, 10) < fiveMinutesAgo) {
    console.warn('[Slack] Request timestamp too old, possible replay attack');
    return false;
  }

  // Compute the signature
  const sigBaseString = `v0:${timestamp}:${body}`;
  const mySignature = 'v0=' + crypto
    .createHmac('sha256', signingSecret)
    .update(sigBaseString, 'utf8')
    .digest('hex');

  // Use timing-safe comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(mySignature, 'utf8'),
      Buffer.from(signature, 'utf8')
    );
  } catch {
    // Lengths don't match
    return false;
  }
}

/**
 * Extracts and verifies Slack signature from request headers.
 * Returns true if valid, false otherwise.
 */
export async function verifySlackRequest(
  request: Request,
  body: string
): Promise<boolean> {
  const signingSecret = process.env.SLACK_SIGNING_SECRET;

  if (!signingSecret) {
    console.error('[Slack] SLACK_SIGNING_SECRET not configured');
    return false;
  }

  const timestamp = request.headers.get('x-slack-request-timestamp');
  const signature = request.headers.get('x-slack-signature');

  if (!timestamp || !signature) {
    console.warn('[Slack] Missing timestamp or signature headers');
    return false;
  }

  return verifySlackSignature(signingSecret, timestamp, body, signature);
}
