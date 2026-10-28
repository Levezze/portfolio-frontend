/**
 * The resume, read from the backend's profile document: the one copy that
 * the Resume page and Gimli's prompt both render. Reseeding it on the backend
 * updates the site without a deploy.
 *
 * Fetched on the server, never in the browser: the page stays in the first
 * HTML, so snapshots match it and a cold backend never shows a blank page.
 */

export type Resume = {
  name: string;
  tagline: string;
  location: string;
  summary: string;
  roles: {
    years: string;
    company: string;
    role: string;
    place?: string;
    blurb: string;
    bullets: string[];
  }[];
  skills: { group: string; items: string[] }[];
  education: { years: string; title: string; school: string }[];
};

/** How stale the cached page may get before the next visit refetches it. */
export const RESUME_REFRESH_S = 60;

/** Long enough for a sleeping backend to wake. */
const TIMEOUT_MS = 45_000;

/**
 * Throws on any failure rather than returning a stand-in. A failed refetch
 * then keeps the last good page in the cache instead of replacing it.
 */
export async function loadResume(
  apiUrl: string,
  fetchImpl: typeof fetch = fetch,
): Promise<Resume> {
  const url = `${apiUrl.replace(/\/$/, "")}/api/v1/public/profile`;
  const res = await fetchImpl(url, {
    next: { revalidate: RESUME_REFRESH_S },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`Profile request failed: ${res.status}`);
  const p = await res.json();
  if (
    typeof p?.name !== "string" ||
    !Array.isArray(p.roles) ||
    !Array.isArray(p.skills) ||
    !Array.isArray(p.education)
  ) {
    throw new Error("Profile response is not a resume");
  }
  return {
    name: p.name,
    tagline: p.tagline,
    location: p.location,
    summary: p.summary,
    roles: p.roles,
    skills: p.skills,
    education: p.education,
  };
}
