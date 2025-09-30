# Portfolio Frontend

A 3D interactive portfolio application featuring a rotating cube with HTML faces representing different sections (chat, resume, projects, etc.). Built with React Three Fiber, Next.js, and modern web technologies.

---

## Tech Stack

### pnpm!

### Core Framework

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **React 18** - UI library

### 3D Graphics

- **React Three Fiber (R3F)** - React renderer for Three.js
- **Drei** - Helper library for R3F (Html, OrthographicCamera, etc.)
- **Three.js** - WebGL 3D library
- **GSAP** - Animation library for cube rotations

### State Management

- **Jotai** - Primitive and flexible state management
  - Atomic state updates
  - Minimal re-renders
  - Simple API: `atom()`, `useAtomValue()`, `useSetAtom()`
  - All atoms defined in `src/atoms/atomStore.ts`

### Styling

- **Tailwind CSS v4** - Utility-first CSS framework
  - **Key Change from v3:** CSS-first configuration via `globals.css` instead of `tailwind.config.js`
  - Use `@theme` directive to define custom properties
  - Custom utilities via `@utility` directive
  - Example in `src/app/globals.css`

### AI Integration

- **@assistant-ui** - Chat interface components
- **AI SDK** - AI/LLM integration tools

---

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── globals.css        # Tailwind v4 config + global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
│
├── atoms/                  # Jotai state atoms
│   └── atomStore.ts       # All global state definitions
│
├── components/             # React components
│   ├── scene/             # 3D scene components
│   │   ├── CubeWithFaces.tsx   # Main cube with 6 HTML faces
│   │   ├── BowlGroundPlane.tsx # Background sphere
│   │   ├── chat/          # Chat page components
│   │   ├── resume/        # Resume page components
│   │   ├── projects/      # Projects page components
│   │   ├── about/         # About page components
│   │   ├── contact/       # Contact page components
│   │   └── secret/        # Secret page components
│   │
│   ├── shared/            # Reusable components
│   │   └── Face.tsx       # Face wrapper component
│   │
│   ├── footer/            # Footer components
│   ├── Scene.tsx          # Main R3F Canvas setup
│   ├── LoadingScene.tsx   # Loading state
│   └── SceneDebugger.tsx  # Development debugging
│
├── config/                 # Configuration files
│   └── responsive.ts      # Breakpoint definitions
│
├── hooks/                  # Custom React hooks
│   └── useResponsiveFaceSize.ts  # CSS variable reading hook
│
├── utils/                  # Utility functions
│   ├── deviceDetection.ts # Mobile device detection
│   └── general.ts         # Generic utilities (cn, etc.)
│
├── lib/                    # External integrations
│   └── api/               # API client code
│
└── types/                  # TypeScript type definitions
    └── cubeTypes.ts       # Cube-related types
```

---

## Key Concepts

### 3D Scene Architecture

**The Cube:**

- 6 faces representing different pages (chat, about, projects, contact, resume, secret)
- Rotates using GSAP animations when active face changes
- Variable world size (5-8 units) controlled by `cubeSizeAtom`
- Screen-space size = `cubeSize × zoom` (simple formula with OrthographicCamera)

**Html Faces:**

- Drei's `<Html>` component overlays React components on cube faces
- `distanceFactor={4}` creates scaling relationship with OrthographicCamera
- `transform` prop enables 3D positioning
- `occlude` prop handles visibility when behind geometry

**Responsive Sizing:**

- **OrthographicCamera with fixed zoom=100** (not PerspectiveCamera)
- CSS breakpoints define target sizes via `--face-size` variable
- React hook reads CSS variable and updates `cubeSizeAtom`
- Formula: `screenPixels = cubeWorldUnits × zoom`
- Example: 6.5 world units × 100 zoom = 650px on screen
- **Zero continuous scaling** - size only changes at CSS breakpoint boundaries
- See `docs/decisions/adr_0002.md` for detailed explanation

### State Management with Jotai

**Key Atoms:**

```typescript
// 3D Scene
cubeSizeAtom; // Cube size in world units (5-8)
faceSizeAtom; // Face size in CSS pixels (500-800)
isLoadedAtom; // Scene loaded state

// UI State
activeFaceAtom; // Current active page
cubeColorAtom; // Current cube color
pageColorAtom; // Page theme color
```

**Usage Pattern:**

```typescript
// Read value
const faceSize = useAtomValue(faceSizeAtom);

// Write value
const setFaceSize = useSetAtom(faceSizeAtom);
setFaceSize(800);

// Read and write
const [faceSize, setFaceSize] = useAtom(faceSizeAtom);
```

### Tailwind v4 Configuration

**In `src/app/globals.css`:**

```css
@import "tailwindcss";

