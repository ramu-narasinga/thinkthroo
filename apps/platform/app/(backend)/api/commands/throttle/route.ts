import { NextRequest, NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { redis } from '@/lib/upstash';
import { isValidInternalSecret } from '@/lib/server/internal-auth';
import { trackPlatformSecuritySignal } from '@/lib/server/security-alerts';

const COMMAND_LIMIT = 1;
const COMMAND_WINDOW = '2 m';

export async function POST(req: NextRequest) {
  if (!isValidInternalSecret(req.headers)) {
    await trackPlatformSecuritySignal({
      signal: 'internal_auth_failed_commands_throttle',
      threshold: 3,
      windowSeconds: 60,
      text: ':rotating_light: Repeated failed internal auth on /api/commands/throttle.',
      fields: {
        route: '/api/commands/throttle',
      },
    });
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: {
    installationId?: string;
    repoFullName?: string;
    userLogin?: string;
    command?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { installationId, repoFullName, userLogin, command } = body;
  if (!installationId || !repoFullName || !userLogin || !command) {
    return NextResponse.json(
      { error: 'installationId, repoFullName, userLogin, and command are required' },
      { status: 400 },
    );
  }

  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(COMMAND_LIMIT, COMMAND_WINDOW),
    prefix: 'thinkthroo:command_throttle',
  });

  const key = `${installationId}:${repoFullName}:${userLogin}:${command}`;
  const { success, remaining, reset } = await limiter.limit(key);

  if (!success) {
    const retryAfterSeconds = Math.ceil((reset - Date.now()) / 1000);
    await trackPlatformSecuritySignal({
      signal: 'command_throttled',
      threshold: 5,
      windowSeconds: 60,
      text: ':warning: Elevated command throttling events detected.',
      fields: {
        installationId,
        repoFullName,
        command,
      },
    });

    return NextResponse.json({
      allowed: false,
      retryAfterSeconds,
      remaining,
    });
  }

  return NextResponse.json({
    allowed: true,
    remaining,
  });
}
