import { useEffect, useState } from "react";
import { domAnimation, LazyMotion } from "motion/react";
import * as m from "motion/react-m";
import { ClockIcon } from "lucide-react";

interface RateLimitWarningProps {
  remainingTime: number; // milliseconds until next token
}

export function RateLimitWarning({ remainingTime }: RateLimitWarningProps) {
  const [seconds, setSeconds] = useState(Math.ceil(remainingTime / 1000));

  useEffect(() => {
    setSeconds(Math.ceil(remainingTime / 1000));

    // Update countdown every second
    const interval = setInterval(() => {
      setSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [remainingTime]);

  // Don't show if no wait time
  if (remainingTime <= 0) return null;

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="flex items-center gap-2 px-3 py-2 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md"
      >
        <ClockIcon className="size-4 flex-shrink-0" />
        <span>
          Rate limit reached. Please wait{" "}
          <strong>{seconds} second{seconds !== 1 ? "s" : ""}</strong>...
        </span>
      </m.div>
    </LazyMotion>
  );
}
