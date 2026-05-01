import { timingSafeEqual } from 'crypto';

/**
 * Validates x-internal-secret against PLATFORM_API_SECRET using a safe constant-time check.
 */
export function isValidInternalSecret(headers: Headers): boolean {
  const provided = headers.get('x-internal-secret');
  const expected = process.env.PLATFORM_API_SECRET;

  if (!provided || !expected || provided.length !== expected.length) {
    return false;
  }

  try {
    return timingSafeEqual(Buffer.from(provided), Buffer.from(expected));
  } catch {
    return false;
  }
}