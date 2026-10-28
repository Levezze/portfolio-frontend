"use client";

import type { ReactNode } from "react";
import type { Design } from "./presets";

/**
 * The pill nav. It is rendered inside each page, with that page's own entry
 * selected, so it is cut into slices and turns with the page instead of
 * floating above it. On a phone the names give way to icons.
 */

export type NavState = {
  pages: readonly string[];
  active: number;
  idle: boolean;
  go: (i: number) => void;
};

const num = (i: number) => String(i + 1).padStart(2, "0");

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

/** Icon on a phone, name from `sm` up. */
function Label({ name, i }: { name: string; i: number }) {
  return (
    <>
      <span className="sm:hidden">{ICONS[name] ?? num(i)}</span>
      <span className="hidden sm:inline">{name}</span>
    </>
  );
}

export function PageNav({ nav, design }: { nav: NavState; design: Design }) {
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
