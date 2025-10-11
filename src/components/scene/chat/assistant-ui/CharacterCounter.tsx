import { useMemo } from "react";
import { cn } from "@/lib/utils/general";

interface CharacterCounterProps {
  value: string;
  maxLength: number;
}

export function CharacterCounter({ value, maxLength }: CharacterCounterProps) {
  const count = value.length;
  const percentage = (count / maxLength) * 100;

  // Color coding based on percentage
  const colorClass = useMemo(() => {
    if (percentage >= 100) {
      return "text-red-600 dark:text-red-400 font-semibold";
    }
    if (percentage >= 80) {
      return "text-amber-600 dark:text-amber-400 font-medium";
    }
    return "text-muted-foreground";
  }, [percentage]);

  return (
    <div
      className={cn(
        "absolute bottom-1 right-14 text-xs transition-colors duration-200",
        colorClass
      )}
      aria-live="polite"
      aria-atomic="true"
    >
      <span>{count}</span>
      <span className="opacity-60"> / </span>
      <span className="opacity-60">{maxLength}</span>
    </div>
  );
}
