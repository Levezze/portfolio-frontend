import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatHex } from "culori";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getCssColor = (cssVar: string) => {
  const root = document.documentElement;
  const bgVar = getComputedStyle(root).getPropertyValue(`${cssVar}`).trim();

  return formatHex(bgVar);
}