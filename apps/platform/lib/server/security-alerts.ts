import { redis } from '@/lib/upstash';
import { SlackNotifier } from '@/lib/slack';

interface TrackSecuritySignalParams {
  signal: string;
  threshold: number;
  windowSeconds: number;
  text: string;
  fields?: Record<string, string>;
}

export async function trackPlatformSecuritySignal({
  signal,
  threshold,
  windowSeconds,
  text,
  fields,
}: TrackSecuritySignalParams): Promise<void> {
  if (!process.env.SLACK_WEBHOOK_URL) {
    return;
  }

  const windowId = Math.floor(Date.now() / (windowSeconds * 1000));
  const key = `platform:security_signal:${signal}:${windowId}`;

  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, windowSeconds + 5);
  }

  if (count === threshold) {
    await SlackNotifier.securityAlert(text, {
      signal,
      count: String(count),
      windowSeconds: String(windowSeconds),
      ...(fields ?? {}),
    });
  }
}
