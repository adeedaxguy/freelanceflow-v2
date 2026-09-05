import "server-only";

import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

const PREFIX = "enc:v1:";
const IV_BYTES = 12;

function key(): Buffer {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("NEXTAUTH_SECRET not configured");
  return createHash("sha256").update(secret).digest();
}

/** Encrypt a small credential before it is persisted in the database. */
export function sealSecret(value: string): string {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const ciphertext = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${PREFIX}${iv.toString("base64url")}.${tag.toString("base64url")}.${ciphertext.toString("base64url")}`;
}

/** Decrypt a value written by sealSecret; invalid values fail closed. */
export function openSecret(value: string): string | null {
  if (!value.startsWith(PREFIX)) return null;
  try {
    const [ivText, tagText, ciphertextText] = value.slice(PREFIX.length).split(".");
    if (!ivText || !tagText || !ciphertextText) return null;
    const iv = Buffer.from(ivText, "base64url");
    const tag = Buffer.from(tagText, "base64url");
    const ciphertext = Buffer.from(ciphertextText, "base64url");
    if (iv.length !== IV_BYTES || tag.length !== 16 || ciphertext.length === 0) return null;

    const decipher = createDecipheriv("aes-256-gcm", key(), iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
  } catch {
    return null;
  }
}

/** Read new encrypted values and legacy plaintext values during migration. */
export function readStoredSecret(value: string): string | null {
  return value.startsWith(PREFIX) ? openSecret(value) : value;
}
