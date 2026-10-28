"use client";

import { type ReactNode, useEffect, useState } from "react";
import { FONTS } from "./fonts";
import { LAB_PAGES } from "./LabPages";
import type { MotionSpec } from "./motion";
import type { LightSpec } from "./PrismScene";
import {
  type CubeSpec,
  DESIGNS,
  type DriftSpec,
  designById,
  PALETTES,
  type SkinSpec,
} from "./presets";
import { type LabSettings, settingsText } from "./settings";

function Slider({
  label,
  value,
  min,
  max,
  step,
  unit = "",
  disabled,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  disabled?: boolean;
  onChange: (v: number) => void;
}) {
  return (
    <label className="grid grid-cols-[7rem_1fr_3.5rem] items-center gap-2">
      <span className="text-white/60">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <span className="text-right tabular-nums">
        {value}
        {unit}
      </span>
    </label>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { id: string; name: string }[];
  onChange: (id: string) => void;
}) {
  return (
    <label className="grid grid-cols-[7rem_1fr] items-center gap-2">
      <span className="text-white/60">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded border border-white/20 bg-black/60 px-2 py-1"
      >
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name}
          </option>
        ))}
      </select>
    </label>
  );
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="grid grid-cols-[7rem_1fr] items-center gap-2">
      <span className="text-white/60">{label}</span>
      <span className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => onChange(e.target.checked)}
        />
        {value ? "on" : "off"}
      </span>
    </label>
  );
}

/** A row of preset buttons; the current one is outlined in amber. */
function Choice<T extends string>({
  label,
  value,
  options,
  disabled,
  onChange,
}: {
  label?: string;
  value: T;
  options: { id: T; name: string }[];
  disabled?: boolean;
  onChange: (id: T) => void;
}) {
  const row = (
    <div
      className="grid gap-1"
      style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}
    >
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          disabled={disabled}
          onClick={() => onChange(o.id)}
          className="rounded border py-1.5 disabled:opacity-40"
          style={{
            borderColor: o.id === value ? "#ff9e3d" : "rgba(255,255,255,0.2)",
          }}
        >
          {o.name}
        </button>
      ))}
    </div>
  );
  if (!label) return row;
  return (
    <div className="grid grid-cols-[7rem_1fr] items-center gap-2">
      <span className="text-white/60">{label}</span>
      {row}
    </div>
  );
}

const Rule = () => <div className="my-1 border-t border-white/10" />;
const Head = ({ children }: { children: ReactNode }) => (
  <div className="mt-1 text-white/40 text-xs tracking-[0.25em] uppercase">
    {children}
  </div>
);

function Action({
  onClick,
  children,
}: {
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded border border-white/20 py-1.5 tracking-[0.15em] uppercase hover:border-white/50"
    >
      {children}
    </button>
  );
}

