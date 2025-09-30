import { Canvas } from "@react-three/fiber";
import { OrbitControls, OrthographicCamera, PerspectiveCamera, SoftShadows } from "@react-three/drei";
import { CubeWithFaces } from "./scene/CubeWithFaces";
import { CameraController } from "./scene/CameraController";
import { BowlGroundPlane } from "./scene/BowlGroundPlane";
import { useResponsiveFaceSize } from "@/hooks/useResponsiveFaceSize";
import { Float } from "@react-three/drei";
import { useAtomValue } from "jotai";
import { isLoadedAtom, bgMotionAtom } from "@/atoms/atomStore";
import { useEffect, useState, useRef } from "react";

export const Scene = () => {
    // useResponsiveFaceSize();
    const isLoaded = useAtomValue(isLoadedAtom)
    const bgMotion = useAtomValue(bgMotionAtom);

    // WebGL context recovery state
    const [contextLost, setContextLost] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const maxRetries = 3;

    // WebGL context event handlers
    useEffect(() => {
        const handleContextLost = (event: Event) => {
            event.preventDefault();
            console.warn('WebGL context lost, attempting recovery...');
            setContextLost(true);
        };

        const handleContextRestored = () => {
            console.log('WebGL context restored successfully');
            setContextLost(false);
            setRetryCount(0);
        };

        // Find canvas element and attach listeners
        const canvas = document.querySelector('canvas');
        if (canvas) {
            canvasRef.current = canvas;
            canvas.addEventListener('webglcontextlost', handleContextLost);
            canvas.addEventListener('webglcontextrestored', handleContextRestored);

            return () => {
                canvas.removeEventListener('webglcontextlost', handleContextLost);
                canvas.removeEventListener('webglcontextrestored', handleContextRestored);
            };
        }
    }, [isLoaded]);

    // Auto-retry context recovery
    useEffect(() => {
        if (contextLost && retryCount < maxRetries) {
            const timeout = setTimeout(() => {
                console.log(`Retrying WebGL context recovery (attempt ${retryCount + 1}/${maxRetries})`);
                setRetryCount(prev => prev + 1);
                // Force re-render to attempt context recreation
                setContextLost(false);
            }, 1000 * (retryCount + 1)); // Exponential backoff

            return () => clearTimeout(timeout);
        }
    }, [contextLost, retryCount, maxRetries]);

    // Show fallback UI if context is permanently lost
    if (contextLost && retryCount >= maxRetries) {
        return (
            <div className={`canvas w-full h-full ${isLoaded ? "opacity-100" : "opacity-0"} z-0 flex items-center justify-center bg-background`}>
                <div className="text-center p-8 max-w-md">
                    <div className="text-xl font-semibold text-foreground mb-4">
                        3D Display Unavailable
                    </div>
                    <div className="text-muted-foreground mb-6">
                        Browser extensions may be interfering with 3D graphics.
                        Try refreshing the page or temporarily disabling browser extensions.
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
        <div className={`canvas w-full h-full ${isLoaded ? "opacity-100" : "opacity-0"} z-0 relative`}>
            {/* Context recovery notification */}
            {contextLost && (
                <div className="absolute top-4 right-4 z-50 bg-yellow-500/90 text-black px-4 py-2 rounded-md text-sm font-medium">
                    Recovering 3D graphics... ({retryCount + 1}/{maxRetries})
                </div>
            )}

            <Canvas
                shadows
                gl={{
                    antialias: true,
                    powerPreference: "default", // More stable than high-performance
                    failIfMajorPerformanceCaveat: false, // Allow fallback rendering
                }}
                dpr={1}
                onCreated={({ gl }) => {
                    // Log successful context creation
                    console.log('WebGL context created successfully');
                }}
                onPointerMissed={() => {
                    // Handle any pointer events that might interfere
                }}
            >
                <ambientLight intensity={6} />
                <directionalLight
                    castShadow
                    position={[20, 15, 15]}
                    intensity={2}
                    shadow-mapSize={[2048, 2048]}
                    shadow-camera-far={50}
                    shadow-camera-left={-10}
                    shadow-camera-right={10}
                    shadow-camera-top={10}
                    shadow-camera-bottom={-10}
                />
                <SoftShadows
                    size={4}
                    samples={16}
                />
                
                {/* <OrthographicCamera makeDefault position={[0, 0, 100]}/> */}
                {/* <PerspectiveCamera 
                    makeDefault position={[0, 0, 50]}
                    manual={false}
                    fov={75}
                    zoom={5}
                    resolution={500}
                /> */}
                <OrthographicCamera makeDefault position={[0, 0, 100]} zoom={100}/>
                <CameraController />

                {bgMotion ? <Float
                    speed={1}
                    rotationIntensity={1.2}
                    floatIntensity={0.1}
                    floatingRange={[0.1, 1.5]}
                >
                    <BowlGroundPlane position={bowlPosition} color={"#1c1c1c"}/>
                </Float> : <BowlGroundPlane position={bowlPosition} color={"#1c1c1c"}/>}

                <CubeWithFaces />
                
                <OrbitControls enabled={true}/>
            </Canvas>
        </div>
    );
}