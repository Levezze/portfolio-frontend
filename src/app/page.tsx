'use client'
import Image from "next/image";
import { Canvas } from "@react-three/fiber";
import { CubeWithFaces } from "@/components/3d/CubeWithFaces";
import { OrbitControls, OrthographicCamera, PerspectiveCamera } from "@react-three/drei";

export default function Home() {
  return (
    <div className="h-screen w-full flex items-center justify-center">
      <div className="box-canvas w-[100dvh] h-[100dvh]">
        <Canvas>
          <OrthographicCamera
            makeDefault
            position={[0, 0, 20]}
            zoom={40}
            near={0.1}
            far={1000}
          />
          <CubeWithFaces />
          <OrbitControls />
        </Canvas>
      </div>
    </div>
  );
}
