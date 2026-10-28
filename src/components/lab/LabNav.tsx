"use client";

import type { ReactNode } from "react";
import type { Design } from "./presets";

/**
 * Page navigation in four builds. Every build is rendered inside each page,
 * with that page's own entry selected, so the nav is cut into slices and
 * turns with the page instead of floating above it. "index" sits in the
 * header; the other three sit at the bottom of the page. On a phone the
 * names give way to icons.
 */

export type NavState = {
  pages: readonly string[];
  active: number;
  idle: boolean;
  go: (i: number) => void;
};

const num = (i: number) => String(i + 1).padStart(2, "0");

// biome-ignore lint/a11y/noSvgWithoutTitle: decorative, the button text names the page
const svg = (d: ReactNode) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
    role="presentation"
  >
    {d}
  </svg>
);

const ICONS: Record<string, ReactNode> = {
  Chat: svg(<path d="M4 5h16v11H9l-5 4V5z" />),
  // Briefcase
  Projects: svg(
    <>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" />
      <path d="M3 13h18" />
    </>,
  ),
  Resume: svg(
    <>
      <path d="M6 3h9l4 4v14H6z" />
      <path d="M9 11h6M9 15h6" />
    </>,
  ),
  Contact: svg(
    <>
      <rect x="3" y="6" width="18" height="12" />
      <path d="M3 7l9 6 9-6" />
    </>,
  ),
};

/** Icon on a phone, name (optionally numbered) from `sm` up. */
function Label({
  name,
  i,
  numbered,
}: {
  name: string;
  i: number;
  numbered?: boolean;
}) {
  return (
    <>
      <span className="sm:hidden">{ICONS[name] ?? num(i)}</span>
      <span className="hidden sm:inline">
        {numbered ? `${num(i)} ` : ""}
        {name}
      </span>
    </>
  );
}

export function IndexNav({ nav, design }: { nav: NavState; design: Design }) {
  return (
    <nav className={`flex gap-5 ${design.label}`}>
      {nav.pages.map((name, i) => (
        <button
          key={name}
          type="button"
          disabled={!nav.idle}
          onClick={() => nav.go(i)}
          className={`transition-colors ${
            i === nav.active
              ? "text-[var(--accent)]"
              : "text-[var(--faint)] hover:text-[var(--text)]"
          }`}
        >
          <Label name={name} i={i} numbered />
        </button>
      ))}
    </nav>
  );
}

export function PageNav({ nav, design }: { nav: NavState; design: Design }) {
  if (design.nav === "rail") {
    return (
      <nav
        className={`absolute bottom-6 left-6 flex gap-5 sm:bottom-10 sm:left-12 sm:flex-col sm:gap-3 ${design.label}`}
        style={{ fontFamily: "var(--font-body)" }}
      >
        {nav.pages.map((name, i) => {
          const on = i === nav.active;
          return (
            <button
              key={name}
              type="button"
              disabled={!nav.idle}
              onClick={() => nav.go(i)}
              className="group flex items-center gap-3 text-left"
            >
              <span
                className="hidden h-px transition-all group-hover:w-7 sm:block"
                style={{
                  width: on ? 28 : 12,
                  background: on ? "var(--accent)" : "var(--faint)",
                }}
              />
              <span
                className={`transition-colors ${
                  on
                    ? "text-[var(--text)]"
                    : "text-[var(--faint)] group-hover:text-[var(--text)]"
                }`}
              >
                <Label name={name} i={i} />
              </span>
            </button>
          );
        })}
      </nav>
    );
  }
  if (design.nav === "tabs") {
    return (
      <nav
        className={`absolute inset-x-0 bottom-0 grid grid-cols-4 border-t border-[var(--line)] ${design.label}`}
        style={{ background: "var(--well)", fontFamily: "var(--font-body)" }}
      >
        {nav.pages.map((name, i) => {
          const on = i === nav.active;
          return (
            <button
              key={name}
              type="button"
              disabled={!nav.idle}
              onClick={() => nav.go(i)}
              className={`relative flex justify-center py-4 transition-colors ${
                on
                  ? "text-[var(--accent)]"
                  : "text-[var(--faint)] hover:bg-[var(--surface)] hover:text-[var(--text)]"
              }`}
            >
              <span
                className="absolute inset-x-0 top-0 h-[2px] transition-opacity"
                style={{ background: "var(--accent)", opacity: on ? 1 : 0 }}
              />
              <Label name={name} i={i} />
            </button>
          );
        })}
      </nav>
    );
  }
  if (design.nav === "pill") {
    return (
      <nav
        className={`absolute inset-x-4 bottom-4 flex gap-1 p-1 sm:inset-x-10 sm:bottom-6 ${design.label}`}
        style={{
          background: "var(--nav-bg, var(--well))",
          border: "1px solid var(--line)",
          borderRadius: 999,
          fontFamily: "var(--font-body)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
        }}
      >
        {nav.pages.map((name, i) => {
          const on = i === nav.active;
          return (
            <button
              key={name}
              type="button"
              disabled={!nav.idle}
              onClick={() => nav.go(i)}
              className={`flex flex-1 items-center justify-center rounded-full px-4 py-2 transition-colors ${
                on
                  ? "text-[var(--on-accent)]"
                  : "text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--text)]"
              }`}
              style={on ? { background: "var(--accent)" } : undefined}
            >
              <Label name={name} i={i} />
            </button>
          );
        })}
      </nav>
    );
  }
  return null;
}
