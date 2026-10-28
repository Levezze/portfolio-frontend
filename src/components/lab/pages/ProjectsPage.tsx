"use client";

import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useId, useRef, useState } from "react";
import { mediaSrc, PROJECTS, type Project } from "../content";
import type { NavState } from "../LabNav";
import type { Design } from "../presets";
import { Gallery } from "./Gallery";
import {
  BackArrow,
  Frame,
  h1,
  LoadingImg,
  MediaFill,
  OutLink,
  type PageProps,
  panel,
} from "./shared";

const swap = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.22, ease: [0.7, 0, 0.3, 1] as const },
};

const headingFont = { fontFamily: "var(--font-heading)" };

/** One project in the list, in the design's card build. */
function ProjectCard({
  p,
  i,
  design,
  onOpen,
}: {
  p: Project;
  i: number;
  design: Design;
  onOpen: () => void;
}) {
  const n = String(i + 1).padStart(2, "0");
  return (
    <motion.button
      layoutId={`card-${p.slug}`}
      type="button"
      onClick={onOpen}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.99 }}
      className="group relative flex flex-col overflow-hidden text-left transition-colors hover:bg-[var(--surface)]"
      style={{ background: "var(--well)", borderRadius: "var(--radius)" }}
    >
      <span className="relative block h-40 overflow-hidden sm:h-48">
        {p.thumb ? (
          <MediaFill
            m={p.thumb}
            className="h-full w-full object-cover opacity-70 transition-[opacity,transform] duration-500 group-hover:scale-[1.03] group-hover:opacity-100"
          />
        ) : (
          <LoadingImg
            src={mediaSrc(p.still, 828)}
            alt=""
            loading="lazy"
            className={`h-full w-full opacity-70 transition-[opacity,transform] duration-500 group-hover:scale-[1.03] group-hover:opacity-100 ${p.logo ? "object-scale-down p-8" : "object-cover"}`}
          />
        )}
        <span
          className={`absolute top-3 left-3 rounded-full px-2.5 py-0.5 text-[var(--muted)] ${design.label}`}
          style={{ background: "var(--well)" }}
        >
          {n}
        </span>
      </span>
      <span className="block p-5">
        <span
          className={`block text-2xl ${design.heading}`}
          style={headingFont}
        >
          {p.name}
        </span>
        <span className="mt-1 block text-sm text-[var(--muted)]">
          {p.short}
        </span>
      </span>
    </motion.button>
  );
}

/**
 * The small row above the scroll area holds the count in the list and the
 * back link in the detail, so Back is always in reach. The big title sits at
 * the top of each scroll area and scrolls away with the content.
 */
export function ProjectsPage({ skin, nav, ref }: PageProps) {
  const { design } = skin;
  const [open, setOpen] = useState<Project | null>(null);
  // Closes the open project through history, so browser back stays in step.
  const close = useRef(() => setOpen(null));
  const openProject = (p: Project) => {
    setOpen(p);
    close.current = nav.remember(() => setOpen(null));
  };
  const group = useId();
  const grid = "mt-8 grid grid-cols-1 content-start gap-3 sm:grid-cols-2";
  return (
    <Frame index={1} title="Projects" skin={skin} nav={nav} ref={ref}>
      <LayoutGroup id={group}>
        <div className={`mt-6 flex h-8 items-center ${design.label}`}>
          <AnimatePresence mode="wait" initial={false}>
            {open ? (
              <motion.button
                key="back"
                type="button"
                onClick={() => close.current()}
                className="group -mx-2 flex items-center gap-3 whitespace-nowrap rounded-full px-2 py-1 text-[var(--accent)] transition-colors hover:bg-[var(--surface)] hover:text-[var(--text)]"
                {...swap}
              >
                <BackArrow />
                All projects
              </motion.button>
            ) : (
              <motion.span
                key="count"
                className="whitespace-nowrap text-[var(--faint)]"
                {...swap}
              >
                {PROJECTS.length} projects
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <div className="relative mt-2 min-h-0 flex-1">
          <AnimatePresence initial={false}>
            {open ? (
              <ProjectDetail
                key="detail"
                project={open}
                design={design}
                remember={nav.remember}
              />
            ) : (
              <motion.div
                key="list"
                className="absolute inset-0 overflow-y-auto pr-1"
                data-lab-scroll
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <h1 className={h1(design)}>Projects</h1>
                <div className={grid}>
                  {PROJECTS.map((p, i) => (
                    <ProjectCard
                      key={p.slug}
                      p={p}
                      i={i}
                      design={design}
                      onOpen={() => openProject(p)}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </LayoutGroup>
    </Frame>
  );
}

function ProjectDetail({
  project,
  design,
  remember,
}: {
  project: Project;
  design: Design;
  remember: NavState["remember"];
}) {
  return (
    <motion.div
      className="absolute inset-0 overflow-y-auto pr-1"
      data-lab-scroll
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <h1 className={h1(design)}>{project.name}</h1>
      <Gallery project={project} remember={remember} />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.3 }}
      >
        <p className="mt-6 text-xl">{project.short}</p>
        {(project.demo || project.github) && (
          <div className="mt-5 flex flex-wrap gap-3">
            {project.demo && (
              <OutLink href={project.demo} label="Live site" design={design} />
            )}
            {project.github && (
              <OutLink href={project.github} label="GitHub" design={design} />
            )}
          </div>
        )}
        {project.description.map((para) => (
          <p
            key={para.slice(0, 32)}
            className="mt-4 text-[var(--muted)] leading-relaxed"
          >
            {para}
          </p>
        ))}
        <div className={`mt-8 text-[var(--faint)] ${design.label}`}>Stack</div>
        <div className="mt-3 flex flex-wrap gap-1.5 pb-4 sm:gap-2">
          {project.stack.map((s) => (
            <span key={s} className="px-2.5 py-1 text-sm" style={panel}>
              {s}
            </span>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
