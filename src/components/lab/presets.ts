/**
 * Skin presets for the lab. All of them are the same heavy, flat, high-contrast
 * direction; they differ in temperature, accent and type. Texture comes from
 * light only: a slow drifting glow and the slice shadows, never a pattern.
 */

export type Palette = {
  id: string;
  name: string;
  /** CSS variables the page components read. */
  vars: Record<`--${string}`, string>;
  /** Static base gradient; the drifting glows sit on top of it. */
  base: string;
  /** Two glow colours that drift over the base, warm and cold. */
  glowA: string;
  glowB: string;
  capColor: string;
  sceneBackground: string;
};

const shared = {
  "--radius": "0px",
  "--panel-shadow": "none",
} as const;

export const PALETTES: Palette[] = [
  {
    id: "slab",
    name: "Slab",
    vars: {
      ...shared,
      "--text": "#ece8e0",
      "--muted": "#b3ada3",
      "--faint": "#8d877d",
      "--line": "rgba(255,255,255,0.08)",
      "--surface": "rgba(255,255,255,0.04)",
      "--well": "rgba(0,0,0,0.28)",
      "--accent": "#d8913f",
      "--on-accent": "#16120d",
    },
    base: "linear-gradient(160deg, #3a3835 0%, #262422 55%, #171615 100%)",
    glowA: "rgba(255,190,120,0.18)",
    glowB: "rgba(120,150,200,0.12)",
    capColor: "#2a2826",
    sceneBackground: "#0a0909",
  },
  {
    id: "rain",
    name: "Night rain",
    vars: {
      ...shared,
      "--text": "#e3e7ec",
      "--muted": "#a6adb6",
      "--faint": "#7c838c",
      "--line": "rgba(255,255,255,0.08)",
      "--surface": "rgba(255,255,255,0.04)",
      "--well": "rgba(0,0,0,0.32)",
      "--accent": "#8fd0ff",
      "--on-accent": "#07121a",
    },
    base: "linear-gradient(160deg, #2b3037 0%, #1a1d22 55%, #0e1013 100%)",
    glowA: "rgba(120,170,230,0.18)",
    glowB: "rgba(255,160,90,0.10)",
    capColor: "#1e2227",
    sceneBackground: "#07080a",
  },
  {
    id: "violet",
    name: "Violet",
    vars: {
      ...shared,
      "--text": "#e8e6ef",
      "--muted": "#aaa6b8",
      "--faint": "#7f7b8c",
      "--line": "rgba(255,255,255,0.08)",
      "--surface": "rgba(255,255,255,0.04)",
      "--well": "rgba(0,0,0,0.32)",
      "--accent": "#b89cff",
      "--on-accent": "#130b22",
    },
    base: "linear-gradient(160deg, #2d2a38 0%, #1b1923 55%, #0e0d13 100%)",
    glowA: "rgba(160,130,255,0.18)",
    glowB: "rgba(255,150,110,0.08)",
    capColor: "#201d2a",
    sceneBackground: "#08070b",
  },
  {
    id: "ember",
    name: "Ember",
    vars: {
      ...shared,
      "--text": "#ede6e3",
      "--muted": "#b3a8a4",
      "--faint": "#877c78",
      "--line": "rgba(255,255,255,0.08)",
      "--surface": "rgba(255,255,255,0.04)",
      "--well": "rgba(0,0,0,0.32)",
      "--accent": "#ff6b57",
      "--on-accent": "#1a0906",
    },
    base: "linear-gradient(160deg, #332a2a 0%, #201a1a 55%, #110e0e 100%)",
    glowA: "rgba(255,110,80,0.16)",
    glowB: "rgba(120,150,210,0.10)",
    capColor: "#262020",
    sceneBackground: "#0a0707",
  },
  {
    id: "teal",
    name: "Teal",
    vars: {
      ...shared,
      "--text": "#e2ebe9",
      "--muted": "#a4b1ae",
      "--faint": "#798885",
      "--line": "rgba(255,255,255,0.08)",
      "--surface": "rgba(255,255,255,0.04)",
      "--well": "rgba(0,0,0,0.32)",
      "--accent": "#6fe3d0",
      "--on-accent": "#06201b",
    },
    base: "linear-gradient(160deg, #263236 0%, #171f22 55%, #0d1214 100%)",
    glowA: "rgba(100,220,200,0.14)",
    glowB: "rgba(255,170,100,0.08)",
    capColor: "#1c2528",
    sceneBackground: "#070a0b",
  },
  {
    id: "graphite",
    name: "Graphite",
    vars: {
      ...shared,
      "--text": "#dcdcdc",
      "--muted": "#9c9c9c",
      "--faint": "#767676",
      "--line": "rgba(255,255,255,0.09)",
      "--surface": "rgba(255,255,255,0.045)",
      "--well": "rgba(0,0,0,0.3)",
      "--accent": "#ffffff",
      "--on-accent": "#111111",
    },
    base: "linear-gradient(160deg, #373737 0%, #232323 55%, #141414 100%)",
    glowA: "rgba(255,255,255,0.10)",
    glowB: "rgba(170,185,210,0.08)",
    capColor: "#262626",
    sceneBackground: "#0a0a0a",
  },
];

