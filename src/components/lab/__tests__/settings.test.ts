import { describe, expect, it } from "vitest";
import { DEFAULT_SLICE_PX } from "../layout";
import { DEFAULT_SPEC } from "../motion";
import { DEFAULT_LIGHT } from "../PrismScene";
import { DEFAULT_SKIN } from "../presets";
import { settingsText } from "../settings";

const defaults = {
  spec: DEFAULT_SPEC,
  light: DEFAULT_LIGHT,
  slicePx: DEFAULT_SLICE_PX,
  skin: DEFAULT_SKIN,
};

describe("settingsText", () => {
  it("lists every setting with its unit", () => {
    const text = settingsText(defaults);
    expect(text).toContain("Step 410ms");
    expect(text).toContain("Bounce 2.5°");
    expect(text).toContain("Palette 1 slab");
    expect(text).toContain("Palette 2 rain");
    expect(text).toContain("Design soft");
    expect(text).toContain("Heading font archivo");
    expect(text).toContain("Cubes on");
    expect(text).toContain("Cube mode shadow");
    expect(text).toContain("Title size 1x");
    expect(text).toContain("Drift swing 22°");
  });

  it("marks changed settings and nothing else", () => {
    const text = settingsText({
      ...defaults,
      spec: { ...DEFAULT_SPEC, stepMs: 300 },
      skin: {
        ...DEFAULT_SKIN,
        pagePalettes: ["slab", "slab", "violet", "teal"],
        drift: { ...DEFAULT_SKIN.drift, enabled: false },
        cubes: { ...DEFAULT_SKIN.cubes, mode: "cube" },
      },
    });
    const changed = text.split("\n").filter((l) => l.startsWith("* "));
    expect(changed).toEqual([
      "* Palette 2 slab",
      "* Drift off",
      "* Cube mode cube",
      "* Step 300ms",
    ]);
  });
});
