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
                <Sky distance={50000} sunPosition={[5, 5, 0]} />
                <ambientLight intensity={5} />
                <directionalLight
                    castShadow
                    position={[3, 10, 5]}
                    intensity={1}
                    shadow-mapSize={[2048, 2048]}
                    shadow-camera-far={50}
                    shadow-camera-left={-10}
                    shadow-camera-right={10}
                    shadow-camera-top={10}
                    shadow-camera-bottom={-10}
                />
                <OrthographicCamera makeDefault position={[0, 0, 100]} />
                <CameraController />      
                <BowlGroundPlane position={[0, 50, 0]} color={"#1c1c1c"}/>          
                <Float
                    speed={0.5} // Animation speed, defaults to 1
                    rotationIntensity={0.15} // XYZ rotation intensity, defaults to 1
                    floatIntensity={0.1} // Up/down float intensity, works like a multiplier with floatingRange,defaults to 1
                    floatingRange={[0.1, 2.5]} // Range of y-axis values the object will float within, defaults to [-0.1,0.1]
                >
                    <CubeWithFaces />
                </Float>

                <OrbitControls />
            </Canvas>

        </div>
    );
}