/* Define custom theme values */
@theme {
  --color-primary: #3b82f6;
  --font-sans: "Inter", sans-serif;
}

/* Define custom utilities */
@utility {
  .glass-effect {
    backdrop-filter: blur(10px);
    background: rgba(255, 255, 255, 0.1);
  }
}

/* Regular CSS */
.cube-face {
  position: relative;
  /* ... */
}
```

**No `tailwind.config.js` needed** - everything is in CSS using directives.

### OrthographicCamera Sizing Formula

**Simple Formula:**

```typescript
screenPixels = cubeWorldUnits × zoom
```

**To achieve target size:**

```typescript
cubeWorldUnits = targetPixels / zoom;
```

**Examples:**

- 800px target, zoom=100 → cubeSize = 8.0 world units
- 650px target, zoom=100 → cubeSize = 6.5 world units
- 500px target, zoom=100 → cubeSize = 5.0 world units

**Why OrthographicCamera:**

- Fixed zoom means fixed pixel-to-world-unit ratio
- No perspective distortion
- Window resize doesn't affect size (unless CSS breakpoint changes)
- Much simpler than PerspectiveCamera calculations

---

## Important Files

### Configuration & State

- `src/atoms/atomStore.ts` - All global state atoms
- `src/config/responsive.ts` - Breakpoint definitions
- `src/app/globals.css` - Tailwind v4 config + global styles

### Core Components

- `src/components/Scene.tsx` - R3F Canvas setup, camera configuration
- `src/components/scene/CubeWithFaces.tsx` - Main cube with face management
- `src/components/shared/Face.tsx` - Face wrapper with responsive padding

### Documentation

- `docs/decisions/adr_0002.md` - Responsive sizing architecture decision
- `.dev/responsive-implementation-todo.md` - Implementation checklist

---

## Development Workflow

### Running the Project

```bash
npm run dev    # Start development server
npm run build  # Production build
npm run lint   # ESLint
```

### Adding a New Cube Face

1. Create component in `src/components/scene/{pageName}/`
2. Add to `cubeFaces` object in `CubeWithFaces.tsx`
3. Define position, rotation, and htmlRotation
4. Add to `PagesType` in types

### Modifying Responsive Behavior

1. Update CSS breakpoints in `src/app/globals.css` (`:root` and `@media` queries)
2. Update `cubeSizeAtom` calculation logic in hook to match new breakpoints
3. Test at various viewport sizes
4. Document changes in ADR if significant

### Debugging 3D Issues

- Use `<SceneDebugger />` (already in Scene.tsx)
- Logs: scene, camera, size, viewport to console
- Enable OrbitControls temporarily to inspect geometry
- Use React DevTools Profiler for performance

---

## Common Patterns

### Accessing 3D State

```typescript
// In a component inside <Canvas>
const { scene, camera, size, viewport } = useThree();
```

### Animating the Cube

```typescript
gsap.to(cubeRef.current.rotation, {
  x: targetRotation.x,
  y: targetRotation.y,
  duration: 0.8,
  ease: "power2.inOut",
});
```

### Responsive Sizing

```typescript
// CSS breakpoints in globals.css
:root {
  --face-size: 800px;
}
@media (max-height: 999px) {
  :root { --face-size: 650px; }
}

// Hook reads CSS variable and updates atom
const setFaceSize = useSetAtom(faceSizeAtom);
const size = getComputedStyle(root).getPropertyValue('--face-size');
setFaceSize(parseInt(size));

// Cube size formula
cubeSizeAtom = faceSizeAtom / 100;  // e.g., 650 / 100 = 6.5
```

---

## Architecture Decisions

Major architectural decisions are documented in `docs/decisions/` as ADRs (Architecture Decision Records):

- **ADR 0001** - [To be documented retrospectively]
- **ADR 0002** - Responsive 3D Cube and HTML Face Sizing System

---

## Notes for AI Assistants

When working on this codebase:

- **Camera:** OrthographicCamera with fixed zoom=100 (NOT PerspectiveCamera)
- **Sizing formula:** `screenPixels = cubeWorldUnits × zoom` (simple!)
- **Breakpoints:** Defined in CSS via `--face-size` variable
- **No JavaScript resize logic** - CSS handles everything
- Atoms are the single source of truth for all state
- Tailwind v4 uses CSS-first config (no JS config file)
- Responsive system uses discrete breakpoints, NOT continuous scaling
- `distanceFactor={4}` is empirically determined for zoom=100
- See ADR 0002 for detailed responsive sizing explanation and lessons learned
