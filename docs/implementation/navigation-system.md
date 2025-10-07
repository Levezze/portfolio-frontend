# Browser Navigation System Implementation

## Overview

A callback-based navigation system that enables browser back button functionality in a state-driven application without URL routing. The system maintains a LIFO (Last In, First Out) stack of undo callbacks synchronized with the browser's history API.

**Core Concept:** Forward navigation pushes callbacks onto a stack. Back button pops and executes callbacks to reverse state changes.

## Architecture

### Data Flow

```
User Action (click, AI navigation)
        ↓
navigateToFace({ face: "projects", direction: "forward" })
        ↓
1. Update activeFaceAtom
2. Push callback to navigationStackAtom
        ↓
GlobalNavigationManager detects stack growth
        ↓
window.history.pushState() - Browser history entry created
        ↓
[User presses back button]
        ↓
popstate event fires
        ↓
GlobalNavigationManager pops callback from stack
        ↓
Callback executes: set(activeFaceAtom, previousFace)
        ↓
State reversed - back navigation complete
```

### Component Hierarchy

```
layout.tsx
  └─ <GlobalNavigationManager />  (mounted once at root)
      └─ Listens to popstate events
      └─ Manages navigationStackAtom
      └─ Synchronizes browser history

Navigation.tsx, Projects.tsx, thread.tsx, etc.
  └─ Use navigateToFaceAtom or pushNavigationCallbackAtom
  └─ Push callbacks when user takes forward actions
```

## Core Components

### 1. navigationStackAtom

**Location:** `src/atoms/atomStore.ts:73-79`

Stores the callback stack with metadata.

```typescript
export type NavigationStackItem = {
  callback: () => void;      // Function to execute on back
  label?: string;            // Description for debugging
  timestamp: number;         // When it was pushed
};

export const navigationStackAtom = atom<NavigationStackItem[]>([]);
```

**Purpose:**
- Central storage for all navigation callbacks
- LIFO queue - most recent callback is at the end
- Labels enable debugging via console logs

### 2. navigateToFaceAtom

**Location:** `src/atoms/atomStore.ts:84-116`

Write-only atom for page navigation with explicit direction.

```typescript
export const navigateToFaceAtom = atom(
  null,  // Write-only: no read value
  (get, set, update: { face: PagesType; direction: "forward" | "backward" }) => {
    const previousFace = get(activeFaceAtom);

    // Always update the face
    set(activeFaceAtom, update.face);

    // Only push to navigation stack on forward navigation
    if (update.direction === "forward" && previousFace !== update.face) {
      set(navigationStackAtom, (prev) => [
        ...prev,
        {
          // IMPORTANT: Callback directly updates activeFaceAtom
          // NOT through navigateToFaceAtom (would cause infinite loop)
          callback: () => set(activeFaceAtom, previousFace),
          label: `Return to ${previousFace} page`,
          timestamp: Date.now(),
        },
      ]);

      if (process.env.NODE_ENV === "development") {
        console.log(
          `[Navigation] Forward: ${previousFace} → ${update.face} (stack size: ${get(navigationStackAtom).length + 1})`
        );
      }
    } else if (update.direction === "backward") {
      if (process.env.NODE_ENV === "development") {
        console.log(`[Navigation] Backward: → ${update.face} (no stack push)`);
      }
    }
  }
);
```

**Key Design Decisions:**

1. **Write-Only Atom** - First parameter is `null`, making this an action trigger, not a readable value
2. **Explicit Direction** - Prevents infinite loops by distinguishing forward actions from backward undo operations
3. **Direct Callback Updates** - Callbacks use `set(activeFaceAtom, previousFace)` instead of `set(navigateToFaceAtom, ...)` because you can't "set" a write-only atom
4. **Guard Against Self-Navigation** - `previousFace !== update.face` prevents pushing callbacks when navigating to the same page

### 3. pushNavigationCallbackAtom

**Location:** `src/atoms/atomStore.ts:120-146`

Write-only atom for pushing custom callbacks (dialogs, modals, etc.).

```typescript
export const pushNavigationCallbackAtom = atom(
  null,
  (get, set, update: { callback: () => void; label?: string }) => {
    set(navigationStackAtom, (prev) => [
      ...prev,
      {
        ...update,
        timestamp: Date.now(),
      },
    ]);

    // Push browser history state to match the callback
    if (typeof window !== "undefined") {
      window.history.pushState(
        { navId: `action-${Date.now()}`, managed: true },
        "",
        window.location.href
      );
    }

    if (process.env.NODE_ENV === "development") {
      console.log(
        `[Navigation] Pushed: ${update.label || "unnamed"} (stack size: ${get(navigationStackAtom).length + 1})`
      );
    }
  }
);
```

