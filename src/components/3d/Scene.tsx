import { Canvas } from "@react-three/fiber";
import { OrbitControls, OrthographicCamera, PerspectiveCamera, Sky } from "@react-three/drei";
import { CubeWithFaces } from "./CubeWithFaces";
import { CameraController } from "./CameraController";
import { useResponsiveFaceSize } from "@/hooks/useResponsiveFaceSize";

export const Scene = () => {
    useResponsiveFaceSize();

    return (
        <div className="canvas w-full h-full">
            <Canvas>
                {/* <Sky /> */}
                <ambientLight intensity={Math.PI / 2} />
                <OrthographicCamera 
                    makeDefault 
                    position={[0, 0, 100]}
                />
                <CameraController />
                <CubeWithFaces />
                <OrbitControls />
            </Canvas>
        </div>
    );
}