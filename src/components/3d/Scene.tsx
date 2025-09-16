import { Canvas } from "@react-three/fiber";
import { OrbitControls, OrthographicCamera, PerspectiveCamera, Sky } from "@react-three/drei";
import { CubeWithFaces } from "./CubeWithFaces";
import { CameraController } from "./CameraController";
import { useResponsiveFaceSize } from "@/hooks/useResponsiveFaceSize";
import { Float } from "@react-three/drei";

export const Scene = () => {
    useResponsiveFaceSize();

    return (
        <div className="canvas w-full h-full">
            <Canvas>
                <Sky />
                <ambientLight intensity={Math.PI / 2} />
                <OrthographicCamera 
                    makeDefault 
                    position={[0, 0, 100]}
                />
                <CameraController />
                <Float
                speed={1} // Animation speed, defaults to 1
                rotationIntensity={0.1} // XYZ rotation intensity, defaults to 1
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