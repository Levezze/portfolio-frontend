import { DEFAULT_SLICE_PX } from "./layout";
import { DEFAULT_SPEC, type MotionSpec } from "./motion";
import { DEFAULT_LIGHT, type LightSpec } from "./PrismScene";
import { DEFAULT_SKIN, type SkinSpec } from "./presets";

export type LabSettings = {
  spec: MotionSpec;
  light: LightSpec;
  slicePx: number;
  skin: SkinSpec;
};

export const DEFAULT_SETTINGS: LabSettings = {
  spec: DEFAULT_SPEC,
  light: DEFAULT_LIGHT,
  slicePx: DEFAULT_SLICE_PX,
  skin: DEFAULT_SKIN,
};

type Row = [label: string, value: string | number | boolean, unit?: string];

function rows(s: LabSettings): Row[] {
  const { drift, cubes } = s.skin;
  return [
    ["Design", s.skin.designId],
    ...s.skin.pagePalettes.map((id, i): Row => [`Palette ${i + 1}`, id]),
    ["Heading font", s.skin.headingFontId],
    ["Body font", s.skin.bodyFontId],
    ["Title size", s.skin.titleScale, "x"],
    ["Drift", drift.enabled],
    ["Drift speed", drift.speed, "x"],
    ["Drift glow", drift.glow, "x"],
    ["Drift swing", drift.swingDeg, "°"],
    ["Cubes", cubes.enabled],
    ["Cube mode", cubes.mode],
    ["Cube every", cubes.everyS, "s"],
    ["Cube size min", cubes.sizeMin, "px"],
    ["Cube size max", cubes.sizeMax, "px"],
    ["Cube pass", cubes.passS, "s"],
    ["Cube shadow blur", cubes.blurPx, "px"],
    ["Cube shadow opacity", cubes.shadowOpacity],
    ["Cube directions", cubes.directions],
    ["Step", s.spec.stepMs, "ms"],
    ["Hold", s.spec.holdMs, "ms"],
    ["Stagger", s.spec.staggerMs, "ms"],
    ["Slow start", Math.round(s.spec.slowStart * 100)],
    ["Impact at", Math.round(s.spec.impactAt * 100), "%"],
    ["Bounce", s.spec.bounceDeg, "°"],
    ["Slice size", s.slicePx, "px"],
    ["Shadow", Math.round(s.light.shadowStrength * 100), "%"],
    ["Light angle", s.light.lightAngleDeg, "°"],
    ["FOV", s.light.fovDeg, "°"],
    ["Seam", s.light.seamPx, "px"],
  ];
}

const show = (v: Row[1], unit = "") =>
  typeof v === "boolean" ? (v ? "on" : "off") : `${v}${unit}`;

/** One line per setting; lines that differ from the defaults start with "* ". */
export function settingsText(s: LabSettings): string {
  const base = rows(DEFAULT_SETTINGS);
  return rows(s)
    .map(([label, value, unit], i) => {
      const changed = value !== base[i][1];
      return `${changed ? "* " : ""}${label} ${show(value, unit)}`;
    })
    .join("\n");
}
