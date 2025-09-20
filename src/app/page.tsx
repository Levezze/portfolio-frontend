'use client'
import { Scene } from "@/components/Scene";
import { LoadingScene } from "@/components/LoadingScene";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
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
