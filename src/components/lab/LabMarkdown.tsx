import { Fragment, useMemo } from "react";
import { type Inline, parseBlocks } from "./markdown";

function Inlines({ parts }: { parts: Inline[] }) {
  return (
    <>
      {parts.map((p, i) => {
        const k = `${i}-${p.t}`;
        if (p.t === "strong")
          return (
            <strong key={k} className="font-semibold text-[var(--text)]">
              {p.v}
            </strong>
          );
        if (p.t === "em") return <em key={k}>{p.v}</em>;
        if (p.t === "code")
          return (
            <code
              key={k}
              className="rounded px-1 text-[0.95em]"
              style={{ background: "var(--well)" }}
            >
              {p.v}
            </code>
          );
        if (p.t === "link")
          return (
            <a
              key={k}
              href={p.href}
              target="_blank"
              rel="noreferrer"
              className="text-[var(--accent)] underline underline-offset-2 hover:opacity-80"
            >
              {p.v}
            </a>
          );
        return <Fragment key={k}>{p.v}</Fragment>;
      })}
    </>
  );
}

/** Chat reply text with light Markdown, rendered as React elements only. */
export function LabMarkdown({ text }: { text: string }) {
  const blocks = useMemo(() => parseBlocks(text), [text]);
  return (
    <>
      {blocks.map((b, i) => {
        const k = `${i}-${b.t}`;
        if (b.t === "p")
          return (
            <p key={k}>
              {b.lines.map((line, j) => (
                <Fragment key={`${k}-${j.toString()}`}>
                  {j > 0 && <br />}
                  <Inlines parts={line} />
                </Fragment>
              ))}
            </p>
          );
        const List = b.t === "ul" ? "ul" : "ol";
        return (
          <List
            key={k}
            className={`space-y-1 pl-5 ${b.t === "ul" ? "list-disc" : "list-decimal"}`}
          >
            {b.items.map((item, j) => (
              <li key={`${k}-${j.toString()}`}>
                <Inlines parts={item} />
              </li>
            ))}
          </List>
        );
      })}
    </>
  );
}
