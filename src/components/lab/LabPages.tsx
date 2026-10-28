"use client";

import { ChatPage } from "./pages/ChatPage";
import { ContactPage } from "./pages/ContactPage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { ResumePage } from "./pages/ResumePage";

export { resolveSkin, type Skin } from "./pages/shared";

/**
 * The lab's four pages, with the site's real content (content.ts) and a chat
 * wired to the real backend over the existing WebSocket.
 *
 * A skin is a palette (colour) plus a design (type, cards, labels, nav). The
 * pages read both through `Skin` and never hardcode either.
 */

export const LAB_PAGES = ["Chat", "Projects", "Resume", "Contact"] as const;

export const PAGE_COMPONENTS = [
  ChatPage,
  ProjectsPage,
  ResumePage,
  ContactPage,
];
