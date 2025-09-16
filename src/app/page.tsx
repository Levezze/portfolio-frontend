'use client'
import Image from "next/image";
import { Canvas } from "@react-three/fiber";
import { CubeWithFaces } from "@/components/3d/CubeWithFaces";

export default function Home() {
  return (
    <div className="justify-center">
      <div className="box-canvas w-full h-full">
        <Canvas>
          <CubeWithFaces />
        </Canvas>
      </div>
    </div>
  );
}
