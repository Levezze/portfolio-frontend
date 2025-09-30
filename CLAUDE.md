# Portfolio Frontend

A 3D interactive portfolio application featuring a rotating cube with HTML faces representing different sections (chat, resume, projects, etc.). Built with React Three Fiber, Next.js, and modern web technologies.

---

## Tech Stack

### Core Framework
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **React 18** - UI library

### 3D Graphics
- **React Three Fiber (R3F)** - React renderer for Three.js
- **Drei** - Helper library for R3F (Html, PerspectiveCamera, etc.)
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
│   └── responsive.ts      # Breakpoint definitions (to be created)
│
├── hooks/                  # Custom React hooks
│   └── useResponsiveBreakpoint.ts  # Responsive sizing logic (to be created)
│
├── utils/                  # Utility functions
│   └── cameraCalculations.ts  # Camera/distanceFactor formulas (to be created)
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
- Fixed world size (e.g., 10 units), screen-space size controlled by camera distance

**Html Faces:**
- Drei's `<Html>` component overlays React components on cube faces
- `distanceFactor` prop creates world-space coupling (Html scales with camera distance)
- `transform` prop enables 3D positioning
- `occlude` prop handles visibility when behind geometry

**Responsive Sizing:**
- Height-based breakpoints for desktop/tablet (discrete: 800px, 700px, 650px)
- Percentage-based for mobile (dynamic: vh × 0.9)
- Camera distance adjusts continuously within breakpoints to maintain exact pixel size
- See `docs/decisions/adr_0002.md` for detailed explanation

### State Management with Jotai

**Key Atoms:**
```typescript
// 3D Scene
cubeSizeAtom           // Cube size in world units
faceSizeAtom           // Face size in CSS pixels
cameraDistanceAtom     // Camera Z position
distanceFactorAtom     // Html distanceFactor value

// UI State
activeFaceAtom         // Current active page
isLoadedAtom           // Scene loaded state
currentBreakpointAtom  // Current responsive breakpoint
controlsLayoutAtom     // 'visible' or 'drawer'
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
  --font-sans: 'Inter', sans-serif;
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

### Camera Distance Calculation

**Formula:**
```typescript
distance = (cubeWorldSize × windowHeight) / (targetPixelSize × 2 × tan(fov/2))
```

**Example:**
- Want 800px cube on screen
- Window is 1305px tall
- Cube is 10 world units
- FOV is 50°
- Calculate: distance ≈ 25 units

This makes the 10-unit cube appear as exactly 800px on screen.

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
1. Update breakpoint thresholds in `src/config/responsive.ts`
2. Adjust calculations in `src/hooks/useResponsiveBreakpoint.ts`
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
  ease: "power2.inOut"
});
```

### Responsive Sizing
```typescript
// In Face.tsx
const faceSize = useAtomValue(faceSizeAtom);
<div style={{
  width: `${faceSize}px`,
  height: `${faceSize}px`,
  padding: `0 max(0px, calc((${faceSize}px - 100vw + 80px) / 2))`
}}>
```

---

## Architecture Decisions

Major architectural decisions are documented in `docs/decisions/` as ADRs (Architecture Decision Records):

- **ADR 0001** - [To be documented retrospectively]
- **ADR 0002** - Responsive 3D Cube and HTML Face Sizing System

---

## Notes for AI Assistants

When working on this codebase:
- All 3D positioning is in Three.js world units (not pixels)
- Screen-space sizing requires camera distance calculations
- Atoms are the single source of truth for all state
- Tailwind v4 uses CSS-first config (no JS config file)
- Responsive system uses discrete breakpoints, NOT continuous scaling
- `distanceFactor` creates world-space coupling for Html components
- See ADR 0002 for detailed responsive sizing explanation