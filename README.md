# Lev Zhitnik's Portfolio Frontend

<div align="center">

[![Live Site](https://img.shields.io/badge/🌐_Live-levezze.com-blue?style=for-the-badge)](https://levezze.com)
[![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Three.js](https://img.shields.io/badge/Three.js-R180-black?style=for-the-badge&logo=three.js)](https://threejs.org)

**An interactive 3D cube portfolio that breaks traditional web design boundaries**

[Live Demo](https://levezze.com) • [Report Issue](https://github.com/Levezze/portfolio-frontend/issues) • [LinkedIn](https://www.linkedin.com/in/lev-zhitnik/)

</div>

---

## Overview

Welcome to my portfolio's frontend repository! This isn't your typical portfolio website - it's an immersive 3D experience where navigation happens through a rotating cube. Each face of the cube represents a different aspect of my professional journey, from interactive AI chat to project showcases.

> **Note:** This repository contains only the frontend code. The backend API (Python/FastAPI) is maintained in a private repository for security reasons.

## Features

### Core Experience

- **🎲 3D Cube Navigation** - Six interactive faces, each serving a unique purpose
- **⬅️ Browser Back Button** - Intelligent navigation stack that reverses state changes (pages, dialogs, chat)
- **🤖 AI-Powered Chat** - Natural conversation interface powered by OpenAI
- **🎨 Smooth Animations** - GSAP-powered transitions with optimized rotation paths
- **📱 Responsive Design** - Seamless experience across all devices
- **♿ Accessibility Controls** - Toggle animations for motion sensitivity
- **🌊 Dynamic Environment** - Floating animations and realistic shadow rendering

### The Six Faces

1. **Chat** - AI assistant for interactive Q&A about my experience
2. **Blog** - Insights, thoughts, and technical writing
3. **Projects** - Showcase of technical work and achievements
4. **Contact** - Direct communication form
5. **Resume** - Professional experience and skills
6. **Secret** - _Speak friend, and enter..._

## Tech Stack

### Frontend (This Repo)

```typescript
const frontend = {
  framework: "Next.js 15 with App Router",
  language: "TypeScript",
  runtime: "React 19",
  rendering: "React Three Fiber + Drei",
  animations: "GSAP",
  state: "Jotai",
  data: "SWR",
  ui: {
    styling: "Tailwind CSS v4",
    components: "shadcn/ui",
    assistant: "assistant-ui",
    documents: "react-pdf",
  },
  forms: "EmailJS + React Hook Form",
  validation: "Zod",
  package: "pnpm",
  tooling: "Turbopack + Biome",
};
```

### Backend (Private Repo)

```python
backend = {
    "framework": "FastAPI",
    "language": "Python 3.12",
    "ai": "OpenAI SDK + Agents SDK",
    "database": "PostgreSQL + SQLAlchemy",
    "caching": "Redis",
    "storage": "Cloudflare R2",
    "migrations": "Alembic",
    "containerization": "Docker",
    "package": "uv"
}
```

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Levezze/portfolio-frontend.git
   cd portfolio-frontend
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Required variables:

   ```env
   # API Configuration
   NEXT_PUBLIC_API_URL=http://localhost:8000
   NEXT_PUBLIC_SITE_URL=http://localhost:3000

   # Debug Settings
   NEXT_PUBLIC_DEBUG_VIEWPORT=false

   # EmailJS Configuration (for contact form)
   # Get these from https://dashboard.emailjs.com/
   NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id_here
   NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id_here
   NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key_here
   ```

4. **Run the development server**

   ```bash
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

```bash
pnpm dev          # Start development server with Turbopack
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run Biome linter
pnpm format       # Format code with Biome
```

## Architecture

### Component Structure

```
src/
├── app/                    # Next.js App Router
│   ├── globals.css        # Tailwind v4 config + global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── atoms/                  # Jotai state atoms
│   └── atomStore.ts       # All global state definitions
├── components/
│   ├── scene/             # 3D scene and face components
│   │   ├── CubeWithFaces.tsx   # Main cube with 6 faces
│   │   ├── Scene.tsx           # R3F Canvas setup
│   │   ├── chat/               # Chat face components
│   │   ├── blog/               # Blog face components
│   │   ├── projects/           # Projects face components
│   │   ├── contact/            # Contact face components
│   │   ├── resume/             # Resume face components
│   │   └── secret/             # Secret face components
│   ├── shared/            # Reusable components
│   │   ├── ui/            # shadcn/ui components
│   │   ├── kibo-ui/       # Custom UI components
│   │   └── alerts/        # Alert components
│   ├── footer/            # Navigation footer
│   └── GlobalNavigationManager.tsx
├── lib/
│   ├── api/               # API client & services
│   └── utils/             # Utility functions
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript type definitions
└── config/                # Configuration files
```

### State Management

- **Jotai** - All application state (active face, dimensions, navigation stack, UI state)
  - Atomic state updates with minimal re-renders
  - Simple API: `atom()`, `useAtomValue()`, `useSetAtom()`
  - All atoms defined in `src/atoms/atomStore.ts`
- **Local React state** - Component-specific UI state (form inputs, local toggles)

**Note:** Zustand is installed as a dependency but only used internally by third-party libraries (@react-three/fiber for 3D scene state, @assistant-ui/react for chat state). Application state is managed entirely with Jotai.

### Browser Navigation System

Since navigation is state-driven (no URL routing), the app implements a custom browser back button system using a callback-based approach. See [`docs/decisions/adr_0003.md`](docs/decisions/adr_0003.md) for architecture details.

### API Integration

```typescript
// Centralized API client with error handling
apiClient.get("/endpoint");
apiClient.post("/endpoint", data);

// Service layer for business logic
portfolioService.getProjects();
portfolioService.submitContact(formData);
```

### Data Flow Architecture

#### Client API with Zod Validation

```
[React Component] → [SWR Hook] → [API Client] → [HTTP Request]
                                      ↓
[Type-safe Data] ← [Zod Validation] ← [API Response]
```

All API responses are validated through Zod schemas ensuring runtime type safety and early error detection.

#### Chat WebSocket Architecture

```
[Thread UI] → [WebSocket Adapter] → [WS Manager] → [WebSocket] → [Backend API]
                      ↓                    ↓
              [Tool Transformation]   [Heartbeat/Reconnect]
```

Real-time chat flows through an adapter pattern with automatic reconnection and message queuing for reliable communication.

## Design Philosophy

This portfolio represents a departure from traditional web design. Instead of scrolling through pages, visitors navigate by rotating a 3D cube - each face revealing a different dimension of my professional identity. The design choices reflect:

- **Interactivity over static content**
- **Spatial navigation over linear scrolling**
- **Immersive experience over conventional layouts**
- **Technical prowess through implementation**

## Contributing

While this is a personal portfolio, I welcome:

- 🐛 **Bug reports** - Found something broken? Let me know!
- 💡 **Feature suggestions** - Have an idea? I'd love to hear it!
- 🎨 **Design feedback** - UX/UI improvements always welcome!
- ⭐ **Stars** - If you find this interesting!

### Please Note

This repository is public for **sharing, learning, and collaboration**. While you're welcome to draw inspiration and learn from the code, please **don't copy it outright**. A lot of thought, creativity, and personal expression went into this project.

If you'd like to create something similar:

1. Use it as inspiration, not a template
2. Build your own unique implementation
3. Credit any direct code usage
4. Make it your own!

## License

This project is shared under the principle of open learning. While the code is publicly visible:

- ✅ **Learn from it**
- ✅ **Get inspired**
- ✅ **Reference techniques**
- ❌ **Don't clone it as your portfolio**
- ❌ **Don't represent it as your work**

© 2025 Lev Zhitnik. All rights reserved.

## Acknowledgments

### Special Thanks

- ☕ **My modded Breville Barista Pro & Trade Coffee** - The real MVP of this project
- 🌟 The open-source community for incredible tools and libraries (seriously!)

### Key Dependencies

- [Next.js](https://nextjs.org) - The React framework
- [Three.js](https://threejs.org) - 3D graphics
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) - React renderer for Three.js
- [GSAP](https://greensock.com) - Professional-grade animations
- [assistant-ui](https://assistant-ui.com) - AI chat components
- [shadcn/ui](https://ui.shadcn.com) - Beautifully designed components

## 📬 Contact

I'm always open to interesting opportunities and collaborations!

- 🌐 **Portfolio:** [levezze.com](https://levezze.com)
- 💼 **LinkedIn:** [linkedin.com/in/levzhitnik](https://www.linkedin.com/in/lev-zhitnik/)
- 📧 **Email:** Available through the contact form on my portfolio || contact@levezze.com
- 🐙 **GitHub:** [@Levezze](https://github.com/Levezze)

---

<div align="center">

If you found this interesting, consider giving it a ⭐!

</div>
