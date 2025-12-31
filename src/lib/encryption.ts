/**
 * Token encryption utilities using AES-256-GCM
 *
 * Requires ENCRYPTION_KEY environment variable (32-byte hex string)
 * Generate with: openssl rand -hex 32
 */

import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // GCM recommended IV length
const AUTH_TAG_LENGTH = 16;

function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;

  if (!key) {
    throw new Error("ENCRYPTION_KEY environment variable is not set");
  }

  // Key should be 32 bytes (64 hex characters) for AES-256
  if (key.length !== 64) {
    throw new Error("ENCRYPTION_KEY must be 64 hex characters (32 bytes)");
  }

  return Buffer.from(key, "hex");
}

/**
 * Encrypt a plaintext string
 * Returns base64-encoded string: iv:authTag:ciphertext
 */
export function encrypt(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);

  const cipher = createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, "utf8", "base64");
  encrypted += cipher.final("base64");

  const authTag = cipher.getAuthTag();

  // Combine iv, authTag, and ciphertext
  return `${iv.toString("base64")}:${authTag.toString("base64")}:${encrypted}`;
}

/**
 * Decrypt an encrypted string
 * Expects base64-encoded string: iv:authTag:ciphertext
 */
export function decrypt(encryptedData: string): string {
  const key = getEncryptionKey();

  const parts = encryptedData.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted data format");
  }

  const [ivBase64, authTagBase64, ciphertext] = parts;

  const iv = Buffer.from(ivBase64, "base64");
  const authTag = Buffer.from(authTagBase64, "base64");

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(ciphertext, "base64", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

/**
 * Safely encrypt a token, returning null if encryption fails or token is empty
 */
export function encryptToken(token: string | null | undefined): string | null {
  if (!token) return null;

  try {
    // Check if ENCRYPTION_KEY is available
    if (!process.env.ENCRYPTION_KEY) {
      console.warn("[Encryption] ENCRYPTION_KEY not set, storing token unencrypted");
      return token;
    }
    return encrypt(token);
  } catch (error) {
    console.error("[Encryption] Failed to encrypt token:", error);
    return token; // Fallback to unencrypted if encryption fails
  }
}

/**
 * Safely decrypt a token, returning the original value if decryption fails
 * This handles both encrypted and legacy unencrypted tokens
 */
export function decryptToken(encryptedToken: string | null | undefined): string | null {
  if (!encryptedToken) return null;

  try {
    // Check if ENCRYPTION_KEY is available
    if (!process.env.ENCRYPTION_KEY) {
      return encryptedToken;
    }

    // Check if token looks encrypted (has the iv:authTag:ciphertext format)
    if (!encryptedToken.includes(":")) {
      // Likely a legacy unencrypted token
      return encryptedToken;
    }

    return decrypt(encryptedToken);
  } catch (error) {
    // If decryption fails, assume it's a legacy unencrypted token
    console.warn("[Encryption] Decryption failed, assuming legacy token");
    return encryptedToken;
  }
}

/**
 * Check if a token appears to be encrypted
 */
export function isEncrypted(token: string | null | undefined): boolean {
  if (!token) return false;

  const parts = token.split(":");
  if (parts.length !== 3) return false;

  // Check if parts look like base64
  try {
    Buffer.from(parts[0], "base64");
    Buffer.from(parts[1], "base64");
    Buffer.from(parts[2], "base64");
    return true;
  } catch {
    return false;
  }
}