export function TuningPanel({
  settings,
  setSpec,
  setLight,
  setSlicePx,
  setSkin,
  idle,
  readout,
  onReplayIntro,
  onReset,
}: {
  settings: LabSettings;
  setSpec: (s: MotionSpec) => void;
  setLight: (l: LightSpec) => void;
  setSlicePx: (px: number) => void;
  setSkin: (s: SkinSpec) => void;
  idle: boolean;
  readout: Record<string, string>;
  onReplayIntro: () => void;
  onReset: () => void;
}) {
  const [open, setOpen] = useState(true);
  const [copied, setCopied] = useState(false);
  // On a phone the open panel covers the page, so it starts as the button.
  useEffect(() => {
    if (window.innerWidth < 768) setOpen(false);
  }, []);
  const { spec, light, slicePx, skin } = settings;
  const s = (patch: Partial<MotionSpec>) => setSpec({ ...spec, ...patch });
  const l = (patch: Partial<LightSpec>) => setLight({ ...light, ...patch });
  const k = (patch: Partial<SkinSpec>) => setSkin({ ...skin, ...patch });
  const d = (patch: Partial<DriftSpec>) =>
    k({ drift: { ...skin.drift, ...patch } });
  const c = (patch: Partial<CubeSpec>) =>
    k({ cubes: { ...skin.cubes, ...patch } });
  // Picking a design also picks its fonts; the font selects can override after.
  const pickDesign = (id: string) => {
    const design = designById(id);
    k({
      designId: id,
      headingFontId: design.headingFontId,
      bodyFontId: design.bodyFontId,
    });
  };

  const copy = async () => {
    await navigator.clipboard.writeText(settingsText(settings));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (!open) {
    return (
      <button
        type="button"
        aria-label="Open tuning"
        onClick={() => setOpen(true)}
        className="fixed top-3 right-3 z-30 flex h-10 w-10 items-center justify-center rounded-md border border-white/15 bg-black/80 text-lg text-white backdrop-blur"
      >
        +
      </button>
    );
  }

  return (
    <div className="fixed top-3 right-3 z-30 flex max-h-[calc(100vh-1.5rem)] w-[min(24rem,calc(100vw-1.5rem))] flex-col rounded-md border border-white/15 bg-black/80 text-sm text-white backdrop-blur">
      <button
        type="button"
        className="flex w-full items-center justify-between px-3 py-2 tracking-[0.2em] uppercase"
        onClick={() => setOpen(false)}
      >
        <span>Tuning</span>
        <span>−</span>
      </button>
      <div className="flex flex-col gap-2 overflow-y-auto px-3 pb-3">
        <Head>Design</Head>
        <Choice
          value={skin.designId}
          options={DESIGNS}
          disabled={!idle}
          onChange={pickDesign}
        />
        <Head>Palette, all pages</Head>
        <Choice
          value={
            skin.pagePalettes.every((id) => id === skin.pagePalettes[0])
              ? skin.pagePalettes[0]
              : ""
          }
          options={PALETTES}
          disabled={!idle}
          onChange={(id) =>
            k({ pagePalettes: skin.pagePalettes.map(() => id) })
          }
        />
        <Head>Palette, per page</Head>
        {LAB_PAGES.map((name, i) => (
          <Select
            key={name}
            label={name}
            value={skin.pagePalettes[i]}
            options={PALETTES}
            onChange={(id) =>
              k({
                pagePalettes: skin.pagePalettes.map((p, j) =>
                  j === i ? id : p,
                ),
              })
            }
          />
        ))}
        <Select
          label="Heading font"
          value={skin.headingFontId}
          options={FONTS}
          onChange={(id) => k({ headingFontId: id })}
        />
        <Select
          label="Body font"
          value={skin.bodyFontId}
          options={FONTS}
          onChange={(id) => k({ bodyFontId: id })}
        />
        <Slider
          label="Title size"
          value={skin.titleScale}
          min={0.5}
          max={1.6}
          step={0.05}
          unit="x"
          onChange={(v) => k({ titleScale: v })}
        />
        <Rule />
        <Head>Drift</Head>
        <Toggle
          label="Drift"
          value={skin.drift.enabled}
          onChange={(v) => d({ enabled: v })}
        />
        <Slider
          label="Speed"
          value={skin.drift.speed}
          min={0.1}
          max={6}
          step={0.1}
          unit="x"
          onChange={(v) => d({ speed: v })}
        />
        <Slider
          label="Glow"
          value={skin.drift.glow}
          min={0}
          max={3}
          step={0.1}
          unit="x"
          onChange={(v) => d({ glow: v })}
        />
        <Slider
          label="Swing"
          value={skin.drift.swingDeg}
          min={0}
          max={180}
          step={1}
          unit="°"
          onChange={(v) => d({ swingDeg: v })}
        />
        <Rule />
        <Head>Cubes</Head>
        <Toggle
          label="Cubes"
          value={skin.cubes.enabled}
          onChange={(v) => c({ enabled: v })}
        />
        <Choice
          label="Mode"
          value={skin.cubes.mode}
          options={[
            { id: "cube", name: "Cube + shadow" },
            { id: "shadow", name: "Shadow only" },
          ]}
          onChange={(mode) => c({ mode })}
        />
        <Choice
          label="Direction"
          value={skin.cubes.directions}
          options={[
            { id: "any", name: "Any" },
            { id: "lr", name: "Left → right" },
          ]}
          onChange={(directions) => c({ directions })}
        />
        <Slider
          label="Every"
          value={skin.cubes.everyS}
          min={3}
          max={90}
          step={1}
          unit="s"
          onChange={(v) => c({ everyS: v })}
        />
        <Slider
          label="Pass"
          value={skin.cubes.passS}
          min={3}
          max={40}
          step={1}
          unit="s"
          onChange={(v) => c({ passS: v })}
        />
        <Slider
          label="Size min"
          value={skin.cubes.sizeMin}
          min={20}
          max={400}
          step={2}
          unit="px"
          onChange={(v) =>
            c({ sizeMin: v, sizeMax: Math.max(v, skin.cubes.sizeMax) })
          }
        />
        <Slider
          label="Size max"
          value={skin.cubes.sizeMax}
          min={20}
          max={400}
          step={2}
          unit="px"
          onChange={(v) =>
            c({ sizeMax: v, sizeMin: Math.min(v, skin.cubes.sizeMin) })
          }
        />
        <Slider
          label="Shadow blur"
          value={skin.cubes.blurPx}
          min={0}
          max={60}
          step={1}
          unit="px"
          onChange={(v) => c({ blurPx: v })}
        />
        <Slider
          label="Shadow opacity"
          value={skin.cubes.shadowOpacity}
          min={0}
          max={1}
          step={0.05}
          onChange={(v) => c({ shadowOpacity: v })}
        />
        <Rule />
        <Head>Turn</Head>
        <Slider
          label="Step"
          value={spec.stepMs}
          min={80}
          max={800}
          step={10}
          unit="ms"
          onChange={(v) => s({ stepMs: v })}
        />
        <Slider
          label="Hold"
          value={spec.holdMs}
          min={0}
          max={400}
          step={10}
          unit="ms"
          onChange={(v) => s({ holdMs: v })}
        />
        <Slider
          label="Stagger"
          value={spec.staggerMs}
          min={0}
          max={250}
          step={10}
          unit="ms"
          onChange={(v) => s({ staggerMs: v })}
        />
        <Slider
          label="Slow start"
          value={Math.round(spec.slowStart * 100)}
          min={0}
          max={100}
          step={5}
          onChange={(v) => s({ slowStart: v / 100 })}
        />
        <Slider
          label="Impact at"
          value={Math.round(spec.impactAt * 100)}
          min={60}
          max={100}
          step={1}
          unit="%"
          onChange={(v) => s({ impactAt: v / 100 })}
        />
        <Slider
          label="Bounce"
          value={spec.bounceDeg}
          min={0}
          max={8}
          step={0.5}
          unit="°"
          onChange={(v) => s({ bounceDeg: v })}
        />
        <Rule />
        <Head>Prism</Head>
        <Slider
          label="Slice size"
          value={slicePx}
          min={60}
          max={400}
          step={10}
          unit="px"
          disabled={!idle}
          onChange={setSlicePx}
        />
        <Slider
          label="Shadow"
          value={Math.round(light.shadowStrength * 100)}
          min={0}
          max={95}
          step={5}
          unit="%"
          onChange={(v) => l({ shadowStrength: v / 100 })}
        />
        <Slider
          label="Light angle"
          value={light.lightAngleDeg}
          min={10}
          max={80}
          step={1}
          unit="°"
          onChange={(v) => l({ lightAngleDeg: v })}
        />
        <Slider
          label="FOV"
          value={light.fovDeg}
          min={10}
          max={70}
          step={1}
          unit="°"
          onChange={(v) => l({ fovDeg: v })}
        />
        <Slider
          label="Seam"
          value={light.seamPx}
          min={0}
          max={12}
          step={1}
          unit="px"
          onChange={(v) => l({ seamPx: v })}
        />
        <Rule />
        <dl className="grid grid-cols-[7rem_1fr] gap-x-2 gap-y-1 text-white/60">
          {Object.entries(readout).map(([key, value]) => (
            <div key={key} className="contents">
              <dt>{key}</dt>
              <dd className="text-white">{value}</dd>
            </div>
          ))}
        </dl>
        <Rule />
        <div className="grid grid-cols-3 gap-1">
          <Action onClick={copy}>{copied ? "Copied" : "Copy settings"}</Action>
          <Action onClick={onReplayIntro}>Replay intro</Action>
          <Action onClick={onReset}>Reset</Action>
        </div>
      </div>
    </div>
  );
}