**Purpose:**
- Used for non-page navigation (dialogs, modals, fullscreen views)
- Also pushes browser history state for synchronization
- More flexible than `navigateToFaceAtom` - accepts any callback

**When to Use:**
- Opening dialogs/modals
- Entering fullscreen mode
- Starting chat threads
- Any state change that should be reversible with back button

### 4. GlobalNavigationManager

**Location:** `src/components/GlobalNavigationManager.tsx`

Centralized component that coordinates all navigation behavior.

#### Browser History Synchronization

**Lines 40-55:**

```typescript
// Track previous stack length to detect additions
const previousStackLengthRef = useRef(stack.length);

// Push browser history state when stack grows (forward navigation)
useEffect(() => {
  if (stack.length > previousStackLengthRef.current && typeof window !== "undefined") {
    // Stack grew - user navigated forward
    window.history.pushState(
      { navId: `nav-${Date.now()}`, managed: true },
      "",
      window.location.href
    );

    if (process.env.NODE_ENV === "development") {
      console.log(`[Navigation] History pushed (stack size: ${stack.length})`);
    }
  }
  previousStackLengthRef.current = stack.length;
}, [stack.length]);
```

**How It Works:**
- Watches `stack.length` for changes
- When stack grows (new callback added), pushes browser history entry
- Uses `navId` with timestamp to uniquely identify each entry
- `managed: true` flag indicates this is a managed navigation state

#### Popstate Handler with stackRef Pattern

**Lines 33-35, 87-144:**

```typescript
// Ref to access current stack without recreating popstate handler
const stackRef = useRef(stack);
stackRef.current = stack;  // Updated on every render

// Listen for popstate events (back button from any source)
useEffect(() => {
  if (typeof window === "undefined") return;

  const handlePopState = (event: PopStateEvent) => {
    // Access current stack via ref (not closure)
    const currentStack = stackRef.current;

    if (process.env.NODE_ENV === "development") {
      console.log(
        `[Navigation] popstate fired, stack size: ${currentStack.length}`,
        event.state
      );
    }

    if (currentStack.length > 0) {
      // Pop and execute the most recent callback
      setStack((prev) => {
        if (prev.length === 0) return prev;

        const item = prev[prev.length - 1];

        if (process.env.NODE_ENV === "development") {
          console.log(
            `[Navigation] Executing: ${item.label || "unnamed"} (remaining: ${prev.length - 1})`
          );
        }

        try {
          item.callback();
        } catch (error) {
          console.error("[Navigation] Error executing callback:", error);
        }

        // Return new stack without the executed item
        return prev.slice(0, -1);
      });

      // DON'T push forward - let browser naturally handle back navigation
    } else {
      // Stack is empty - prevent app exit by pushing forward
      window.history.pushState(
        { navId: `trap-${Date.now()}`, managed: true },
        "",
        window.location.href
      );

      if (process.env.NODE_ENV === "development") {
        console.log("[Navigation] Back pressed with empty stack - trapped");
      }
    }
  };

  window.addEventListener("popstate", handlePopState);

  return () => {
    window.removeEventListener("popstate", handlePopState);
  };
}, [setStack]); // Only recreate if setStack changes (effectively never)
```

**stackRef Pattern Explanation:**

1. **Problem:** Event handlers capture values in closures. If we used `stack` in the dependency array, the handler would be recreated on every stack change, potentially missing events.

2. **Solution:**
   - Create a ref: `const stackRef = useRef(stack)`
   - Update ref on every render: `stackRef.current = stack`
   - Use ref in handler: `const currentStack = stackRef.current`
   - Minimal dependencies: Only `[setStack]` which never changes

3. **Result:** Stable handler that always accesses current stack value

**Behavior:**

