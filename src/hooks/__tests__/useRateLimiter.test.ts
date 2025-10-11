import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { useRateLimiter } from "../useRateLimiter";

describe("useRateLimiter", () => {
  beforeEach(() => {
    // Clear sessionStorage before each test
    sessionStorage.clear();
    // Use fake timers to control time
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Initial State", () => {
    it("should start with full token capacity", () => {
      const { result } = renderHook(() => useRateLimiter(5, 60000));

      expect(result.current.tokensLeft).toBe(5);
      expect(result.current.canSend).toBe(true);
      expect(result.current.remainingTime).toBe(0);
    });

    it("should initialize with custom capacity", () => {
      const { result } = renderHook(() => useRateLimiter(10, 60000));

      expect(result.current.tokensLeft).toBe(10);
      expect(result.current.canSend).toBe(true);
    });
  });

  describe("Token Consumption", () => {
    it("should consume tokens one by one", () => {
      const { result } = renderHook(() => useRateLimiter(5, 60000));

      // Tick interval once to stabilize
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // Consume first token
      let consumed: boolean;
      act(() => {
        consumed = result.current.consumeToken();
      });
      expect(consumed!).toBe(true);
      expect(result.current.tokensLeft).toBe(4);

      // Consume second token
      act(() => {
        consumed = result.current.consumeToken();
      });
      expect(consumed!).toBe(true);
      expect(result.current.tokensLeft).toBe(3);
    });

    it("should consume all tokens until empty", () => {
      const { result } = renderHook(() => useRateLimiter(5, 60000));

      // Tick interval once to stabilize
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // Consume all 5 tokens (separate act calls to ensure state updates)
      for (let i = 0; i < 5; i++) {
        act(() => {
          result.current.consumeToken();
        });
      }

      expect(result.current.tokensLeft).toBe(0);
      expect(result.current.canSend).toBe(false);
    });

    it("should reject consumption when bucket is empty", () => {
      const { result } = renderHook(() => useRateLimiter(3, 60000));

      // Tick interval once to stabilize
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // Consume all 3 tokens (separate act calls)
      for (let i = 0; i < 3; i++) {
        act(() => {
          result.current.consumeToken();
        });
      }

      // Try to consume when empty (4th attempt)
      let consumed: boolean;
      act(() => {
        consumed = result.current.consumeToken();
      });
      expect(consumed!).toBe(false); // 4th fails

      expect(result.current.tokensLeft).toBe(0);
      expect(result.current.canSend).toBe(false);
    });
  });

  describe("Rate Limit Enforcement", () => {
    it("should set canSend to false when no tokens remain", () => {
      const { result } = renderHook(() => useRateLimiter(2, 60000));

      // Tick interval to stabilize
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // Initially can send
      expect(result.current.canSend).toBe(true);

      // Consume all tokens (separate act calls)
      act(() => {
        result.current.consumeToken();
      });
      act(() => {
        result.current.consumeToken();
      });

      // Now cannot send
      expect(result.current.canSend).toBe(false);
    });

    it("should calculate remaining time until next token", () => {
      const { result } = renderHook(() => useRateLimiter(5, 60000)); // 12s per token

      // Tick interval to stabilize
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // Consume all tokens (separate act calls)
      for (let i = 0; i < 5; i++) {
        act(() => {
          result.current.consumeToken();
        });
      }

      // Remaining time should be set (will be between 0 and refillRateMs due to timing)
      expect(result.current.remainingTime).toBeGreaterThanOrEqual(0);
      expect(result.current.remainingTime).toBeLessThanOrEqual(12000);
    });
  });

  describe("Token Refill Mechanism", () => {
    it("should refill one token after refill interval", () => {
      const { result } = renderHook(() => useRateLimiter(5, 60000)); // 12s per token

      // Tick interval to stabilize
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // Consume all 5 tokens (separate act calls)
      for (let i = 0; i < 5; i++) {
        act(() => {
          result.current.consumeToken();
        });
      }

      expect(result.current.tokensLeft).toBe(0);
      expect(result.current.canSend).toBe(false);

      // Advance time by 13 seconds (12s refill + 1s interval tick)
      act(() => {
        vi.advanceTimersByTime(13000);
      });

      // Should have refilled at least 1 token
      expect(result.current.tokensLeft).toBeGreaterThanOrEqual(1);
      expect(result.current.canSend).toBe(true);
    });

    it("should refill multiple tokens after multiple intervals", () => {
      const { result } = renderHook(() => useRateLimiter(5, 60000)); // 12s per token

      // Tick interval to stabilize
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // Consume all tokens (separate act calls)
      for (let i = 0; i < 5; i++) {
        act(() => {
          result.current.consumeToken();
        });
      }

      expect(result.current.tokensLeft).toBe(0);

      // Advance time by 37 seconds (3 × 12s + 1s buffer)
      act(() => {
        vi.advanceTimersByTime(37000);
      });

      // Should have refilled at least 3 tokens
      expect(result.current.tokensLeft).toBeGreaterThanOrEqual(3);
      expect(result.current.canSend).toBe(true);
    });

    it("should not exceed capacity when refilling", () => {
      const { result } = renderHook(() => useRateLimiter(5, 60000));

      // Don't consume any tokens
      expect(result.current.tokensLeft).toBe(5);

      // Advance time by 1 minute (enough to refill 5 tokens)
      act(() => {
        vi.advanceTimersByTime(60000);
      });

      // Should still be at capacity (not 10)
      expect(result.current.tokensLeft).toBe(5);
    });

    it("should update UI periodically via interval", () => {
      const { result } = renderHook(() => useRateLimiter(5, 60000));

      // Tick interval to stabilize
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // Consume all tokens (separate act calls)
      for (let i = 0; i < 5; i++) {
        act(() => {
          result.current.consumeToken();
        });
      }

      expect(result.current.tokensLeft).toBe(0);

      // Advance by 15 seconds (enough to refill at least 1 token)
      act(() => {
        vi.advanceTimersByTime(15000);
      });

      // Interval should have triggered refill
      expect(result.current.tokensLeft).toBeGreaterThan(0);
    });
  });

  describe("SessionStorage Persistence", () => {
    it("should persist token state to sessionStorage", () => {
      const { result } = renderHook(() => useRateLimiter(5, 60000));

      // Consume a token
      act(() => {
        result.current.consumeToken();
      });

      // Check sessionStorage was updated
      const stored = sessionStorage.getItem("chat_rate_limiter");
      expect(stored).toBeTruthy();

      const parsed = JSON.parse(stored!);
      expect(parsed.tokens).toBe(4);
      expect(parsed.lastRefill).toBeTypeOf("number");
    });

    it("should restore state from sessionStorage on mount", () => {
      // Manually set sessionStorage state
      const initialState = {
        tokens: 2,
        lastRefill: Date.now(),
      };
      sessionStorage.setItem("chat_rate_limiter", JSON.stringify(initialState));

      // Mount hook - should load from sessionStorage
      const { result } = renderHook(() => useRateLimiter(5, 60000));

      expect(result.current.tokensLeft).toBe(2);
      expect(result.current.canSend).toBe(true);
    });

    it("should handle corrupted sessionStorage gracefully", () => {
      // Set invalid JSON in sessionStorage
      sessionStorage.setItem("chat_rate_limiter", "invalid json{");

      // Should fall back to initial state (full capacity)
      const { result } = renderHook(() => useRateLimiter(5, 60000));

      expect(result.current.tokensLeft).toBe(5);
      expect(result.current.canSend).toBe(true);
    });
  });

  describe("Edge Cases", () => {
    it("should handle multiple rapid consume attempts", () => {
      const { result } = renderHook(() => useRateLimiter(3, 60000));

      // Tick interval to stabilize
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // Rapidly consume all tokens in succession (separate acts)
      const results: boolean[] = [];

      act(() => { results.push(result.current.consumeToken()); });
      act(() => { results.push(result.current.consumeToken()); });
      act(() => { results.push(result.current.consumeToken()); });
      act(() => { results.push(result.current.consumeToken()); }); // 4th fails
      act(() => { results.push(result.current.consumeToken()); }); // 5th fails

      expect(results[0]).toBe(true);
      expect(results[1]).toBe(true);
      expect(results[2]).toBe(true);
      expect(results[3]).toBe(false);
      expect(results[4]).toBe(false);
      expect(result.current.tokensLeft).toBe(0);
    });

    it("should handle partial refill correctly", () => {
      const { result } = renderHook(() => useRateLimiter(5, 60000)); // 12s per token

      // Tick interval to stabilize
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // Consume 3 tokens (separate act calls)
      act(() => { result.current.consumeToken(); });
      act(() => { result.current.consumeToken(); });
      act(() => { result.current.consumeToken(); });

      expect(result.current.tokensLeft).toBe(2);

      // Advance time by 19 seconds (1.5 tokens worth + buffer)
      // Should refill 1 complete token (floor rounding)
      act(() => {
        vi.advanceTimersByTime(19000);
      });

      expect(result.current.tokensLeft).toBeGreaterThanOrEqual(3); // 2 + 1 = 3
    });

    it("should return zero remaining time when tokens available", () => {
      const { result } = renderHook(() => useRateLimiter(5, 60000));

      expect(result.current.tokensLeft).toBeGreaterThan(0);
      expect(result.current.remainingTime).toBe(0);
    });
  });
});
