# URL Linkification Strategy

## Overview

Automatic detection and linkification of URLs in text content using regex-based string splitting.

## Implementation

### Core Pattern

```tsx
const urlRegex = /(https?:\/\/[^\s]+)/g;
const parts = text.split(urlRegex);
```

### Regex Breakdown

| Component | Meaning | Purpose |
|-----------|---------|---------|
| `(...)` | Capture group | Preserves matched URLs in split result |
| `https?` | HTTP or HTTPS | `s?` makes the 's' optional |
| `\/\/` | Escaped slashes | Matches `://` literally |
| `[^\s]+` | Non-whitespace | Matches URL until space/newline |
| `g` | Global flag | Finds all URLs, not just first |

### How It Works

1. **Split text by URL pattern** - capture group keeps URLs in array
2. **Map over parts** - check each part against regex
3. **Render conditionally**:
   - Match → `<a>` with `target="_blank"` and `rel="noopener noreferrer"`
   - No match → plain text

### Example

```tsx
const text = "Visit https://site.com and http://other.org for info";
text.split(/(https?:\/\/[^\s]+)/g);

// Result:
[
  "Visit ",              // text
  "https://site.com",    // URL
  " and ",               // text
  "http://other.org",    // URL
  " for info"            // text
]
```

## Usage

```tsx
export const linkifyText = (text: string) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);

  return (
    <>
      {parts.map((part, i) =>
        part.match(urlRegex) ? (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="underline-offset-4 hover:underline font-semibold"
          >
            {part}
          </a>
        ) : (
          part
        )
      )}
    </>
  );
};
```

### In Components

```tsx
<p className="text-regular font-inter whitespace-pre-wrap">
  {linkifyText(projectData?.description || "")}
</p>
```

## Security Note

Always include `rel="noopener noreferrer"` with `target="_blank"`:

- `noopener` - Prevents new page from accessing `window.opener`
- `noreferrer` - Blocks referrer header to external site

## Limitations

- Stops at first whitespace (won't handle URLs with spaces in query params)
- Doesn't validate URL structure (accepts any `http(s)://[non-space]+`)
- Trailing punctuation may be included in URL (`https://site.com.` includes the period)

## File Location

Implementation: `src/lib/utils/urlDetector.ts`
