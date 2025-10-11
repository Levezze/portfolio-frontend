import { domAnimation, LazyMotion } from "motion/react";
import * as m from "motion/react-m";
import { AlertCircleIcon } from "lucide-react";

interface ValidationErrorProps {
  errors: string[];
}

export function ValidationError({ errors }: ValidationErrorProps) {
  if (errors.length === 0) return null;

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="flex items-start gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-md"
        role="alert"
        aria-live="assertive"
      >
        <AlertCircleIcon className="size-4 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          {errors.map((error, index) => (
            <p key={index} className="text-sm">
              {error}
            </p>
          ))}
        </div>
      </m.div>
    </LazyMotion>
  );
}
