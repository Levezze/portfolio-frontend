import {
  Float,
  OrbitControls,
  OrthographicCamera,
  Preload,
  SoftShadows,
} from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { CanvasWrapper } from "@isaac_ua/drei-html-fix";
import { useAtomValue } from "jotai";
import { useEffect, useRef, useState } from "react";
import { isLoadedAtom } from "@/atoms/atomStore";
import { useResponsiveFaceSize } from "@/hooks/useResponsiveFaceSize";
import { isIOSDevice, isSafari } from "@/lib/utils/deviceDetection";
import { BowlGroundPlane } from "./scene/BowlGroundPlane";
import { CameraController } from "./scene/CameraController";
import { CubeWithFaces } from "./scene/CubeWithFaces";

export const Scene = () => {
  // Activate responsive sizing system
  useResponsiveFaceSize();

  const isLoaded = useAtomValue(isLoadedAtom);

  // iOS/Safari detection (client-side only)
  const [isIOS, setIsIOS] = useState(false);
  const [isSafariBrowser, setIsSafariBrowser] = useState(false);

  // WebGL context recovery state
  const [contextLost, setContextLost] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const hasSuccessfullyLoaded = useRef(false);
  const maxRetries = 3;

  // Detect iOS/Safari on client side
  useEffect(() => {
    setIsIOS(isIOSDevice());
    setIsSafariBrowser(isSafari());
  }, []);

  // Mark scene as successfully loaded after initial render
  useEffect(() => {
    if (isLoaded && !hasSuccessfullyLoaded.current) {
      hasSuccessfullyLoaded.current = true;
    }
  }, [isLoaded]);

  // WebGL context event handlers - attach after Canvas is created
  useEffect(() => {
    const handleContextLost = (event: Event) => {
      event.preventDefault();
      // Only show recovery UI if context is lost AFTER successful initial load
      if (hasSuccessfullyLoaded.current) {
        console.warn("WebGL context lost event fired, attempting recovery...");
        setContextLost(true);
      } else {
        console.log("WebGL context lost during initialization (ignoring)");
      }
    };

    const handleContextRestored = () => {
      console.log("WebGL context restored successfully");
      setContextLost(false);
      setRetryCount(0);
    };

    // Wait for canvas to be available in the DOM
    const attachListeners = () => {
      const canvas = document.querySelector("canvas");
      if (canvas && !canvasRef.current) {
        canvasRef.current = canvas;
        canvas.addEventListener("webglcontextlost", handleContextLost);
        canvas.addEventListener("webglcontextrestored", handleContextRestored);
      }
    };

    // Try immediately and with a small delay to ensure Canvas is mounted
    attachListeners();
    const timeout = setTimeout(attachListeners, 100);

    return () => {
      clearTimeout(timeout);
      if (canvasRef.current) {
        canvasRef.current.removeEventListener(
          "webglcontextlost",
          handleContextLost
        );
        canvasRef.current.removeEventListener(
          "webglcontextrestored",
          handleContextRestored
        );
      }
    };
  }, []);

  // Auto-retry context recovery
  useEffect(() => {
    if (contextLost && retryCount < maxRetries) {
      const timeout = setTimeout(() => {
        console.log(
          `Retrying WebGL context recovery (attempt ${
            retryCount + 1
          }/${maxRetries})`
        );
        setRetryCount((prev) => prev + 1);
        // Force re-render to attempt context recreation
        setContextLost(false);
      }, 1000 * (retryCount + 1)); // Exponential backoff

      return () => clearTimeout(timeout);
    }
  }, [contextLost, retryCount]);

  // Show fallback UI if context is permanently lost
  if (contextLost && retryCount >= maxRetries) {
    return (
      <div
        className={`canvas w-full h-full ${
          isLoaded ? "opacity-100" : "opacity-0"
        } z-0 flex items-center justify-center bg-background`}
      >
        <div className="text-center p-8 max-w-md">
          <div className="text-xl font-semibold text-foreground mb-4">
            3D Display Unavailable
          </div>
          <div className="text-muted-foreground mb-6">
            Browser extensions may be interfering with 3D graphics. Try
            refreshing the page or temporarily disabling browser extensions.
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  const bowlPosition = [50, 155, 100] as [number, number, number];

  return (
    <div
      className={`canvas w-full h-full ${
        isLoaded ? "opacity-100" : "opacity-0"
      } z-0 relative`}
    >
      {/* Context recovery notification */}
      {contextLost && (
        <div className="absolute top-4 right-4 z-50 bg-yellow-500/90 text-black px-4 py-2 rounded-md text-sm font-medium">
          Recovering 3D graphics... ({retryCount + 1}/{maxRetries})
        </div>
      )}

      {/* CanvasWrapper fixes DPR-related Html positioning issues on Safari/iOS */}
      <CanvasWrapper>
        <Canvas
          shadows
          gl={{
            antialias: true,
            // iOS-specific: Use low-power to stay under memory limits
            powerPreference: isIOS ? "low-power" : "default",
            failIfMajorPerformanceCaveat: false, // Allow fallback rendering
          }}
          // iOS-specific: Use dpr=1 to avoid CSS3D transform calculation errors
          // This prevents the Html component positioning bug on high-DPI devices (iPhone 15 Pro)
          dpr={isIOS ? 1 : [1, 2]}
          onCreated={({ gl }) => {
            // Context created successfully (logging disabled for production)
            // console.log('WebGL context created successfully');
          }}
          onPointerMissed={() => {
            // Handle any pointer events that might interfere
          }}
        >
          <ambientLight intensity={6} />
          <directionalLight
            castShadow
            position={[5, 5, 15]}
            intensity={2}
            shadow-mapSize={[2048, 2048]}
            shadow-camera-far={50}
            shadow-camera-left={-10}
            shadow-camera-right={10}
            shadow-camera-top={10}
            shadow-camera-bottom={-10}
          />
          <SoftShadows size={4} samples={16} />

          <OrthographicCamera makeDefault position={[0, 0, 100]} zoom={100} />
          <CameraController />

          <Float
            speed={1}
            rotationIntensity={1.2}
            floatIntensity={0.1}
            floatingRange={[0.1, 1.5]}
          >
            <BowlGroundPlane position={bowlPosition} color={"#1c1c1c"} />
          </Float>
          <CubeWithFaces />

          <OrbitControls enabled={false} />

          <Preload all />
        </Canvas>
      </CanvasWrapper>
    </div>
  );
};
