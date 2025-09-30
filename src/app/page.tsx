"use client";
import { Scene } from "@/components/Scene";
import { LoadingScene } from "@/components/LoadingScene";
import { Footer } from "@/components/footer/Footer";
import { ExtensionWarning } from "@/components/ExtensionWarning";
import { Scene3DErrorBoundary } from "@/components/scene/Scene3DErrorBoundary";
import { useAtomValue } from "jotai";
import { isLoadedAtom } from "@/atoms/atomStore";
import { DebugViewport } from "@/components/DebugViewport";

export default function Home() {
  const isLoaded = useAtomValue(isLoadedAtom);
  const showDebug = process.env.NEXT_PUBLIC_DEBUG_VIEWPORT === 'true';

  return (
    <div className="h-[100dvh] w-full flex flex-col items-center justify-center">
      {showDebug && <DebugViewport />}
      <ExtensionWarning />
      {!isLoaded && <LoadingScene />}
      <Scene3DErrorBoundary>
        <Scene />
      </Scene3DErrorBoundary>
      <Footer />
    </div>
  );
}
