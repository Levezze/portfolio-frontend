# Mobile Keyboard Handling Implementation Guide

**Related:** ADR 0004 - Mobile Keyboard Overlay Solution

This guide explains how to implement mobile keyboard handling for forms and inputs within the 3D cube's transform3d rendering context.

---

## Overview

When the mobile software keyboard opens, it overlays the bottom 40-50% of the viewport, covering input fields. Our solution works within the transform3d rendering context by:

1. **Adding dynamic bottom padding (60dvh)** to scrollable containers when keyboard is visible
2. **Scrolling focused inputs into view** using native `scrollIntoView()` API

This creates enough scrollable space to bring inputs above the keyboard while keeping the 3D cube visible.

---

## Core Concepts

### Transform3d Rendering Context Constraint

The Drei `<Html>` component uses CSS `transform: translate3d()` to position content in 3D space. **This creates an isolated rendering context** where:

- `position: fixed` elements are positioned relative to the transformed element, not the viewport
- Viewport units (`vh`, `dvh`) measure the transformed space, not the browser viewport
- Portals to `document.body` break 3D positioning
- Elements cannot escape the transformed coordinate space

**Implication:** Solutions must work *within* the transform context, not try to escape it.

### VisualViewport API for Keyboard Detection

The `visualViewport.height` property shrinks when the keyboard opens, allowing reliable keyboard detection:

```tsx
const handleResize = () => {
  const windowHeight = window.innerHeight;
  const viewportHeight = window.visualViewport.height;
  const keyboardHeight = windowHeight - viewportHeight;

  // Keyboard visible when viewport shrinks by >150px
  setKeyboardVisible(keyboardHeight > 150);
};
```

This is implemented in `src/hooks/useViewportMetrics.ts` and exposed via `keyboardVisibleAtom`.

### Why 60dvh Padding

- Mobile keyboards occupy 40-50% of viewport height
- 60dvh ensures input + label + some context visible above keyboard
- `dvh` (dynamic viewport height) adapts to browser chrome visibility
- Creates scrollable "empty zone" at container bottom

---

## Implementation Pattern

### Step 1: Add Dynamic Padding to Scroll Container

Apply conditional padding when keyboard is visible on mobile:

```tsx
import { useAtomValue } from "jotai";
import { isMobileAtom, keyboardVisibleAtom } from "@/atoms/atomStore";
import { cn } from "@/lib/utils/general";

const YourComponent = () => {
  const isMobile = useAtomValue(isMobileAtom);
  const keyboardVisible = useAtomValue(keyboardVisibleAtom);

  return (
    <div className={cn(
      "overflow-y-auto", // Must be scrollable
      isMobile && keyboardVisible && "pb-[60dvh]"
    )}>
      {/* Your content */}
    </div>
  );
};
```

**Requirements:**
- Container must have `overflow-y: auto` (or `scroll`)
- Container must be scrollable (not full-height static)
- Apply to the scroll container, not individual inputs

### Step 2: Implement ScrollIntoView (If Needed)

Some components need explicit scroll-to-focused-input behavior:

```tsx
import { useEffect, useRef } from "react";

const YourFormComponent = () => {
  const isMobile = useAtomValue(isMobileAtom);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Scroll focused input into view when keyboard appears
  useEffect(() => {
    if (!isMobile) return;

    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement;

      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
        // Find parent container that includes label/context
        const container = target.closest('[data-slot="form-item"]')
                       || target.closest('.input-wrapper');

        setTimeout(() => {
          if (container) {
            container.scrollIntoView({
              behavior: "smooth",
              block: "start",
              inline: "nearest",
            });
          } else {
            // Fallback: scroll just the input
            target.scrollIntoView({
              behavior: "smooth",
              block: "start",
              inline: "nearest",
            });
          }
        }, 350); // Delay for keyboard animation
      }
    };

    const wrapper = wrapperRef.current;
    if (wrapper) {
      wrapper.addEventListener("focusin", handleFocus);
      return () => wrapper.removeEventListener("focusin", handleFocus);
    }
  }, [isMobile]);

  return (
    <div ref={wrapperRef} className={cn(
      "overflow-y-auto",
      isMobile && keyboardVisible && "pb-[60dvh]"
    )}>
      {/* Form content */}
    </div>
  );
};
```

**When ScrollIntoView is needed:**
- Forms with multiple static fields (contact form, signup, etc.)
- Components without built-in scroll behavior
- When you want to scroll to field labels, not just inputs