export const paletteById = (id: string) =>
  PALETTES.find((p) => p.id === id) ?? PALETTES[0];

/**
 * A design is everything that is not colour: type, how cards and labels are
 * built, and which nav the page carries. Palettes and designs combine freely.
 * All four are the Signal family: same attitude, different weight and build.
 */
export type Design = {
  id: string;
  name: string;
  headingFontId: string;
  bodyFontId: string;
  /** Tailwind classes for h1/h2 (weight, case, leading, tracking; no size). */
  heading: string;
  /** Page title size in rem, phone and desktop. The title slider scales it. */
  h1Rem: [number, number];
  /** Tailwind classes for small labels. */
  label: string;
  radius: string;
  /**
   * Project list: filled cards with an accent edge, hairline rows, rounded
   * filled tiles, or outlined wireframes.
   */
  card: "edge" | "row" | "tile" | "wire";
  /** Chat messages: boxed panels or plain text under a hairline. */
  bubble: "box" | "plain";
  nav: "index" | "rail" | "tabs" | "pill";
};

export const DESIGNS: Design[] = [
  {
    id: "signal",
    name: "Signal",
    headingFontId: "archivo",
    bodyFontId: "grotesk",
    heading: "font-extrabold uppercase leading-[0.85] tracking-[-0.045em]",
    h1Rem: [3, 4.5],
    label: "text-sm uppercase tracking-[0.12em]",
    radius: "3px",
    card: "edge",
    bubble: "box",
    nav: "tabs",
  },
  {
    // Same bones, half the weight: mixed case, hairlines instead of fills.
    id: "lean",
    name: "Lean",
    headingFontId: "archivo",
    bodyFontId: "grotesk",
    heading: "font-semibold leading-[0.98] tracking-[-0.03em]",
    h1Rem: [2.5, 3.75],
    label: "text-sm font-medium uppercase tracking-[0.18em]",
    radius: "0px",
    card: "row",
    bubble: "plain",
    nav: "rail",
  },
  {
    // Rounded, sentence case, a pill nav: the friendly cut of the same idea.
    id: "soft",
    name: "Soft",
    headingFontId: "archivo",
    bodyFontId: "grotesk",
    heading: "font-bold leading-[0.95] tracking-[-0.03em]",
    h1Rem: [2.75, 4],
    label: "text-sm tracking-[0.02em]",
    radius: "14px",
    card: "tile",
    bubble: "box",
    nav: "pill",
  },
  {
    // Tall condensed caps at medium weight, outlines only, nav in the header.
    id: "wire",
    name: "Wire",
    headingFontId: "barlow",
    bodyFontId: "plex",
    heading: "font-medium uppercase leading-[0.9] tracking-[0.03em]",
    h1Rem: [3.25, 5],
    label: "text-sm uppercase tracking-[0.28em]",
    radius: "0px",
    card: "wire",
    bubble: "plain",
    nav: "index",
  },
];

export const designById = (id: string) =>
  DESIGNS.find((d) => d.id === id) ?? DESIGNS[0];

export type DriftSpec = {
  enabled: boolean;
  /** Multiplier on the base drift rate. */
  speed: number;
  /** Multiplier on the glow opacity. */
  glow: number;
  /** How far the base gradient swings, degrees each way. */
  swingDeg: number;
};

export type CubeSpec = {
  enabled: boolean;
  /** "cube": see the cube and its shadow. "shadow": only the shadow, the cube is above the camera. */
  mode: "cube" | "shadow";
  /** Mean seconds between passes. */
  everyS: number;
  sizeMin: number;
  sizeMax: number;
  /** Seconds for one pass. */
  passS: number;
  /** Shadow blur in px; 0 is a hard-edged shadow. */
  blurPx: number;
  shadowOpacity: number;
  /** Always left to right, or a random direction each pass. */
  directions: "lr" | "any";
};

export type SkinSpec = {
  /** One palette id per page; the turn shows the colours change slice by slice. */
  pagePalettes: string[];
  designId: string;
  headingFontId: string;
  bodyFontId: string;
  /** Multiplier on the design's page-title size. */
  titleScale: number;
  drift: DriftSpec;
  cubes: CubeSpec;
};

export const DEFAULT_SKIN: SkinSpec = {
  pagePalettes: ["slab", "rain", "violet", "teal"],
  designId: "soft",
  headingFontId: "archivo",
  bodyFontId: "grotesk",
  titleScale: 1,
  drift: { enabled: true, speed: 1, glow: 1, swingDeg: 22 },
  cubes: {
    enabled: true,
    mode: "shadow",
    everyS: 25,
    sizeMin: 104,
    sizeMax: 226,
    passS: 16,
    blurPx: 9,
    shadowOpacity: 0.35,
    directions: "any",
  },
};
