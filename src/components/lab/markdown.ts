/**
 * Just enough Markdown for chat replies: paragraphs, bullet and numbered
 * lists, headings (shown bold), bold, italic, inline code and links. Output
 * is data for React to render; nothing here produces HTML strings. Links keep
 * their target only for https: and mailto:.
 */

export type Inline =
  | { t: "text" | "strong" | "em" | "code"; v: string }
  | { t: "link"; v: string; href: string };

export type Block =
  | { t: "p"; lines: Inline[][] }
  | { t: "ul" | "ol"; items: Inline[][] };

const SAFE_HREF = /^(https:\/\/|mailto:)/i;

// Order matters: bold before italic so "**" is not read as two "*".
const INLINE =
  /\*\*([^*]+)\*\*|`([^`]+)`|\[([^\]]+)\]\(([^()\s]+(?:\([^()\s]*\))?)\)|\*([^*\s][^*]*)\*/g;

export function parseInline(s: string): Inline[] {
  const out: Inline[] = [];
  const push = (tok: Inline) => {
    const last = out[out.length - 1];
    if (tok.t === "text" && last?.t === "text") last.v += tok.v;
    else out.push(tok);
  };
  let at = 0;
  for (const m of s.matchAll(INLINE)) {
    const i = m.index ?? 0;
    if (i > at) push({ t: "text", v: s.slice(at, i) });
    if (m[1] !== undefined) push({ t: "strong", v: m[1] });
    else if (m[2] !== undefined) push({ t: "code", v: m[2] });
    else if (m[3] !== undefined) {
      const href = m[4] ?? "";
      push(
        SAFE_HREF.test(href)
          ? { t: "link", v: m[3], href }
          : { t: "text", v: m[3] },
      );
    } else if (m[5] !== undefined) push({ t: "em", v: m[5] });
    at = i + m[0].length;
  }
  if (at < s.length) push({ t: "text", v: s.slice(at) });
  return out;
}

const BULLET = /^\s*[-*•]\s+(.*)$/;
const NUMBERED = /^\s*\d+[.)]\s+(.*)$/;
const HEADING = /^\s*#{1,6}\s+(.*)$/;

export function parseBlocks(text: string): Block[] {
  const blocks: Block[] = [];
  let para: Inline[][] | null = null;
  let list: { t: "ul" | "ol"; items: Inline[][] } | null = null;
  const flush = () => {
    if (para) blocks.push({ t: "p", lines: para });
    if (list) blocks.push(list);
    para = null;
    list = null;
  };
  for (const raw of text.split("\n")) {
    const line = raw.trimEnd();
    if (line.trim() === "") {
      flush();
      continue;
    }
    const bullet = BULLET.exec(line);
    const numbered = bullet ? null : NUMBERED.exec(line);
    const item = bullet ?? numbered;
    if (item) {
      const kind = bullet ? "ul" : "ol";
      if (!list || list.t !== kind) {
        flush();
        list = { t: kind, items: [] };
      }
      list.items.push(parseInline(item[1]));
      continue;
    }
    if (list) flush();
    const heading = HEADING.exec(line);
    const inl: Inline[] = heading
      ? [{ t: "strong", v: heading[1] }]
      : parseInline(line);
    if (!para) para = [];
    para.push(inl);
  }
  flush();
  return blocks;
}
