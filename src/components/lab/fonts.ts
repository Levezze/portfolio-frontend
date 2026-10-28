import {
  Archivo,
  Barlow_Condensed,
  IBM_Plex_Sans,
  Saira,
  Space_Grotesk,
  Syne,
} from "next/font/google";

/**
 * Font options for the lab skins. Each is loaded once here; pages pick a
 * heading and a body font by id and read them through CSS variables.
 */

const saira = Saira({ weight: ["400", "600"], subsets: ["latin"] });
const spaceGrotesk = Space_Grotesk({
  weight: ["400", "700"],
  subsets: ["latin"],
});
const archivo = Archivo({ weight: ["400", "800"], subsets: ["latin"] });
const plex = IBM_Plex_Sans({ weight: ["400", "600"], subsets: ["latin"] });
const barlowCondensed = Barlow_Condensed({
  weight: ["500", "700"],
  subsets: ["latin"],
});
const syne = Syne({ weight: ["400", "800"], subsets: ["latin"] });

export type LabFont = { id: string; name: string; family: string };

export const FONTS: LabFont[] = [
  { id: "saira", name: "Saira", family: saira.style.fontFamily },
  {
    id: "grotesk",
    name: "Space Grotesk",
    family: spaceGrotesk.style.fontFamily,
  },
  { id: "archivo", name: "Archivo", family: archivo.style.fontFamily },
  { id: "plex", name: "IBM Plex Sans", family: plex.style.fontFamily },
  {
    id: "barlow",
    name: "Barlow Condensed",
    family: barlowCondensed.style.fontFamily,
  },
  { id: "syne", name: "Syne", family: syne.style.fontFamily },
];

export const fontById = (id: string) =>
  FONTS.find((f) => f.id === id) ?? FONTS[0];