**When ScrollIntoView is NOT needed:**
- Chat interfaces with auto-scroll-to-bottom behavior
- Components using libraries with built-in scroll (like `@assistant-ui`)
- Single-input forms where input is already visible

---

## Real-World Examples

### Example 1: Chat Component (No Explicit Scroll)

**File:** `src/components/scene/chat/assistant-ui/thread.tsx`

```tsx
export const Thread: FC = () => {
  const isMobile = useAtomValue(isMobileAtom);
  const keyboardVisible = useAtomValue(keyboardVisibleAtom);

  return (
    <ThreadPrimitive.Root className="flex h-full flex-col">
      <ThreadPrimitive.Viewport className={cn(
        "relative flex flex-1 flex-col overflow-x-auto overflow-y-auto",
        isMobile && keyboardVisible && "pb-[60dvh]"
      )}>
        {/* Messages */}
        <ThreadPrimitive.Messages />

        {/* Composer at bottom */}
        <Composer />
      </ThreadPrimitive.Viewport>
    </ThreadPrimitive.Root>
  );
};
```

**Why no ScrollIntoView:**
- `@assistant-ui` library has built-in scroll-to-bottom on new messages
- Composer is always at bottom, so scrolling happens automatically
- Just padding is sufficient

### Example 2: Contact Form (With ScrollIntoView)

**File:** `src/components/scene/contact/ContactForm.tsx`

```tsx
const ContactForm = () => {
  const isMobile = useAtomValue(isMobileAtom);
  const keyboardVisible = useAtomValue(keyboardVisibleAtom);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isMobile) return;

    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement;

      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
        // Scroll entire FormItem (label + input + validation)
        const formItem = target.closest('[data-slot="form-item"]');

        setTimeout(() => {
          if (formItem) {
            formItem.scrollIntoView({
              behavior: "smooth",
              block: "start",
              inline: "nearest",
            });
          } else {
            target.scrollIntoView({
              behavior: "smooth",
              block: "start",
              inline: "nearest",
            });
          }
        }, 350);
      }
    };

    const wrapper = wrapperRef.current;
    if (wrapper) {
      wrapper.addEventListener("focusin", handleFocus);
      return () => wrapper.removeEventListener("focusin", handleFocus);
    }
  }, [isMobile]);

  return (
    <div
      ref={wrapperRef}
      className={cn(
        "flex flex-col h-full w-full px-2 pt-2 gap-2 overflow-y-auto",
        isMobile && keyboardVisible && "pb-[60dvh]"
      )}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField name="name" render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          {/* More fields... */}
        </form>
      </Form>
    </div>
  );
};
```

**Why ScrollIntoView needed:**
- Static form with multiple fields vertically stacked
- Users tab between fields - each needs to scroll into view
- Scrolling to FormItem shows label + input + validation (better UX than input-only)

---

## Implementation Checklist

When adding mobile keyboard support to a new component:

- [ ] Component contains input fields (INPUT or TEXTAREA elements)
- [ ] Parent container has `overflow-y: auto` or `overflow-y: scroll`
- [ ] Import `isMobileAtom` and `keyboardVisibleAtom` from `@/atoms/atomStore`
- [ ] Add conditional `pb-[60dvh]` class to scroll container
- [ ] Determine if explicit ScrollIntoView is needed:
  - [ ] Yes: Component has static fields without auto-scroll behavior
  - [ ] No: Component has built-in scroll (chat, infinite scroll, etc.)
