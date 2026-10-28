/**
 * The site's palettes and design. Each page has its own palette, all of them
 * the same heavy, flat, high-contrast direction on a near-black base; they
 * differ only in temperature and accent. Texture comes from light only: a
 * slow drifting glow and the slice shadows, never a pattern. Which page uses
 * which palette is set in config.ts.
 */

export type PaletteId = "slab" | "rain" | "violet" | "teal";

export type Palette = {
  id: PaletteId;
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
];

export const paletteById = (id: PaletteId) =>
  PALETTES.find((p) => p.id === id) ?? PALETTES[0];

/** Everything that is not colour: type and how labels and corners are built. */
export type Design = {
  /** Tailwind classes for h1/h2 (weight, case, leading, tracking; no size). */
  heading: string;
  /** Page title size in rem, phone and desktop; config.ts scales it. */
  h1Rem: [number, number];
  /** Tailwind classes for small labels. */
  label: string;
  radius: string;
};

/** "Soft": rounded, sentence case, tiles and a pill nav. */
export const DESIGN: Design = {
  heading: "font-bold leading-[0.95] tracking-[-0.03em]",
  h1Rem: [2.75, 4],
  label: "text-sm tracking-[0.02em]",
  radius: "14px",
};

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
  /** One palette per page; the turn shows the colours change slice by slice. */
  pagePalettes: PaletteId[];
  /** Multiplier on the design's page-title size. */
  titleScale: number;
  drift: DriftSpec;
  cubes: CubeSpec;
};
