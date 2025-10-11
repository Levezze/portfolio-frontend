import { useCallback } from "react";
import DOMPurify from "dompurify";

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

interface InputValidationHook {
  validateCharacters: (text: string) => ValidationResult;
  sanitizePaste: (text: string) => string;
  isValid: (text: string) => boolean;
  getErrors: (text: string) => string[];
}

// Character whitelist regex
// Allows: a-z, A-Z, 0-9, spaces, basic punctuation, common symbols, newlines, tabs
const ALLOWED_CHARS_REGEX = /^[a-zA-Z0-9\s.,!?;:'"()\-@#$%&*+=/_\n\t]*$/;

// Dangerous pattern detection
const DANGEROUS_PATTERNS = [
  /<script[\s\S]*?>[\s\S]*?<\/script>/i, // Script tags
  /<iframe[\s\S]*?>/i, // Iframes
  /javascript:/i, // JavaScript protocol
  /on\w+\s*=/i, // Event handlers (onclick, onerror, etc.)
  /<\/?\w+[^>]*>/, // Any HTML tags
];

/**
 * Input validation hook for chat messages
 *
 * Provides character validation and paste sanitization
 *
 * @param maxLength - Maximum allowed message length
 * @returns Validation utilities
 *
 * @example
 * const { isValid, validateCharacters, sanitizePaste } =
 *   useInputValidation(1000);
 */
export function useInputValidation(maxLength: number): InputValidationHook {
  /**
   * Validate characters against whitelist and check for dangerous patterns
   */
  const validateCharacters = useCallback(
    (text: string): ValidationResult => {
      const errors: string[] = [];

      // Check for dangerous patterns first
      for (const pattern of DANGEROUS_PATTERNS) {
        if (pattern.test(text)) {
          errors.push(
            "Invalid characters detected. HTML tags and scripts are not allowed."
          );
          break; // Only show one error message
        }
      }

      // If no dangerous patterns, check whitelist
      if (errors.length === 0 && !ALLOWED_CHARS_REGEX.test(text)) {
        errors.push(
          "Invalid characters detected. Please use only letters, numbers, and basic punctuation."
        );
      }

      // Check length
      if (text.length > maxLength) {
        errors.push(
          `Message too long. Maximum ${maxLength} characters allowed.`
        );
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    },
    [maxLength]
  );

  /**
   * Sanitize pasted content using DOMPurify
   * Strips all HTML tags but keeps text content
   */
  const sanitizePaste = useCallback((text: string): string => {
    // Configure DOMPurify to strip all tags but keep text
    const cleaned = DOMPurify.sanitize(text, {
      ALLOWED_TAGS: [], // No HTML tags allowed
      KEEP_CONTENT: true, // Keep text content
      ALLOW_DATA_ATTR: false,
    });

    if (process.env.NODE_ENV === "development" && cleaned !== text) {
      console.log("[InputValidation] Sanitized pasted content:", {
        original: text,
        cleaned,
      });
    }

    return cleaned;
  }, []);

  /**
   * Check if text is valid (convenience method)
   */
  const isValid = useCallback(
    (text: string): boolean => {
      return validateCharacters(text).isValid;
    },
    [validateCharacters]
  );

  /**
   * Get validation errors (convenience method)
   */
  const getErrors = useCallback(
    (text: string): string[] => {
      return validateCharacters(text).errors;
    },
    [validateCharacters]
  );

  return {
    validateCharacters,
    sanitizePaste,
    isValid,
    getErrors,
  };
}
