import { useCallback, useEffect, useState } from "react";

interface TokenBucket {
  tokens: number;
  lastRefill: number;
}

interface RateLimiterResult {
  canSend: boolean;
  remainingTime: number; // milliseconds until next token
  tokensLeft: number;
  consumeToken: () => boolean;
}

const STORAGE_KEY = "chat_rate_limiter";

/**
 * Token Bucket rate limiter for chat messages
 *
 * @param capacity - Maximum number of tokens (burst capacity)
 * @param windowMs - Time window in milliseconds for rate limit
 * @returns Rate limiter state and controls
 *
 * @example
 * const { canSend, remainingTime, tokensLeft, consumeToken } =
 *   useRateLimiter(5, 60000); // 5 messages per minute
 */
export function useRateLimiter(
  capacity: number,
  windowMs: number
): RateLimiterResult {
  const refillRateMs = windowMs / capacity; // Time between token refills

  // Initialize or load bucket state
  const [bucket, setBucket] = useState<TokenBucket>(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored) as TokenBucket;
      }
    } catch (error) {
      console.warn("[RateLimiter] Failed to load state from sessionStorage", error);
    }

    return {
      tokens: capacity,
      lastRefill: Date.now(),
    };
  });

  // Refill tokens based on elapsed time
  const refillTokens = useCallback(() => {
    const now = Date.now();
    const elapsed = now - bucket.lastRefill;
    const tokensToAdd = Math.floor(elapsed / refillRateMs);

    if (tokensToAdd > 0) {
      const newTokens = Math.min(capacity, bucket.tokens + tokensToAdd);
      const newBucket = {
        tokens: newTokens,
        lastRefill: now,
      };

      setBucket(newBucket);

      // Persist to sessionStorage
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(newBucket));
      } catch (error) {
        console.warn("[RateLimiter] Failed to save state to sessionStorage", error);
      }

      return newBucket;
    }

    return bucket;
  }, [bucket, capacity, refillRateMs]);

  // Calculate remaining time until next token
  const calculateRemainingTime = useCallback((): number => {
    if (bucket.tokens > 0) return 0;

    const now = Date.now();
    const elapsed = now - bucket.lastRefill;
    const remainingMs = refillRateMs - (elapsed % refillRateMs);

    return Math.max(0, remainingMs);
  }, [bucket.tokens, bucket.lastRefill, refillRateMs]);

  // Consume a token (send a message)
  const consumeToken = useCallback((): boolean => {
    const currentBucket = refillTokens();

    if (currentBucket.tokens >= 1) {
      const newBucket = {
        ...currentBucket,
        tokens: currentBucket.tokens - 1,
      };

      setBucket(newBucket);

      // Persist to sessionStorage
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(newBucket));
      } catch (error) {
        console.warn("[RateLimiter] Failed to save state to sessionStorage", error);
      }

      if (process.env.NODE_ENV === "development") {
        console.log("[RateLimiter] Token consumed. Remaining:", newBucket.tokens);
      }

      return true;
    }

    if (process.env.NODE_ENV === "development") {
      console.log("[RateLimiter] Rate limit exceeded. Wait time:", calculateRemainingTime());
    }

    return false;
  }, [refillTokens, calculateRemainingTime]);

  // Refresh state periodically to keep UI updated
  useEffect(() => {
    const interval = setInterval(() => {
      refillTokens();
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, [refillTokens]);

  const currentBucket = refillTokens();
  const canSend = currentBucket.tokens >= 1;
  const remainingTime = calculateRemainingTime();

  return {
    canSend,
    remainingTime,
    tokensLeft: currentBucket.tokens,
    consumeToken,
  };
}
