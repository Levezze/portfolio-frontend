import { describe, expect, it } from "vitest";
import { loadResume } from "../profile";

const resume = {
  name: "Lev Zhitnik",
  tagline: "Engineer",
  location: "Brooklyn, NY",
  summary: "I build things.",
  roles: [
    {
      years: "2026 — present",
      company: "aēv",
      role: "Technical Co-Founder",
      blurb: "A pet longevity lab.",
      bullets: ["Built the platform."],
    },
  ],
  skills: [{ group: "Languages", items: ["TypeScript"] }],
  education: [{ years: "2014 — 2020", title: "B.Arch", school: "Technion" }],
};
const profile = {
  ...resume,
  contact: { email: "a@b.c", location: "NY", blurb: "Hi", links: [] },
};

/** A fetch that records the URL it was asked for and answers with `body`. */
function fakeFetch(body: unknown, status = 200) {
  const calls: string[] = [];
  const impl = (async (url: string) => {
    calls.push(url);
    return new Response(JSON.stringify(body), { status });
  }) as unknown as typeof fetch;
  return { impl, calls };
}

describe("loadResume", () => {
  it("reads the resume from the backend's profile document", async () => {
    const { impl, calls } = fakeFetch(profile);
    await expect(loadResume("https://api.test", impl)).resolves.toEqual(resume);
    expect(calls).toEqual(["https://api.test/api/v1/public/profile"]);
  });

  it("tolerates a trailing slash on the API URL", async () => {
    const { impl, calls } = fakeFetch(profile);
    await loadResume("https://api.test/", impl);
    expect(calls).toEqual(["https://api.test/api/v1/public/profile"]);
  });

  it("throws when the backend answers with an error", async () => {
    const { impl } = fakeFetch({ detail: "Profile not found" }, 404);
    await expect(loadResume("https://api.test", impl)).rejects.toThrow(/404/);
  });

  it("throws when the body is not a resume", async () => {
    const { impl } = fakeFetch({ name: "Lev" });
    await expect(loadResume("https://api.test", impl)).rejects.toThrow();
  });
});
