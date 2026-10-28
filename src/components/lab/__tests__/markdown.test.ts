import { describe, expect, it } from "vitest";
import { parseBlocks, parseInline } from "../markdown";

describe("parseInline", () => {
  it("returns plain text as one token", () => {
    expect(parseInline("hello")).toEqual([{ t: "text", v: "hello" }]);
  });

  it("finds bold, italic and code", () => {
    expect(parseInline("a **b** *c* `d`")).toEqual([
      { t: "text", v: "a " },
      { t: "strong", v: "b" },
      { t: "text", v: " " },
      { t: "em", v: "c" },
      { t: "text", v: " " },
      { t: "code", v: "d" },
    ]);
  });

  it("keeps https and mailto links", () => {
    expect(parseInline("[site](https://levezze.com)")).toEqual([
      { t: "link", v: "site", href: "https://levezze.com" },
    ]);
    expect(parseInline("[mail](mailto:contact@levezze.com)")).toEqual([
      { t: "link", v: "mail", href: "mailto:contact@levezze.com" },
    ]);
  });

  it("drops the target of any other link scheme", () => {
    expect(parseInline("[x](javascript:alert(1))")).toEqual([
      { t: "text", v: "x" },
    ]);
  });

  it("leaves an unclosed marker as text", () => {
    expect(parseInline("2 ** 3")).toEqual([{ t: "text", v: "2 ** 3" }]);
  });
});

describe("parseBlocks", () => {
  it("splits paragraphs on blank lines", () => {
    expect(parseBlocks("one\n\ntwo")).toEqual([
      { t: "p", lines: [[{ t: "text", v: "one" }]] },
      { t: "p", lines: [[{ t: "text", v: "two" }]] },
    ]);
  });

  it("groups dash and star bullets into one list", () => {
    expect(parseBlocks("Stack:\n- Python\n* React")).toEqual([
      { t: "p", lines: [[{ t: "text", v: "Stack:" }]] },
      {
        t: "ul",
        items: [[{ t: "text", v: "Python" }], [{ t: "text", v: "React" }]],
      },
    ]);
  });

  it("keeps numbered lists ordered", () => {
    expect(parseBlocks("1. a\n2. b")).toEqual([
      { t: "ol", items: [[{ t: "text", v: "a" }], [{ t: "text", v: "b" }]] },
    ]);
  });

  it("strips heading hashes into a bold line", () => {
    expect(parseBlocks("## Skills")).toEqual([
      { t: "p", lines: [[{ t: "strong", v: "Skills" }]] },
    ]);
  });
});
