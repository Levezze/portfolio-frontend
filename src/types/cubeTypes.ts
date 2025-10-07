import type { JSX } from "react";

export type CubeFace = {
  position: [number, number, number];
  rotation: { x: number; y: number };
  htmlRotation: [number, number, number];
  page: JSX.Element;
};