- [ ] If ScrollIntoView needed:
  - [ ] Add `useRef` for wrapper element
  - [ ] Implement `focusin` event listener (not `focus` - it doesn't bubble)
  - [ ] Use `closest()` to find context container (FormItem, wrapper, etc.)
  - [ ] Set 350ms timeout before scrollIntoView
  - [ ] Clean up event listener in useEffect return
- [ ] Test on real iOS Safari and Android Chrome devices
- [ ] Verify labels/context visible with inputs
- [ ] Verify no focus loss or re-render loops

---

## Common Issues and Solutions

### Issue: Padding doesn't create scrollable space

**Symptoms:** Padding applied but scrolling doesn't reveal inputs

**Causes:**
1. Container doesn't have `overflow-y: auto`
2. Container is `height: 100%` without `min-height: 0`
3. Parent flex container doesn't allow shrinking

**Solution:**
```tsx
// Ensure container can shrink and scroll
<div className="flex flex-col h-full"> {/* Parent */}
  <div className="flex-1 overflow-y-auto pb-[60dvh]"> {/* Scrollable */}
    {/* Content */}
  </div>
</div>
```

### Issue: ScrollIntoView doesn't work

**Symptoms:** Focus event fires but scroll doesn't happen

**Causes:**
1. Using `focus` event instead of `focusin` (focus doesn't bubble)
2. No timeout - keyboard animation incomplete when scroll happens
3. Scrolling the input instead of its container

**Solution:**
```tsx
// Use focusin (bubbles), not focus (doesn't bubble)
wrapper.addEventListener("focusin", handleFocus);

// Add timeout for keyboard animation
setTimeout(() => {
  container.scrollIntoView({ behavior: "smooth", block: "start" });
}, 350);
```

### Issue: Keyboard opens and closes rapidly

**Symptoms:** Keyboard flashes on/off when tapping input

**Causes:**
1. Focus loss during keyboard transition
2. Re-render during keyboard detection
3. Input element moving in DOM

**Solution:**
- Don't move DOM elements during keyboard transitions
- Avoid re-renders in keyboard detection hooks
- Use stable event listeners (no dependency on keyboardVisible)

```tsx
// Good: Listener always active on mobile
useEffect(() => {
  if (!isMobile) return;
  // ... attach listener
}, [isMobile]); // Only depends on isMobile

// Bad: Listener recreated on every keyboard change
useEffect(() => {
  if (!isMobile || !keyboardVisible) return;
  // ... attach listener
}, [isMobile, keyboardVisible]); // Re-creates on keyboard change!
```

### Issue: ScrollIntoView scrolls wrong element

**Symptoms:** Page jumps to unexpected position

**Causes:**
1. `closest()` selector doesn't match expected container
2. Multiple matching elements in hierarchy
3. `block: "center"` scrolls too far

**Solution:**
```tsx
// Use data attributes for reliable selection
const formItem = target.closest('[data-slot="form-item"]');

// Use block: "start" to align top of container with viewport top
formItem.scrollIntoView({
  behavior: "smooth",
  block: "start", // Not "center"
  inline: "nearest",
});
```

---

## Performance Considerations

### Event Listener Pattern

**Use event delegation** on the parent container, not individual inputs:

```tsx
// Good: One listener for all inputs
wrapper.addEventListener("focusin", handleFocus);

// Bad: Listener on every input
inputs.forEach(input => input.addEventListener("focus", handleFocus));
```

### Scroll Timing

**350ms delay is empirical** - keyboard animation typically takes 250-300ms:

```tsx
setTimeout(() => {
  container.scrollIntoView({ behavior: "smooth", block: "start" });
}, 350); // Enough time for keyboard animation + padding application
```

Adjust if needed, but 350ms works reliably across iOS Safari and Android Chrome.

### Dependency Arrays

**Minimize effect dependencies** to prevent unnecessary listener recreation:

```tsx
// Good: Only recreates if isMobile changes (effectively once)
useEffect(() => {
  if (!isMobile) return;
  // ... listener
}, [isMobile]);

// Bad: Recreates every time keyboard state changes
useEffect(() => {
  if (!isMobile || !keyboardVisible) return;
  // ... listener
}, [isMobile, keyboardVisible]);
```

---

## Browser Compatibility

### Supported

- ✅ iOS Safari 13+
- ✅ Android Chrome 90+
- ✅ Android Firefox 90+
- ✅ Samsung Internet 14+

### Not Needed

- Desktop browsers (keyboard detection returns false)
- iPadOS in desktop mode (no software keyboard overlay)

### Edge Cases

**iPad in split view:** Software keyboard may appear. Solution works correctly.

**Android keyboard with suggestions bar:** Keyboard detection includes suggestions bar height.

**Third-party keyboards (SwiftKey, Gboard):** Works with all keyboards - detection is viewport-based, not keyboard-specific.

---

## Debugging

### Enable Keyboard Logging

Add logging to keyboard detection hook:

```tsx
// In useViewportMetrics.ts
const handleResize = () => {
  const keyboardHeight = window.innerHeight - window.visualViewport.height;
  const isKeyboardVisible = keyboardHeight > 150;

  console.log('[Keyboard]', {
    windowHeight: window.innerHeight,
    viewportHeight: window.visualViewport.height,
    keyboardHeight,
    isKeyboardVisible,
  });

  setKeyboardVisible(isKeyboardVisible);
};
```

### Check Padding Application

Inspect scroll container in DevTools when keyboard is open:

```tsx
// Should see: padding-bottom: 60dvh
<div class="overflow-y-auto pb-[60dvh]">
```

### Verify Scroll Behavior

Add logging to scroll handler:

```tsx
const handleFocus = (e: FocusEvent) => {
  const target = e.target as HTMLElement;
  const container = target.closest('[data-slot="form-item"]');

  console.log('[Scroll]', {
    target: target.tagName,
    container: container ? 'found' : 'not found',
    containerTag: container?.tagName,
  });

  setTimeout(() => {
    container?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 350);
};
```

### Test on Real Devices

**DevTools mobile emulation is insufficient** - transform3d rendering and keyboard behavior differ on real devices.

Use remote debugging:
- **iOS:** Safari → Develop → [Device Name]
- **Android:** Chrome → chrome://inspect → Devices

---

## Migration Guide

### Migrating from Portal-Based Solutions

If you have existing portal-based keyboard handling:

1. **Remove portal imports:**
   ```diff
   - import { createPortal } from "react-dom";
   ```

2. **Remove portal rendering:**
   ```diff
   - {keyboardVisible && createPortal(
   -   <div className="floating-input">
   -     <Input {...field} />
   -   </div>,
   -   document.body
   - )}
   ```

3. **Add padding to scroll container:**
   ```diff
   - <div className="overflow-y-auto">
   + <div className={cn(
   +   "overflow-y-auto",
   +   isMobile && keyboardVisible && "pb-[60dvh]"
   + )}>
   ```

4. **Add ScrollIntoView if needed** (see Implementation Pattern above)

5. **Test thoroughly** on real devices - portal and padding solutions behave very differently

### Migrating from CSS-Based Solutions

If you have existing CSS max-height/viewport solutions:

1. **Remove viewport height tracking:**
   ```diff
   - const [viewportHeight, setViewportHeight] = useState(window.innerHeight);
   - // ... viewport resize listener
   ```

2. **Remove CSS variables:**
   ```diff
   - :root {
   -   --viewport-current-height: 100vh;
   - }
   ```

3. **Remove max-height classes:**
   ```diff
   - .keyboard-adjusted {
   -   max-height: var(--viewport-current-height);
   -   overflow-y: auto;
   - }
   ```

4. **Add padding solution** (see Implementation Pattern above)

---

## When NOT to Use This Pattern

This solution is specific to **mobile input fields within transform3d contexts**. Don't use it for:

- **Desktop forms** - No software keyboard overlay exists
- **Modal dialogs** - Dialogs are typically `position: fixed` and escape transform contexts
- **Fullscreen views** - Fullscreen API puts content at document level, outside transform context
- **Non-scrollable layouts** - If the layout can't scroll, padding won't help

For these cases, standard form practices work fine.

---

## Maintenance Notes

### Updating Padding Value

If 60dvh is insufficient (user feedback, keyboard size changes):

1. Test on problematic devices to measure needed space
2. Update padding in both components:
   - `src/components/scene/chat/assistant-ui/thread.tsx`
   - `src/components/scene/contact/ContactForm.tsx`
3. Update documentation (this file and ADR 0004)
4. Test on range of devices (small phones to tablets)

### Updating Scroll Timing

If 350ms delay is insufficient (keyboard animation timing changes):

1. Measure keyboard animation duration on target devices
2. Add 50-100ms buffer to measured duration
3. Update timeout in all scroll handlers
4. Update documentation

### Adding New Components

When adding new forms/inputs to cube faces:

1. Follow Implementation Checklist above
2. Test on real devices immediately
3. Document any component-specific considerations
4. Update this guide if new patterns emerge

---

## Summary

**The mobile keyboard handling solution works by creating scrollable space within the transform3d context:**

1. **60dvh bottom padding** when keyboard visible creates scroll space
2. **scrollIntoView** brings focused inputs (+ context) above keyboard
3. **No DOM movement** prevents focus loss and re-renders
4. **Respects transform3d constraints** instead of fighting them

This is simple, maintainable, performant, and works reliably across mobile browsers.

For architectural decision rationale and failed approaches, see ADR 0004.
