/**
 * Simple retry utility for async operations
 * Lightweight alternative to p-retry for CommonJS compatibility
 */

export interface RetryOptions {
  retries?: number;
  minTimeout?: number;
  maxTimeout?: number;
  onFailedAttempt?: (error: Error & { attemptNumber?: number; retriesLeft?: number }) => void;
}

/**
 * Retry an async operation with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    retries = 3,
    minTimeout = 1000,
    maxTimeout = 30000,
    onFailedAttempt,
  } = options;

  let lastError: Error;
  
  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      const retriesLeft = retries + 1 - attempt;
      
      if (retriesLeft === 0) {
        throw lastError;
      }

      // Exponential backoff: 1s, 2s, 4s, 8s, ...
      const timeout = Math.min(
        minTimeout * Math.pow(2, attempt - 1),
        maxTimeout
      );

      if (onFailedAttempt) {
        const enrichedError = lastError as Error & {
          attemptNumber?: number;
          retriesLeft?: number;
        };
        enrichedError.attemptNumber = attempt;
        enrichedError.retriesLeft = retriesLeft;
        onFailedAttempt(enrichedError);
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, timeout));
    }
  }

  throw lastError!;
}
