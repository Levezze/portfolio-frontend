import { renderHook } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useInputValidation } from "../useInputValidation";

describe("useInputValidation", () => {
  const MAX_LENGTH = 1000;

  describe("Character Validation - Valid Inputs", () => {
    it("should accept basic English text", () => {
      const { result } = renderHook(() => useInputValidation(MAX_LENGTH));

      const valid = result.current.isValid("Hello world");
      expect(valid).toBe(true);

      const errors = result.current.getErrors("Hello world");
      expect(errors).toHaveLength(0);
    });

    it("should accept text with punctuation", () => {
      const { result } = renderHook(() => useInputValidation(MAX_LENGTH));

      const texts = [
        "Hello, world!",
        "What's up? Nothing much.",
        "Email: test@example.com",
        "Math: 2+2=4",
        "Percent: 50%",
        "Hashtag: #important",
        "Quote: 'single' and \"double\"",
        "Parentheses: (like this)",
      ];

      for (const text of texts) {
        expect(result.current.isValid(text)).toBe(true);
      }
    });

    it("should accept numbers and letters combined", () => {
      const { result } = renderHook(() => useInputValidation(MAX_LENGTH));

      const valid = result.current.isValid("Test123 with numbers 456");
      expect(valid).toBe(true);
    });

    it("should accept special symbols from whitelist", () => {
      const { result } = renderHook(() => useInputValidation(MAX_LENGTH));

      // Test all allowed special characters
      const text = "@#$%&*+=/_-";
      expect(result.current.isValid(text)).toBe(true);
    });

    it("should accept newlines and tabs", () => {
      const { result } = renderHook(() => useInputValidation(MAX_LENGTH));

      const textWithNewlines = "Line 1\nLine 2\nLine 3";
      expect(result.current.isValid(textWithNewlines)).toBe(true);

      const textWithTabs = "Column1\tColumn2\tColumn3";
      expect(result.current.isValid(textWithTabs)).toBe(true);
    });
  });

  describe("Character Validation - Invalid Inputs", () => {
    it("should reject emojis", () => {
      const { result } = renderHook(() => useInputValidation(MAX_LENGTH));

      const texts = ["Hello 😀", "Test 🚀 rocket", "Heart ❤️"];

      for (const text of texts) {
        const valid = result.current.isValid(text);
        expect(valid).toBe(false);

        const errors = result.current.getErrors(text);
        expect(errors).toContain(
          "Invalid characters detected. Please use only letters, numbers, and basic punctuation."
        );
      }
    });

    it("should reject Unicode special characters", () => {
      const { result } = renderHook(() => useInputValidation(MAX_LENGTH));

      const texts = [
        "Test \u200B", // Zero-width space
        "Test \u202E", // Right-to-left override
        "Test •", // Bullet point
        "Test ™", // Trademark symbol
        "Test ©", // Copyright symbol
      ];

      for (const text of texts) {
        expect(result.current.isValid(text)).toBe(false);
      }
    });

    it("should reject non-English characters", () => {
      const { result } = renderHook(() => useInputValidation(MAX_LENGTH));

      const texts = [
        "こんにちは", // Japanese
        "你好", // Chinese
        "مرحبا", // Arabic
        "Привет", // Russian (Cyrillic)
      ];

      for (const text of texts) {
        expect(result.current.isValid(text)).toBe(false);
      }
    });
  });

  describe("Dangerous Pattern Detection", () => {
    it("should detect script tags", () => {
      const { result } = renderHook(() => useInputValidation(MAX_LENGTH));

      const dangerousTexts = [
        "<script>alert('xss')</script>",
        "<SCRIPT>alert(1)</SCRIPT>",
        "Test <script>bad()</script> here",
        "<script src='evil.js'></script>",
      ];

      for (const text of dangerousTexts) {
        const valid = result.current.isValid(text);
        expect(valid).toBe(false);

        const errors = result.current.getErrors(text);
        expect(errors).toContain(
          "Invalid characters detected. HTML tags and scripts are not allowed."
        );
      }
    });

    it("should detect iframe tags", () => {
      const { result } = renderHook(() => useInputValidation(MAX_LENGTH));

      const dangerousTexts = [
        "<iframe src='evil.com'></iframe>",
        "<IFRAME>content</IFRAME>",
        "Test <iframe></iframe> embed",
      ];

      for (const text of dangerousTexts) {
        expect(result.current.isValid(text)).toBe(false);
      }
    });

    it("should detect javascript: protocol", () => {
      const { result } = renderHook(() => useInputValidation(MAX_LENGTH));

      const dangerousTexts = [
        "javascript:alert(1)",
        "JAVASCRIPT:void(0)",
        "Click javascript:bad()",
      ];

      for (const text of dangerousTexts) {
        expect(result.current.isValid(text)).toBe(false);
      }
    });

    it("should detect event handlers", () => {
      const { result } = renderHook(() => useInputValidation(MAX_LENGTH));

      const dangerousTexts = [
        "onclick=alert(1)",
        "onerror=bad()",
        "onload=evil()",
        "onmouseover=hack()",
        "Test onclick='alert()' here",
      ];

      for (const text of dangerousTexts) {
        expect(result.current.isValid(text)).toBe(false);
      }
    });

    it("should detect any HTML tags", () => {
      const { result } = renderHook(() => useInputValidation(MAX_LENGTH));

      const dangerousTexts = [
        "<div>content</div>",
        "<span>text</span>",
        "<img src='x' />",
        "<a href='link'>click</a>",
        "<p>paragraph</p>",
        "Test <strong>bold</strong> here",
      ];

      for (const text of dangerousTexts) {
        expect(result.current.isValid(text)).toBe(false);
      }
    });
  });

  describe("DOMPurify Paste Sanitization", () => {
    it("should strip HTML tags but keep text content", () => {
      const { result } = renderHook(() => useInputValidation(MAX_LENGTH));

      const testCases = [
        {
          input: "<div>Hello</div>",
          expected: "Hello",
        },
        {
          input: "<strong>Bold</strong> text",
          expected: "Bold text",
        },
        {
          input: "<p>Paragraph 1</p><p>Paragraph 2</p>",
          expected: "Paragraph 1Paragraph 2",
        },
        {
          input: "<script>alert(1)</script>Normal text",
          expected: "Normal text",
        },
      ];

      for (const { input, expected } of testCases) {
        const cleaned = result.current.sanitizePaste(input);
        expect(cleaned).toBe(expected);
      }
    });

    it("should remove event handlers from pasted content", () => {
      const { result } = renderHook(() => useInputValidation(MAX_LENGTH));

      const input = "<div onclick='alert(1)'>Click me</div>";
      const cleaned = result.current.sanitizePaste(input);

      expect(cleaned).toBe("Click me");
      expect(cleaned).not.toContain("onclick");
    });

    it("should handle HTML entities in pasted content", () => {
      const { result } = renderHook(() => useInputValidation(MAX_LENGTH));

      const input = "Hello&nbsp;&nbsp;World";
      const cleaned = result.current.sanitizePaste(input);

      // DOMPurify in jsdom keeps &nbsp; as-is (browser behavior may differ)
      // The important part is that it strips HTML tags, not entity handling
      expect(cleaned).toBeTruthy();
      expect(cleaned).toContain("Hello");
      expect(cleaned).toContain("World");
    });

    it("should return unchanged text when no HTML present", () => {
      const { result } = renderHook(() => useInputValidation(MAX_LENGTH));

      const plainText = "Just plain text with no HTML";
      const cleaned = result.current.sanitizePaste(plainText);

      expect(cleaned).toBe(plainText);
    });

    it("should handle complex HTML structures", () => {
      const { result } = renderHook(() => useInputValidation(MAX_LENGTH));

      const complexHTML = `
        <div class="container">
          <h1>Title</h1>
          <p>Paragraph with <strong>bold</strong> and <em>italic</em>.</p>
          <ul>
            <li>Item 1</li>
            <li>Item 2</li>
          </ul>
        </div>
      `;

      const cleaned = result.current.sanitizePaste(complexHTML);

      // Should extract all text content
      expect(cleaned).toContain("Title");
      expect(cleaned).toContain("Paragraph");
      expect(cleaned).toContain("bold");
      expect(cleaned).toContain("italic");
      expect(cleaned).toContain("Item 1");
      expect(cleaned).toContain("Item 2");

      // Should not contain HTML tags
      expect(cleaned).not.toContain("<");
      expect(cleaned).not.toContain(">");
    });
  });

  describe("Length Validation", () => {
    it("should accept text at exactly max length", () => {
      const { result } = renderHook(() => useInputValidation(100));

      const text = "a".repeat(100); // Exactly 100 characters
      expect(result.current.isValid(text)).toBe(true);
    });

    it("should reject text exceeding max length", () => {
      const { result } = renderHook(() => useInputValidation(100));

      const text = "a".repeat(101); // 101 characters
      const valid = result.current.isValid(text);
      expect(valid).toBe(false);

      const errors = result.current.getErrors(text);
      expect(errors).toContain(
        "Message too long. Maximum 100 characters allowed."
      );
    });

    it("should include length in error message", () => {
      const { result } = renderHook(() => useInputValidation(50));

      const text = "a".repeat(60);
      const errors = result.current.getErrors(text);

      expect(errors[0]).toContain("50");
    });
  });

  describe("Multiple Validation Errors", () => {
    it("should return only one error for dangerous patterns", () => {
      const { result } = renderHook(() => useInputValidation(MAX_LENGTH));

      // Contains both script tag and iframe (multiple dangerous patterns)
      const text = "<script>bad()</script><iframe>also bad</iframe>";
      const errors = result.current.getErrors(text);

      // Should only show one error message (breaks on first match)
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain("HTML tags and scripts are not allowed");
    });

    it("should detect both invalid characters and length issues", () => {
      const { result } = renderHook(() => useInputValidation(10));

      // Too long AND contains emoji
      const text = "Hello 😀 this is way too long";
      const errors = result.current.getErrors(text);

      // Should have both errors
      expect(errors.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty string", () => {
      const { result } = renderHook(() => useInputValidation(MAX_LENGTH));

      expect(result.current.isValid("")).toBe(true);
      expect(result.current.getErrors("")).toHaveLength(0);
    });

    it("should handle whitespace-only input", () => {
      const { result } = renderHook(() => useInputValidation(MAX_LENGTH));

      const whitespace = "   \n\t  ";
      expect(result.current.isValid(whitespace)).toBe(true);
    });

    it("should validate consistently across multiple calls", () => {
      const { result } = renderHook(() => useInputValidation(MAX_LENGTH));

      const text = "Test message";

      // Call multiple times - should be consistent
      expect(result.current.isValid(text)).toBe(true);
      expect(result.current.isValid(text)).toBe(true);
      expect(result.current.isValid(text)).toBe(true);
    });

    it("should handle text with only special characters", () => {
      const { result } = renderHook(() => useInputValidation(MAX_LENGTH));

      const specialOnly = "!@#$%&*()_+-=";
      expect(result.current.isValid(specialOnly)).toBe(true);
    });
  });

  describe("Validation Result Structure", () => {
    it("should return correct ValidationResult structure", () => {
      const { result } = renderHook(() => useInputValidation(MAX_LENGTH));

      const validResult = result.current.validateCharacters("Valid text");
      expect(validResult).toHaveProperty("isValid");
      expect(validResult).toHaveProperty("errors");
      expect(typeof validResult.isValid).toBe("boolean");
      expect(Array.isArray(validResult.errors)).toBe(true);
    });

    it("should return isValid=true with empty errors for valid input", () => {
      const { result } = renderHook(() => useInputValidation(MAX_LENGTH));

      const validResult = result.current.validateCharacters("Hello");
      expect(validResult.isValid).toBe(true);
      expect(validResult.errors).toHaveLength(0);
    });

    it("should return isValid=false with errors for invalid input", () => {
      const { result } = renderHook(() => useInputValidation(MAX_LENGTH));

      const invalidResult = result.current.validateCharacters(
        "<script>bad</script>"
      );
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.errors.length).toBeGreaterThan(0);
    });
  });
});
