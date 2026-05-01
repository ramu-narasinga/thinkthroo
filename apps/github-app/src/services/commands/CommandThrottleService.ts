import { env } from '@/utils/env';
import { logger } from '@/utils/logger';

export interface CommandThrottleResult {
  allowed: boolean;
  retryAfterSeconds?: number;
  remaining?: number;
}

const FAIL_OPEN_DEFAULT: CommandThrottleResult = { allowed: true };

export class CommandThrottleService {
  private readonly baseUrl: string;
  private readonly secret: string;

  constructor() {
    if (!env.PLATFORM_API_URL) {
      throw new Error('PLATFORM_API_URL environment variable is not set');
    }
    if (!env.PLATFORM_API_SECRET) {
      throw new Error('PLATFORM_API_SECRET environment variable is not set');
    }
    this.baseUrl = env.PLATFORM_API_URL;
    this.secret = env.PLATFORM_API_SECRET;
  }

  async check(
    installationId: string,
    repoFullName: string,
    userLogin: string,
    command: string,
  ): Promise<CommandThrottleResult> {
    const url = `${this.baseUrl}/api/commands/throttle`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-internal-secret': this.secret,
        },
        body: JSON.stringify({ installationId, repoFullName, userLogin, command }),
      });

      if (!response.ok) {
        const text = await response.text();
        logger.warn('Command throttle check failed, failing open', {
          installationId,
          repoFullName,
          userLogin,
          command,
          status: response.status,
          body: text,
        });
        return { ...FAIL_OPEN_DEFAULT };
      }

      return (await response.json()) as CommandThrottleResult;
    } catch (err: any) {
      logger.warn('Command throttle check threw, failing open', {
        installationId,
        repoFullName,
        userLogin,
        command,
        error: err.message,
      });
      return { ...FAIL_OPEN_DEFAULT };
    }
  }
}
