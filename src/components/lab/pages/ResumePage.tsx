"use client";

import { motion } from "motion/react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { RESUME } from "../content";
import type { Design } from "../presets";
import { Frame, h1, type PageProps, panel } from "./shared";

/**
 * Node centre, from the top of each entry: py-5 (20px) plus half the h-6
 * years row (12px). The line is drawn per entry from this point, so it
 * starts in the first node and ends in the last.
 */
const NODE_Y = 32;
const NODE = 9;

function Timeline({
  items,
  design,
}: {
  items: { key: string; years: string; body: ReactNode }[];
  design: Design;
}) {
  return (
    <ol className="mt-3 ml-2">
      {items.map((it, i) => {
        const first = i === 0;
        const last = i === items.length - 1;
        return (
          <li
            key={it.key}
            className="group relative py-5 pl-8 transition-colors hover:bg-[var(--surface)]"
            style={{ borderRadius: "var(--radius)" }}
          >
            {items.length > 1 && (
              <span
                aria-hidden
                className="absolute left-0 w-px bg-[var(--line)]"
                style={
                  first
                    ? { top: NODE_Y, bottom: 0 }
                    : last
                      ? { top: 0, height: NODE_Y }
                      : { top: 0, bottom: 0 }
                }
              />
            )}
            <span
              aria-hidden
              className={`absolute rounded-full transition-colors ${
                first
                  ? "bg-[var(--accent)]"
                  : "bg-[var(--faint)] group-hover:bg-[var(--accent)]"
              }`}
              style={{
                width: NODE,
                height: NODE,
                top: NODE_Y - NODE / 2,
                left: 0.5 - NODE / 2,
              }}
            />
            <div
              className={`flex h-6 items-center text-[var(--faint)] ${design.label}`}
            >
              <span className={first ? "text-[var(--accent)]" : ""}>
                {it.years}
              </span>
            </div>
            {it.body}
          </li>
        );
      })}
    </ol>
  );
}

/**
 * One skill group, collapsed to its first row of badges. A click anywhere on
 * it, heading or badge, opens or closes it.
 */
function SkillGroup({
  group,
  items,
  design,
}: {
  group: string;
  items: string[];
  design: Design;
}) {
  const [open, setOpen] = useState(false);
  const list = useRef<HTMLSpanElement>(null);
  // Row height, full height, and how many badges sit below the first row.
  const [size, setSize] = useState({ row: 0, full: 0, hidden: 0 });
  useEffect(() => {
    const el = list.current;
    if (!el) return;
    const measure = () => {
      const badges = [...el.children] as HTMLElement[];
      const top = badges[0]?.offsetTop ?? 0;
      setSize({
        row: badges[0]?.offsetHeight ?? 0,
        full: el.scrollHeight,
        hidden: badges.filter((b) => b.offsetTop > top).length,
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const folds = size.hidden > 0;
  return (
    <button
      type="button"
      aria-expanded={folds ? open : undefined}
      onClick={() => folds && setOpen((o) => !o)}
      className="block w-full text-left"
    >
      <span
        className={`flex items-center justify-between gap-3 text-[var(--faint)] ${design.label}`}
      >
        {group}
        {folds && (
          <span className="flex items-center gap-2">
            {!open && <span>+{size.hidden}</span>}
            <motion.span
              aria-hidden
              animate={{ rotate: open ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="inline-block"
            >
              ⌄
            </motion.span>
          </span>
        )}
      </span>
      <motion.span
        className="mt-2 block overflow-hidden"
        initial={false}
        animate={{
          height: size.row === 0 ? "auto" : open ? size.full : size.row,
        }}
        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
      >
        <span ref={list} className="flex flex-wrap gap-1.5 sm:gap-2">
          {items.map((s) => (
            <span
              key={s}
              className="px-2.5 py-1 text-sm sm:px-3 sm:py-1.5"
              style={panel}
            >
              {s}
            </span>
          ))}
        </span>
      </motion.span>
    </button>
  );
}

export function ResumePage({ skin, nav, ref }: PageProps) {
  const { design } = skin;
  const section = `mt-10 text-[var(--faint)] ${design.label}`;
  return (
    <Frame index={2} title="Resume" skin={skin} nav={nav} ref={ref}>
      <h1 className={`mt-8 ${h1(design)}`}>{RESUME.name}</h1>
      <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-2" data-lab-scroll>
        <p>{RESUME.tagline}</p>
        <p className="mt-3 text-[var(--muted)]">{RESUME.summary}</p>
        <div className="mt-6 grid items-start gap-4 sm:grid-cols-2">
          {RESUME.skills.map((g) => (
            <SkillGroup
              key={g.group}
              group={g.group}
              items={g.items}
              design={design}
            />
          ))}
        </div>
        <div className={section}>Experience</div>
        <Timeline
          design={design}
          items={RESUME.roles.map((r) => ({
            key: r.company,
            years: r.years,
            body: (
              <>
                <h2 className={`mt-2 text-3xl ${design.heading}`}>{r.role}</h2>
                <div className="mt-1 text-[var(--text)]">
                  {r.company}
                  {r.place && (
                    <span className="text-[var(--faint)]"> · {r.place}</span>
                  )}
                </div>
                <p className="mt-3 text-[var(--muted)]">{r.blurb}</p>
                <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-[var(--muted)]">
                  {r.bullets.map((b) => (
                    <li key={b.slice(0, 32)}>{b}</li>
                  ))}
                </ul>
              </>
            ),
          }))}
        />
        <div className={section}>Education</div>
        <Timeline
          design={design}
          items={RESUME.education.map((e) => ({
            key: e.title,
            years: e.years,
            body: (
              <>
                <h2 className={`mt-2 text-2xl ${design.heading}`}>{e.title}</h2>
                <div className="mt-1 text-[var(--muted)]">{e.school}</div>
              </>
            ),
          }))}
        />
      </div>
    </Frame>
  );
}
