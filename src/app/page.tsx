'use client'
import { Scene } from "@/components/3d/Scene";
import { LoadingScene } from "@/components/3d/LoadingScene";
import { Header } from "@/components/nav/Header";
import { Footer } from "@/components/footer/Footer";
import { useAtomValue } from "jotai";
import { isLoadedAtom } from "@/atoms/atomStore";

export default function Home() {
  const isLoaded = useAtomValue(isLoadedAtom);

  return (
    <div className="h-[100dvh] w-full flex flex-col items-center justify-center">
      <Header />
      {!isLoaded && <LoadingScene />}
      <Scene />
      <Footer />
    </div>
  );
}
