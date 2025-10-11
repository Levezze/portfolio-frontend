# Chat Security Implementation

## Overview

Security measures for the chat interface to prevent abuse, injection attacks, and ensure safe user input.

## Features

### Rate Limiting

**Token Bucket algorithm** limits users to **5 messages per minute**.

```
Capacity: 5 messages
Refill Rate: 1 message every 12 seconds
```

Users see a countdown timer when rate limited.

### Input Validation

**Character whitelist** allows only:
- English letters and numbers
- Basic punctuation (.,!?;:)
- Common symbols (@#$%&*+=-)
- Whitespace and newlines

**Blocks:**
- Emojis and Unicode special characters
- HTML tags and scripts
- Non-English characters

**Maximum length:** 2000 characters

### Paste Sanitization

**DOMPurify** strips HTML from pasted content while preserving text.

```
Input:  "<div>Hello <strong>World</strong></div>"
Output: "Hello World"
```

## Implementation

### Hooks

**`useRateLimiter(capacity, windowMs)`**

Token Bucket rate limiter.

```typescript
const { canSend, remainingTime, tokensLeft, consumeToken } =
  useRateLimiter(5, 60000); // 5 messages per minute

// Check if user can send
if (canSend) {
  consumeToken(); // Consume a token
  sendMessage();
}
```

**Returns:**
- `canSend: boolean` - Whether user can send a message
- `remainingTime: number` - Milliseconds until next token available
- `tokensLeft: number` - Current token count
- `consumeToken: () => boolean` - Consume a token, returns success

**`useInputValidation(maxLength)`**

Character validation and paste sanitization.

```typescript
const { isValid, getErrors, sanitizePaste } =
  useInputValidation(2000);

// Validate input
const valid = isValid("Hello, world!"); // true

// Get specific errors
const errors = getErrors("<script>alert(1)</script>");
// ["Invalid characters detected. HTML tags and scripts are not allowed."]

// Sanitize pasted content
const cleaned = sanitizePaste("<div>Hello</div>"); // "Hello"
```

**Returns:**
- `validateCharacters(text)` - Full validation with errors
- `sanitizePaste(text)` - Strip HTML from text
- `isValid(text)` - Quick boolean check
- `getErrors(text)` - Get array of error messages

### Components

**`<RateLimitWarning remainingTime={number} />`**

Displays countdown when rate limited.

**`<CharacterCounter value={string} maxLength={number} />`**

Real-time character count with color coding:
- Green: 0-80%
- Yellow: 80-100%
- Red: >100%

**`<ValidationError errors={string[]} />`**

Displays validation error messages.

## Usage Example

```typescript
import { useRateLimiter } from "@/hooks/useRateLimiter";
import { useInputValidation } from "@/hooks/useInputValidation";
import { CharacterCounter } from "./CharacterCounter";
import { RateLimitWarning } from "./RateLimitWarning";
import { ValidationError } from "./ValidationError";

function ChatComposer() {
  const MAX_LENGTH = 2000;

  // Security hooks
  const { canSend, remainingTime, consumeToken } = useRateLimiter(5, 60000);
  const { sanitizePaste, getErrors } = useInputValidation(MAX_LENGTH);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [text, setText] = useState("");

  // Validate on change
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setText(value);
    setValidationErrors(getErrors(value));
  };

  // Sanitize on paste
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = e.clipboardData?.getData("text/plain");
    if (!pastedText) return;

    const cleaned = sanitizePaste(pastedText);

    if (cleaned !== pastedText) {
      e.preventDefault();
      // Insert cleaned text manually
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const newValue =
        text.substring(0, start) +
        cleaned +
        text.substring(target.selectionEnd);

      setText(newValue);
    }
  };

  // Send with security checks
  const handleSend = () => {
    if (!canSend || validationErrors.length > 0) return;

    const consumed = consumeToken();
    if (!consumed) return;

    sendMessage(text);
  };

  const isDisabled = !canSend || validationErrors.length > 0;

  return (
    <div>
      {/* Security warnings */}
      {!canSend && <RateLimitWarning remainingTime={remainingTime} />}
      {validationErrors.length > 0 && <ValidationError errors={validationErrors} />}

      {/* Input */}
      <textarea
        value={text}
        onChange={handleChange}
        onPaste={handlePaste}
        maxLength={MAX_LENGTH}
      />

      {/* Character counter */}
      <CharacterCounter value={text} maxLength={MAX_LENGTH} />

      {/* Send button */}
      <button onClick={handleSend} disabled={isDisabled}>
        Send
      </button>
    </div>
  );
}
```

## Character Whitelist

Regex pattern for allowed characters:

```regex
/^[a-zA-Z0-9\s.,!?;:'"()\-@#$%&*+=/_\n\t]*$/
```

| Type | Characters |
|------|------------|
| Letters | a-z, A-Z |
| Numbers | 0-9 |
| Whitespace | space, newline, tab |
| Punctuation | . , ! ? ; : ' " ( ) |
| Symbols | - @ # $ % & * + = / _ |

## Dangerous Patterns Detected

- `<script>` tags
- `<iframe>` tags
- `javascript:` protocol
- Event handlers (`onclick`, `onerror`, etc.)
- Any HTML tags

## Security Notes

**Client-Side vs Server-Side**

- **Client-side:** User experience (immediate feedback)
- **Server-side:** Actual security (cannot be bypassed)

**Always validate on both sides.** Client-side validation can be disabled in browser dev tools.

## Testing

Run tests:
```bash
pnpm test
```

Test files:
- `src/hooks/__tests__/useRateLimiter.test.ts` (17 tests)
- `src/hooks/__tests__/useInputValidation.test.ts` (30 tests)

## File Locations

**Hooks:**
- `src/hooks/useRateLimiter.ts`
- `src/hooks/useInputValidation.ts`

**Components:**
- `src/components/scene/chat/assistant-ui/RateLimitWarning.tsx`
- `src/components/scene/chat/assistant-ui/CharacterCounter.tsx`
- `src/components/scene/chat/assistant-ui/ValidationError.tsx`

**Integration:**
- `src/components/scene/chat/assistant-ui/thread.tsx` (Composer component)

## Configuration

### Adjust Rate Limit

```typescript
// Change capacity and window
const limiter = useRateLimiter(
  10,      // 10 messages
  120000   // per 2 minutes
);
```

### Adjust Max Length

```typescript
// Change max length
const validator = useInputValidation(3000); // 3000 characters
```

### Modify Character Whitelist

Edit regex in `src/hooks/useInputValidation.ts`:

```typescript
const ALLOWED_CHARS_REGEX = /^[your pattern here]*$/;
```

**Warning:** Changing the whitelist affects security. Test thoroughly.

## Limitations

- **English only:** Non-Latin scripts blocked
- **No emojis:** Unicode restrictions for security
- **Rate limiting:** May frustrate legitimate power users
- **Client-side only:** Backend must implement same rules

## Future Enhancements

- Trusted user system with relaxed limits
- Multi-language support
- Semantic prompt injection detection
- Progressive rate limiting after violations
