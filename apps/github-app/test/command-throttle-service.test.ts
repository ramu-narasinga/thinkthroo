import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@/utils/env', () => ({
  env: {
    PLATFORM_API_URL: 'https://platform.example.com',
    PLATFORM_API_SECRET: 'secret',
  },
}));

import { CommandThrottleService } from '../src/services/commands/CommandThrottleService';

describe('CommandThrottleService', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns parsed response when platform returns success', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true,
      json: async () => ({ allowed: false, retryAfterSeconds: 42, remaining: 0 }),
    })) as any);

    const service = new CommandThrottleService();
    const result = await service.check('1', 'acme/repo', 'alice', 'review');

    expect(result).toEqual({ allowed: false, retryAfterSeconds: 42, remaining: 0 });
  });

  it('fails open when platform returns non-200', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: false,
      status: 500,
      text: async () => 'boom',
    })) as any);

    const service = new CommandThrottleService();
    const result = await service.check('1', 'acme/repo', 'alice', 'review');

    expect(result).toEqual({ allowed: true });
  });

  it('fails open on network error', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => {
      throw new Error('network error');
    }) as any);

    const service = new CommandThrottleService();
    const result = await service.check('1', 'acme/repo', 'alice', 'review');

    expect(result).toEqual({ allowed: true });
  });
});
