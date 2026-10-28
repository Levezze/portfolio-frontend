/**
 * Real site content for the lab pages, copied from the backend seeds
 * (portfolio-backend/scripts/seed_projects.py and seed_chat_config.py) so the
 * prototype shows what the live site says. Nothing here is invented; where
 * the seed has no value (a project's year or role) the field is absent.
 * The aēv entries (2026-10-28) are not in the seeds yet: written from the
 * AevArk repos at the user's request.
 */

const R2 = "https://pub-8cd13f499aba45a08aa5d342d7244fe7.r2.dev/";

/**
 * Same-origin URL for a project file. R2 sends no CORS header, so a direct
 * <img> would taint the page snapshot; the Next image route proxies it.
 * Animated GIFs pass through the optimizer unconverted.
 */
export const mediaSrc = (key: string, w = 1200) =>
  `/_next/image?url=${encodeURIComponent(key.startsWith("/") || key.startsWith("https://") ? key : R2 + key)}&w=${w}&q=75`;
/**
 * Video can't go through the image route. Keys starting with "/" are small
 * re-encodes in public/media; the rest are served straight from R2.
 */
export const videoSrc = (key: string) => (key.startsWith("/") ? key : R2 + key);

export type Media = {
  kind: "image" | "video";
  key: string;
  caption: string;
  /** A still for a video: its gallery thumbnail and its snapshot stand-in. */
  poster?: string;
};

const CBC_WORDMARK =
  "https://raw.githubusercontent.com/Levezze/chatbotchat/main/logo/chatbotchat-logo-dark-transparent.png";

export type Project = {
  slug: string;
  name: string;
  short: string;
  /** Paragraphs. */
  description: string[];
  stack: string[];
  demo?: string;
  github?: string;
  /** A light still for the list tile; full-quality media stays in the detail view. */
  still: string;
  /** The still is a small wordmark: shown at its own size, never stretched. */
  logo?: boolean;
  /**
   * A short, slow, low-quality loop that replaces the still on the list tile
   * only; the project page shows the full-quality media. Re-encoded from the
   * old thumbnail GIFs (10–11MB each) to MP4.
   */
  thumb?: Media;
  media: Media[];
};