- **Stack has callbacks:** Pop and execute, let browser go back naturally (don't push forward)
- **Stack is empty:** Push forward to trap back button and prevent app exit

**Critical Note:** After executing a callback, we do NOT push history forward. This cooperates with the browser's natural back navigation instead of fighting it.

## Usage Patterns

### Pattern 1: Page Navigation

**File:** `src/components/footer/Navigation.tsx:56, 77, 98, 119, 140`

Used when users click navigation buttons to change pages/faces.

```typescript
import { useSetAtom } from "jotai";
import { navigateToFaceAtom } from "@/atoms/atomStore";

const Navigation = () => {
  const navigateToFace = useSetAtom(navigateToFaceAtom);

  return (
    <button
      onClick={() => {
        navigateToFace({ face: "projects", direction: "forward" });
      }}
    >
      Projects
    </button>
  );
};
```

**Key Points:**
- Always use `direction: "forward"` for user-initiated navigation
- navigateToFaceAtom handles callback creation automatically
- Previous face is captured in closure and restored on back

### Pattern 2: Dialog/Modal Navigation

**File:** `src/components/scene/projects/Projects.tsx:21-36`

Used when opening dialogs that should close on back button.

```typescript
import { useSetAtom, useAtom } from "jotai";
import { pushNavigationCallbackAtom } from "@/atoms/atomStore";

const ProjectDialog = ({ project }) => {
  const [isOpen, setIsOpen] = useState(false);
  const pushCallback = useSetAtom(pushNavigationCallbackAtom);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);

    if (open) {
      // Dialog opened - push callback to close it
      pushCallback({
        callback: () => setIsOpen(false),
        label: `Close ${project.title}`,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger>Open</DialogTrigger>
      <DialogContent>
        <ProjectView projectTitle={project.slug} />
      </DialogContent>
    </Dialog>
  );
};
```

**Key Points:**
- Use `pushNavigationCallbackAtom` for non-page state changes
- Push callback when dialog opens (in `handleOpenChange` when `open === true`)
- Callback should reverse the state change (set `isOpen` back to `false`)
- Label helps with debugging

**Same Pattern Used In:**
- `src/components/scene/projects/MediaGallery.tsx:35-48` - Fullscreen image/video viewer
- Any Dialog, Modal, Sheet, or similar overlay component

### Pattern 3: Chat Thread Navigation

**File:** `src/components/scene/chat/assistant-ui/thread.tsx:57-90`

Used to reset chat thread when user presses back.

```typescript
import { useSetAtom } from "jotai";
import { pushNavigationCallbackAtom } from "@/atoms/atomStore";
import { useAssistantRuntime, useThread } from "@assistant-ui/react";

const ChatBackButton = () => {
  const runtime = useAssistantRuntime();
  const thread = useThread();
  const pushCallback = useSetAtom(pushNavigationCallbackAtom);
  const hasPushedCallbackRef = useRef(false);

  // Track when thread starts (first message sent) and push navigation callback
  useEffect(() => {
    const hasMessages = thread.messages && thread.messages.length > 0;

    if (hasMessages && !hasPushedCallbackRef.current) {
      // Thread has started - push callback to reset thread
      pushCallback({
        callback: () => runtime.switchToNewThread(),
        label: "Start new chat",
      });
      hasPushedCallbackRef.current = true;
    } else if (!hasMessages && hasPushedCallbackRef.current) {
      // Thread was reset - allow callback to be pushed again on next thread
      hasPushedCallbackRef.current = false;
    }
  }, [thread.messages, runtime, pushCallback]);

  // ... rest of component
};
```

**Key Points:**
- Use ref to track whether callback has been pushed for current thread
- Push callback when first message appears (`hasMessages && !hasPushedCallbackRef`)
- Reset ref when thread is cleared to allow new callback on next thread
- Prevents duplicate callbacks for the same thread

### Pattern 4: AI-Initiated Navigation

**File:** `src/components/scene/chat/ToolExecutor.tsx:8-34`

Used when AI navigates user to a different page via tool execution.

```typescript
import { useSetAtom } from "jotai";
import { navigateToFaceAtom } from "@/atoms/atomStore";
import { makeAssistantToolUI } from "@assistant-ui/react";

export const NavigationToolUI = makeAssistantToolUI<
  { page: PagesType },
  unknown
>({
  toolName: "navigate_page",
  render: ({ args, result, status }) => {
    const navigateToFace = useSetAtom(navigateToFaceAtom);

    useEffect(() => {
      // AI-initiated navigation is considered "forward" navigation
      navigateToFace({ face: args.page, direction: "forward" });
    }, [args.page, navigateToFace]);

    return (
      <span>{`Taking you to the ${capitalFirstLetter(args.page)} page`}</span>
    );
  },
});
```

**Key Points:**
- AI navigation is treated as "forward" navigation
- User should be able to press back after AI navigates them
- Same pattern as user-initiated navigation, just triggered by AI

## Important Notes

### Direction Parameter Rules

**Always use `direction: "forward"` for:**
- User clicking navigation buttons
- User opening dialogs/modals
- User starting chat threads
- AI navigating on behalf of user
- Any user-initiated or AI-initiated action that should be reversible

**Never use `direction: "backward"`** unless you're implementing a custom back button (not recommended - let browser handle it).

### Callback Design Rules

1. **Direct Atom Updates Only**
   ```typescript
   // ✅ CORRECT
   callback: () => set(activeFaceAtom, previousFace)

   // ❌ WRONG - Won't execute
   callback: () => set(navigateToFaceAtom, { face: previousFace, direction: "backward" })
   ```

2. **Capture State in Closure**
   ```typescript
   // ✅ CORRECT - previousFace captured when callback created
   const previousFace = get(activeFaceAtom);
   callback: () => set(activeFaceAtom, previousFace)

   // ❌ WRONG - Would read current face, not previous
   callback: () => {
     const face = get(activeFaceAtom);
     set(activeFaceAtom, face);
   }
   ```

3. **Keep Callbacks Simple**
   ```typescript
   // ✅ CORRECT
   callback: () => setIsOpen(false)

   // ⚠️ ACCEPTABLE but complex
   callback: () => {
     setIsOpen(false);
     setProjectView("project");
     triggerAnimation();
   }
   ```

### Component Mounting

GlobalNavigationManager MUST be mounted once at the root level:

**File:** `src/app/layout.tsx:59`

```typescript
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <GlobalNavigationManager />  {/* ← Mounted here */}
        <ThemeWrapper>{children}</ThemeWrapper>
      </body>
    </html>
  );
}
```

**Do NOT:**
- Mount multiple instances
- Mount inside a route/page component
- Conditionally render it

### Browser History State Format

All history states include metadata for debugging:

```typescript
{
  navId: "nav-1696823456789",    // Unique identifier with timestamp
  managed: true                   // Indicates managed by navigation system
}
```

**State Types:**
- `nav-{timestamp}` - Normal forward navigation
- `action-{timestamp}` - Custom callback (dialog, modal, etc.)
- `trap-{timestamp}` - Empty stack trap to prevent exit

### Debugging

Enable development logs by ensuring `NODE_ENV === "development"`:

```
[Navigation] Forward: chat → projects (stack size: 1)
[Navigation] History pushed (stack size: 1)
[Navigation] popstate fired, stack size: 1
[Navigation] Executing: Return to chat page (remaining: 0)
```

**Log Locations:**
- `navigateToFaceAtom` - Forward/backward navigation logs
- `pushNavigationCallbackAtom` - Callback push logs
- `GlobalNavigationManager` - History push, popstate, execution logs

## Limitations

1. **No Forward Button** - System only supports back navigation. Browser forward button won't work as expected since we don't maintain forward state.

2. **No Persistence** - Navigation stack is lost on page refresh. This is acceptable for a single-page application.

3. **Manual Direction Tracking** - Developers must remember to use `direction: "forward"`. TypeScript enforces this at compile time.

4. **Memory Overhead** - Each navigation stores a callback function. In practice, this is negligible unless users perform hundreds of actions.

5. **No URL Fragments** - Unlike hash-based routing, this system doesn't modify URLs, so navigation state can't be bookmarked or shared.

## File Locations

### Core Implementation
- `src/atoms/atomStore.ts:73-146` - Navigation atoms
- `src/components/GlobalNavigationManager.tsx` - Centralized manager
- `src/app/layout.tsx:59` - Manager mounting point

### Usage Examples
- `src/components/footer/Navigation.tsx:56, 77, 98, 119, 140` - Page navigation
- `src/components/scene/projects/Projects.tsx:21-36` - Dialog navigation
- `src/components/scene/projects/MediaGallery.tsx:35-48` - Fullscreen media viewer
- `src/components/scene/chat/assistant-ui/thread.tsx:57-90` - Chat thread navigation
- `src/components/scene/chat/ToolExecutor.tsx:8-34` - AI navigation

### Deprecated Files (No Longer Used)
- `src/hooks/useNavigationStack.ts` - Old component-level hook approach
- `src/components/NavigationListener.tsx` - Old distributed listener

## Related Documentation

- **Architecture Decision Record:** `docs/decisions/adr_0003.md` - Why this system exists and design rationale
- **Project Instructions:** `CLAUDE.md` - General project structure and conventions
