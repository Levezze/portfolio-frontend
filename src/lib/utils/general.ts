import { type ClassValue, clsx } from "clsx";
import { formatHex } from "culori";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getCssColor = (cssVar: string) => {
  const root = document.documentElement;
  const bgVar = getComputedStyle(root).getPropertyValue(`${cssVar}`).trim();

  return formatHex(bgVar);
};

export const capitalFirstLetter = (word: string) => {
  return String(word).charAt(0).toUpperCase() + String(word).slice(1);
};
