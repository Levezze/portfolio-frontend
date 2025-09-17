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
- **🤖 AI-Powered Chat** - Natural conversation interface powered by OpenAI
- **🎨 Smooth Animations** - GSAP-powered transitions with optimized rotation paths
- **📱 Responsive Design** - Seamless experience across all devices
- **♿ Accessibility Controls** - Toggle animations for motion sensitivity
- **🌊 Dynamic Environment** - Floating animations and realistic shadow rendering

### The Six Faces

1. **Chat** - AI assistant for interactive Q&A about my experience
2. **About** - Personal introduction and professional background
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
  rendering: "React Three Fiber + Drei",
  animations: "GSAP",
  state: "Jotai + Zustand",
  ui: {
    styling: "Tailwind CSS v4",
    components: "shadcn/ui",
    assistant: "assistant-ui",
  },
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
    "ai": "OpenAI SDK + Custom Agents",
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
   NEXT_PUBLIC_API_URL=http://localhost:8000  # Your backend API URL
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
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
├── app/                    # Next.js app router
├── components/
│   ├── 3d/                # Three.js components
│   │   ├── CubeWithFaces  # Main cube logic
│   │   ├── Scene          # 3D scene setup
│   │   └── ...
│   ├── faces/             # Cube face components
│   ├── assistant-ui/      # AI chat interface
│   └── ui/                # shadcn/ui components
├── lib/
│   ├── api/               # API client & services
│   └── hooks/             # Custom React hooks
└── atoms/                 # Jotai state atoms
```

### State Management

The app uses a hybrid approach:

- **Jotai** for global UI state (active face, dimensions)
- **Zustand** for complex state logic
- **Local state** for component-specific needs

### API Integration

```typescript
// Centralized API client with error handling
apiClient.get("/endpoint");
apiClient.post("/endpoint", data);

// Service layer for business logic
portfolioService.getProjects();
portfolioService.submitContact(formData);
```

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

- ☕ **Trade Coffee** - The fuel
- ☕ **My modded Breville Barista Pro** - The real MVP of this project
- 🌟 The open-source community for incredible tools and libraries

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
