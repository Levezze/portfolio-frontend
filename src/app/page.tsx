'use client'
import Image from "next/image";
import { Canvas } from "@react-three/fiber";
import { CubeWithFaces } from "@/components/3d/CubeWithFaces";
import { Bounds, OrbitControls, OrthographicCamera, PerspectiveCamera } from "@react-three/drei";
import { Scene } from "@/components/3d/Scene";
import { Header } from "@/components/nav/Header";
import { Footer } from "@/components/footer/Footer";

export default function Home() {
  return (
    <div className="h-[100dvh] w-full flex flex-col items-center justify-center">
      <Header />
      <Scene />
      <Footer />
    </div>
  );
}
