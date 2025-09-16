import { Canvas } from "@react-three/fiber";
import { OrbitControls, OrthographicCamera } from "@react-three/drei";
import { CubeWithFaces } from "./CubeWithFaces";
import { CameraController } from "./CameraController";
import { useResponsiveFaceSize } from "@/hooks/useResponsiveFaceSize";

export const Scene = () => {
    useResponsiveFaceSize();

    return (
        <div className="canvas w-full h-full">
            <Canvas>
                <OrthographicCamera 
                    makeDefault 
                    position={[0, 0, 1000]}
                    zoom={1}
                />
                {/* <CameraController /> */}
                <CubeWithFaces />
                <OrbitControls />
            </Canvas>
        </div>
    );
}