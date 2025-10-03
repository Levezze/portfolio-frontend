"use client";
import { Scene } from "@/components/Scene";
import { LoadingScene } from "@/components/LoadingScene";
import { Footer } from "@/components/footer/Footer";
import { ExtensionWarning } from "@/components/ExtensionWarning";
import { Scene3DErrorBoundary } from "@/components/scene/Scene3DErrorBoundary";
import { useAtomValue } from "jotai";
import { isLoadedAtom, viewportHeightAtom } from "@/atoms/atomStore";
import { DebugViewport } from "@/components/DebugViewport";

export default function Home() {
  const isLoaded = useAtomValue(isLoadedAtom);
  const viewportHeight = useAtomValue(viewportHeightAtom);
  const showDebug = process.env.NEXT_PUBLIC_DEBUG_VIEWPORT === 'true';

  return (
    <div
      className="w-full flex flex-col items-center justify-center"
      style={{
        minHeight:
          viewportHeight > 0
            ? `${viewportHeight}px`
            : "var(--viewport-height)",
        height:
          viewportHeight > 0
            ? `${viewportHeight}px`
            : "var(--viewport-height)",
      }}
    >
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