export const PROJECTS: Project[] = [
  {
    slug: "aev",
    name: "aēv (AevArk)",
    short:
      "Pet longevity lab, where I'm the technical co-founder and only engineer",
    description: [
      "aēv is a pet longevity lab I co-founded in 2026. I'm the technical co-founder and the only engineer on the founding team. Together with veterinarians and researchers we're building a new kind of product: a proprietary process that turns a pet's bloodwork, history and lifestyle into a longevity assessment that owners can act on and vets can review.",
      "I designed and built the whole platform: four services, from a Next.js client for owners and vets to a Node.js API and Python processing, with typed contracts generated across them. They run on Google Cloud Run and talk over Pub/Sub.",
      "The AI side is built as multi-step LLM pipelines with validation at each step: lab reports are read and checked against the source before anything is used, written results are drafted and audited in separate steps, and whatever fails validation goes to a person for review.",
      "Beyond the code I own product, UI/UX design, infrastructure, CI and release automation, and the data work.",
    ],
    stack: [
      "Next.js",
      "React",
      "TypeScript",
      "Tailwind CSS",
      "Node.js",
      "Hono",
      "Prisma",
      "PostgreSQL",
      "Python",
      "FastAPI",
      "Pydantic",
      "SQLAlchemy",
      "Gemini",
      "OpenAI",
      "Google Cloud Run",
      "Pub/Sub",
      "Clerk",
      "Stripe",
    ],
    demo: "https://www.aevark.com/",
    still: "/media/projects/aev/list.jpg",
    media: [
      {
        kind: "image",
        key: "/media/projects/aev/home.jpg",
        caption: "Home page",
      },
      {
        kind: "image",
        key: "/media/projects/aev/companion-desktop-v2.jpg",
        caption: "Companion dashboard",
      },
      {
        kind: "image",
        key: "/media/projects/aev/companion-phone.jpg",
        caption: "Companion dashboard on a phone",
      },
      {
        kind: "image",
        key: "/media/projects/aev/pillars-phone.jpg",
        caption: "Health pillars on a phone",
      },
    ],
  },
  {
    slug: "cties",
    name: "C-Ties",
    short: "Generative-AI urban planning and collaboration platform",
    description: [
      "I co-founded and built C-Ties in 2022, a generative AI platform that revolutionizes urban planning by modeling millions of 3D design iterations with real-time KPI analysis and multi-disciplinary collaboration. The platform replaces fragmented workflows with unified, programmable logic that simultaneously evaluates density, climate impact, and regulatory compliance.",
      "As the technical lead, I designed the system architecture bridging domain-specific CAD tools (Grasshopper, RhinoCompute) with modern web technologies and practices utilizing React, Node.js, Flask, PostgreSQL, and Python. The platform processed planning decisions for projects housing 100,000+ future residents, reducing design iteration time by 40% while ensuring regulatory compliance across all variations.",
      "Deployed in production for ongoing large-scale urban developments, the system combines parametric 3D pipelines with machine learning optimization to enhance bottom-line ROI and ESG outcomes.",
    ],
    stack: [
      "React",
      "Flask",
      "Python",
      "Pandas",
      "NumPy",
      "Scikit-learn",
      "PostgreSQL",
      "Grasshopper",
      "RhinoCommon",
      "RhinoCompute",
      "Hops",
      "Mapbox",
      "GIS",
      "Ladybug",
      "LunchboxML",
      "Blender",
    ],
    demo: "https://www.cties.net/",
    still: "/media/projects/cties/scenario-3.jpg",
    thumb: {
      kind: "video",
      key: "/media/projects/cties/thumb.mp4",
      poster: "/media/projects/cties/thumb.jpg",
      caption: "C-Ties",
    },
    media: [
      {
        // Re-encoded from projects/cties/animation_ui.gif (20MB) to MP4.
        kind: "video",
        key: "/media/projects/cties/animation-ui.mp4",
        poster: "/media/projects/cties/animation-ui.jpg",
        caption: "Dashboard UI Animation",
      },
      {
        kind: "video",
        key: "/media/projects/cties/animation-1080p.mp4",
        poster: "/media/projects/cties/animation-1080p.jpg",
        caption: "Generative AI Animation",
      },
      {
        kind: "image",
        key: "/media/projects/cties/scenario-3.jpg",
        caption: "Scenario #8 in dashboard",
      },
      {
        kind: "image",
        key: "/media/projects/cties/scenario-4.jpg",
        caption: "Scenario #16 in dashboard",
      },
    ],
  },
  {
    slug: "chatbotchat",
    name: "chatbotchat",
    short:
      "Open-source message bus that lets AI coding agents talk across repos and providers",
    description: [
      "chatbotchat (cbc) is a local message bus that lets AI coding agents talk to each other directly, across repos and sessions, without me copying messages between terminals. One always-on Rust daemon owns the conversation state in SQLite. Agents reach it through the same actions exposed as MCP tools and as a CLI, so it works with Claude Code, Codex and any other MCP client.",
      "The design goal is bounded autonomy, not a black-box agent swarm. Two agents in a room trade messages hands-free: each waits on a background poll and re-reads the room before replying instead of trusting its own compacted memory. A soft cap on autonomous turns pulls the human back in, and a room only closes when both sides vote to close it.",
      "On top of the bus I run a hierarchy of agents through skills: a project lead over repo leads, feature leads and task agents, plus orchestrator, peer and reconcile roles for coordinating parallel work across repos and worktrees. It's how I run agentic development day to day.",
    ],
    stack: [
      "Rust",
      "Tokio",
      "axum",
      "SQLite",
      "SQLx",
      "MCP",
      "Claude Code",
      "Codex",
    ],
    github: "https://github.com/Levezze/chatbotchat",
    still: CBC_WORDMARK,
    logo: true,
    media: [{ kind: "image", key: CBC_WORDMARK, caption: "chatbotchat logo" }],
  },
  {
    slug: "fishnt",
    name: "Fishnt",
    short:
      "Pomodoro timer that learns your work patterns and suggests AI-driven adjustments",
    description: [
      "A Pomodoro timer app that learns your actual work patterns over time. Instead of rigid presets, Fishnt tracks how you extend, skip, and interact with timers — then uses AI to suggest personalized adjustments. The longer you use it, the more accurately it reflects how you actually work.",
      "Built on an offline-first, event-driven architecture: the frontend queues timer events locally and syncs them to a FastAPI backend, which processes and stores behavioral session data in MongoDB. A separate Python worker service handles all the heavy lifting — aggregating session data with Pandas, generating daily, weekly, and monthly AI insights via OpenAI, and producing data visualizations to surface productivity trends. The worker also runs the auto-adjustment logic, analyzing each user's interaction patterns to recommend timer modifications tailored to how they actually work. Currently in beta at fishnt.app.",
    ],
    stack: [
      "TypeScript",
      "Python",
      "FastAPI",
      "MongoDB",
      "Pydantic",
      "Beanie",
      "OpenAI",
      "Next.js",
      "Tailwind CSS",
      "Jotai",
      "TanStack Router",
      "Railway",
      "Redis",
      "Cloudflare R2",
      "Pandas",
      "NumPy",
    ],
    demo: "https://fishnt.app",
    still: "/media/projects/fishnt/iphone-dashboard.png",
    thumb: {
      kind: "video",
      key: "/media/projects/fishnt/thumb.mp4",
      poster: "/media/projects/fishnt/thumb.jpg",
      caption: "Fishnt",
    },
    media: [
      {
        kind: "image",
        key: "/media/projects/fishnt/iphone-dashboard.png",
        caption: "Productivity dashboard with all-time stats and trends",
      },
      {
        kind: "image",
        key: "/media/projects/fishnt/iphone-main-page.png",
        caption: "Clean, distraction-free timer interface",
      },
      {
        kind: "image",
        key: "/media/projects/fishnt/iphone-notification.png",
        caption: "Focus check notifications keep you accountable",
      },
      {
        kind: "image",
        key: "/media/projects/fishnt/iphone-presets.png",
        caption: "Manage and switch between timer presets",
      },
    ],
  },
  {
    slug: "stealth",
    name: "Stealth-Mode Startup",
    short:
      "Transforming structured content into engaging, narrated experiences",
    description: [
      "Designed and built an innovative AI platform that solves the challenge of information overload by transforming dense, structured content into engaging, narrated experiences. The platform uses sophisticated LLM orchestration to analyze, restructure, and present complex information in formats that maximize understanding and retention.",
      "Designed and implemented the complete technical architecture: a modular FastAPI backend handling AI workflows, real-time WebSocket communication for instant updates, SSE, and a dynamic Next.js frontend supporting live content editing and sharing. A Javascript renderer service handles animations and dynamic rendering of the content. The system seamlessly integrates multiple AI models through the OpenAI SDK and LangChain, with robust data persistence via PostgreSQL, R2 Queue, and Redis caching for optimal performance.",
    ],
    stack: [
      "Next.js",
      "FastAPI",
      "Node.js",
      "Zod",
      "Gulp.js",
      "OpenAI SDK",
      "LangChain",
      "WebSocket",
      "Pydantic",
      "SQLAlchemy",
      "Alembic",
      "PostgreSQL",
      "Redis",
      "Cloudflare Queues",
      "Cloudflare R2",
    ],
    still: "/media/projects/stealth/logo.png",
    media: [
      {
        kind: "image",
        key: "/media/projects/stealth/logo.png",
        caption: "Stealth AI platform",
      },
    ],
  },
  {
    slug: "portfolio",
    name: "Portfolio Website",
    short: "This site: pages on slices of a prism, with an AI guide",
    description: [
      "The screen is cut into slices, rows on a phone and columns on a wider screen. Each slice is a prism with one page on each face, and changing page turns the slices one after another in a cascade, under a key light that casts their shadows.",
      "The pages are live HTML. Before a turn they are snapshotted into textures for the 3D scene, then swapped back once the slices settle. Gimli-AI, the chat guide, streams its replies over a WebSocket from a FastAPI backend and can turn the site to another page with a tool call.",
    ],
    stack: [
      "Next.js",
      "React",
      "Tailwind CSS",
      "Motion",
      "Three.js",
      "React Three Fiber",
      "FastAPI",
      "OpenAI SDK",
      "WebSocket",
      "Pydantic",
      "SQLAlchemy",
      "Alembic",
      "PostgreSQL",
      "Cloudflare R2",
    ],
    github: "https://github.com/Levezze/portfolio-frontend",
    still: "/media/projects/portfolio/thumb.jpg",
    media: [
      {
        kind: "image",
        key: "/media/projects/portfolio/turn-desktop.jpg",
        caption: "Slices mid-turn",
      },
      {
        kind: "image",
        key: "/media/projects/portfolio/projects-desktop.jpg",
        caption: "Projects page",
      },
      {
        kind: "image",
        key: "/media/projects/portfolio/resume-desktop.jpg",
        caption: "Resume page",
      },
      {
        kind: "image",
        key: "/media/projects/portfolio/chat-phone.jpg",
        caption: "Chat on a phone",
      },
      {
        kind: "image",
        key: "/media/projects/portfolio/turn-phone.jpg",
        caption: "Slices mid-turn on a phone",
      },
    ],
  },
];

