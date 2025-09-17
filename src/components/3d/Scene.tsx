import { Canvas } from "@react-three/fiber";
import { OrbitControls, OrthographicCamera, Sky, SoftShadows } from "@react-three/drei";
import { CubeWithFaces } from "./CubeWithFaces";
import { CameraController } from "./CameraController";
import { BowlGroundPlane } from "./BowlGroundPlane";
import { useResponsiveFaceSize } from "@/hooks/useResponsiveFaceSize";
import { Float } from "@react-three/drei";

export const Scene = () => {
    useResponsiveFaceSize();

    return (
        <div className="canvas w-full h-full">
            <Canvas
                shadows
                gl={{
                    antialias: true
                }}
                dpr={1}
            >
                <ambientLight intensity={6} />
                <directionalLight
                    castShadow
                    position={[8, 7, 15]}
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
                <OrthographicCamera makeDefault position={[0, 0, 100]} />
                <CameraController />
                <Float    
                    speed={1}
                    rotationIntensity={1.2}
                    floatIntensity={0.1}
                    floatingRange={[0.1, 1.5]}
                >
                    <BowlGroundPlane position={[20, 65, 50]} color={"#1c1c1c"}/>          
                </Float>    
                <Float
                    speed={0.5}
                    rotationIntensity={0.15}
                    floatIntensity={0.1}
                    floatingRange={[0.1, 2.5]}
                >
                    <CubeWithFaces />
                </Float>
                {/* <OrbitControls /> */}
            </Canvas>

        </div>
    );
}