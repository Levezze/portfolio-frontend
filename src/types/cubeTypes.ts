import { JSX } from "react";

export type CubeFace = {
    position: [number, number, number];
    rotation: { x: number; y: number };
    page: JSX.Element;
}