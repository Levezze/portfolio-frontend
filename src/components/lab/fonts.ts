import { Archivo, Space_Grotesk } from "next/font/google";

/**
 * The site's two typefaces. next/font has to be called at module scope, so
 * they live here rather than in config.ts; pages read them through the
 * `--font-heading` and `--font-body` variables.
 */

const archivo = Archivo({ weight: ["400", "800"], subsets: ["latin"] });
const spaceGrotesk = Space_Grotesk({
  weight: ["400", "700"],
  subsets: ["latin"],
});

export const HEADING_FONT = archivo.style.fontFamily;
export const BODY_FONT = spaceGrotesk.style.fontFamily;