/** Chat welcome and suggestions, from seed_chat_config.py, in display order. */
export const WELCOME = {
  name: "Lev Zhitnik",
  intro:
    "Full Stack & AI Engineer, Co-Founder, Computational Designer. Forever curious and always excited to build things people want to use.",
  gimli:
    "Greetings, traveler! I'm Gimli-AI, Lev's automated sidekick. Ask me anything about his work. You have my ear, and my axe.",
};

export const SUGGESTIONS = [
  {
    title: "Introduction",
    prompt: "Professionally introduce Lev to the visitor",
  },
  { title: "Stack & Skills", prompt: "List Lev's skills and tech stack" },
  { title: "Recent Projects", prompt: "Go to the projects page" },
  { title: "Contact Form", prompt: "Go to the contact page" },
];

/** Resume, from the <resume> block of the chat system prompt. */
export const RESUME = {
  name: "Lev Zhitnik",
  tagline:
    "Full-Stack & AI Engineer | Web Apps, AI Systems, Automation Tools, and Practical Solutions",
  location: "Brooklyn, NY",
  summary:
    "I build things, mostly from zero. I started in architecture and computational design, co-founded an urban-planning startup, and I'm now the technical co-founder of my second, aēv. I love new beginnings: a new problem, and people who are as excited about their work as I am about building.",
  roles: [
    {
      years: "03/2026 — present",
      company: "aēv (AevArk)",
      role: "Technical Co-Founder",
      blurb:
        "A pet longevity lab. The only engineer on the founding team, building a new product with veterinarians and researchers.",
      bullets: [
        "Designed and built the whole platform: four services spanning a Next.js client for owners and vets, a Node.js API (Hono, Prisma, PostgreSQL, Stripe) and Python processing (FastAPI), on Google Cloud Run with Pub/Sub.",
        "Built the AI workflows: multi-step LLM pipelines with validation and human review, for reading lab reports and writing results.",
        "Own product, UI/UX design, infrastructure, CI and data work.",
      ],
    },
    {
      years: "09/2024 — 01/2026",
      company: "Stealth-Mode Startup",
      role: "Full-Stack & AI Engineer",
      place: "Remote",
      blurb:
        "Building a platform that transforms structured content into editable, narrated developer-facing outputs using a modern web stack.",
      bullets: [
        "Architecting and building a full-stack AI platform from scratch, featuring a Python backend (FastAPI, PostgreSQL, Redis, Cloudflare R2 & Queues) and a dynamic frontend (Next.js, TypeScript, Tailwind, Zod).",
        "Designing and implementing modular, agentic AI workflows using OpenAI SDK, Pydantic, and various LLM APIs to handle complex content transformation, narration generation, analysis and conclusions.",
      ],
    },
    {
      years: "05/2022 — present",
      company: "Navon Systems",
      role: "Software, AI & Automation Consultant",
      place: "Remote",
      blurb:
        "Software architecture and AI consulting, alongside computational design automation for physical manufacturing.",
      bullets: [
        "Consult on software architecture and AI, covering both the orchestration design and the hands-on implementation.",
        "Build Python, RhinoCommon, and Grasshopper systems that eliminate repetitive modeling and have reduced fabrication errors by up to 66% through automated validation & 3D modeling scripts.",
        "Create generative 3D workflows and AI-driven automation scripts to multiply iteration capacity and unlock new strategies.",
      ],
    },
    {
      years: "03/2022 — 09/2024",
      company: "CTies",
      role: "Co-Founder, Product & Development Lead",
      place: "New York City Metropolitan Area",
      blurb:
        "Architected and delivered a city-scale Generative-AI platform to model millions of 3D urban designs, replacing fragmented workflows with a unified, programmable logic system.",
      bullets: [
        "Engineered and scaled end-to-end systems using Python, Flask, React, PostgreSQL, Mapbox, and Pandas for data analysis.",
        "Designed the core optimization logic that processed climate metrics and zoning regulations, directly informing planning decisions for over 100,000 future residents.",
      ],
    },
    {
      years: "12/2018 — 02/2022",
      company: "Shaga Architects",
      role: "Computational Design Lead",
      place: "Tel Aviv District, Israel",
      blurb:
        "Developed advanced modeling logic for public-sector projects, creating batch-processing systems to validate compliance and environmental KPIs.",
      bullets: [
        "Built Python and Grasshopper systems for simulating solar performance, density, and mobility efficiency.",
        "These workflows reduced project modeling time by 40%, supporting planning for urban districts of up to 207,000 residents.",
      ],
    },
  ],
  skills: [
    {
      group: "Languages & frameworks",
      items: [
        "TypeScript",
        "Python",
        "Rust",
        "React",
        "Next.js",
        "Node.js",
        "FastAPI",
        "Hono",
      ],
    },
    {
      group: "Data",
      items: [
        "PostgreSQL",
        "Prisma",
        "SQLAlchemy",
        "MongoDB",
        "Redis",
        "SQLite",
        "Pandas",
        "NumPy",
      ],
    },
    {
      group: "Cloud & infrastructure",
      items: [
        "GCP",
        "Cloud Run",
        "Pub/Sub",
        "Cloudflare",
        "Docker",
        "Firebase",
        "Stripe",
        "Swagger",
      ],
    },
    {
      group: "AI & agents",
      items: [
        "Agentic workflows",
        "Multi-agent orchestration",
        "LLM pipelines",
        "MCP",
        "Claude Code",
        "Codex",
        "OpenAI SDK",
        "Gemini",
        "Pydantic",
        "RAG",
        "CrewAI",
      ],
    },
    {
      group: "Domain",
      items: [
        "Rhino3D",
        "Grasshopper",
        "Ladybug",
        "Mapbox",
        "GIS",
        "PUG",
        "Adobe Suite",
        "Figma",
      ],
    },
  ],
  education: [
    {
      years: "10/2014 — 04/2020",
      title: "Bachelor of Architecture (B.Arch)",
      school: "Technion - Israel Institute of Technology",
    },
    {
      years: "09/2023 — 02/2024",
      title: "Full-Stack Engineer Career Path",
      school: "Codecademy",
    },
    {
      years: "08/2024 — 10/2024",
      title: "Applied Data Science Program",
      school: "MIT Professional Education",
    },
  ],
};

export const CONTACT = {
  email: "contact@levezze.com",
  location: "Brooklyn, NY",
  links: [
    { label: "GitHub", href: "https://github.com/Levezze" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/lev-zhitnik" },
  ],
  /** The user's own words, 2026-10-27. */
  blurb:
    "I love building exciting things and connecting with interesting people. Feel free to reach out.",
};
