// PROVIDED: do not edit.
// Pickup codes: six random digits, shown once, stored only as a keyed fingerprint.
//
// Note: the real backend stores an HMAC-SHA-256 of the code. Code running in a browser has no secret
// it can hide, so this fingerprint (FNV-1a, 64-bit) only keeps the plain code out of the stored data.

/** A new pickup code: six digits from a cryptographic random source. */
export function newCode() {
  const n = globalThis.crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000;
  return String(n).padStart(6, '0');
}

/** The code's keyed fingerprint: 16 hex characters. Only this is stored, never the code. */
export function hashCode(code, key) {
  let h = 0xcbf29ce484222325n;
  for (const ch of `${key}:${code}:${key}`) {
    h ^= BigInt(ch.charCodeAt(0));
    h = (h * 0x100000001b3n) & 0xffffffffffffffffn;
  }
  return h.toString(16).padStart(16, '0');
}

/** Whether a presented code is the one behind a stored fingerprint, compared in constant time. */
export function codeMatches(code, storedHash, key) {
  const presented = hashCode(code, key);
  if (presented.length !== storedHash.length) return false;
  let diff = 0;
  for (let i = 0; i < presented.length; i++) diff |= presented.charCodeAt(i) ^ storedHash.charCodeAt(i);
  return diff === 0;
}
