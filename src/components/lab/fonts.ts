import localFont from "next/font/local";

/**
 * The site's two typefaces. next/font has to be called at module scope, so
 * they live here rather than in config.ts; pages read them through the
 * `--font-heading` and `--font-body` variables.
 *
 * Self-hosted (latin variable files from Google Fonts, OFL): next/font/google
 * broke the Turbopack build whenever Google answered with `/l/font?kit=…&…`
 * URLs, which its font loader can't parse.
 */

const archivo = localFont({
  src: "./fonts/archivo-latin.woff2",
  weight: "100 900",
  display: "swap",
});
const spaceGrotesk = localFont({
  src: "./fonts/space-grotesk-latin.woff2",
  weight: "300 700",
  display: "swap",
});

export const HEADING_FONT = archivo.style.fontFamily;
export const BODY_FONT = spaceGrotesk.style.fontFamily;
