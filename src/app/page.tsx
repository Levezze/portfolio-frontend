'use client'
import Image from "next/image";
import { Canvas } from "@react-three/fiber";
import { CubeWithFaces } from "@/components/3d/CubeWithFaces";
import { Bounds, OrbitControls, OrthographicCamera, PerspectiveCamera } from "@react-three/drei";
import { Scene } from "@/components/3d/Scene";

export default function Home() {
  return (
    <div className="h-screen w-full flex items-center justify-center">
      <Scene />
    </div>
  );
}
