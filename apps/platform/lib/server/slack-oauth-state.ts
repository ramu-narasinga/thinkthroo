import { createHmac, timingSafeEqual } from 'crypto';

const STATE_TTL_MS = 10 * 60 * 1000;

function signPayload(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('hex');
}

function safeEqualHex(a: string, b: string): boolean {
  if (!a || !b || a.length !== b.length) {
    return false;
  }

  try {
    return timingSafeEqual(Buffer.from(a), Buffer.from(b));
  } catch {
    return false;
  }
}

export function createSignedSlackOAuthState(orgId: string, csrfToken: string, secret: string): string {
  const issuedAt = Date.now();
  const payload = `${orgId}:${csrfToken}:${issuedAt}`;
  const signature = signPayload(payload, secret);
  return `${payload}:${signature}`;
}

export function parseAndVerifySlackOAuthState(
  state: string | null,
  secret: string,
): { valid: true; orgId: string; csrfToken: string } | { valid: false } {
  if (!state) {
    return { valid: false };
  }

  const parts = state.split(':');
  if (parts.length < 4) {
    return { valid: false };
  }

  const signature = parts.pop()!;
  const issuedAtRaw = parts.pop()!;
  const csrfToken = parts.pop()!;
  const orgId = parts.join(':');

  const issuedAt = Number(issuedAtRaw);
  if (!Number.isFinite(issuedAt)) {
    return { valid: false };
  }

  const age = Date.now() - issuedAt;
  if (age < -60_000 || age > STATE_TTL_MS) {
    return { valid: false };
  }

  const payload = `${orgId}:${csrfToken}:${issuedAtRaw}`;
  const expectedSignature = signPayload(payload, secret);
  if (!safeEqualHex(signature, expectedSignature)) {
    return { valid: false };
  }

  return { valid: true, orgId, csrfToken };
}
