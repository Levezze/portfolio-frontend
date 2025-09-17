import { Html, ContactShadows } from "@react-three/drei";
import { useRef, useEffect, act, useState } from "react";
import { activeFaceAtom, faceSizeAtom, cubeSizeAtom } from "@/atoms/atomStore";
import { useAtomValue } from "jotai";
import { gsap } from "gsap";
import { MyRuntimeProvider } from "../providers/MyRuntimeProvider";
import { CubeFace } from "@/types/cubeTypes";
import * as THREE from "three";
import ChatUI from "../faces/ChatUI";
import { Face } from "../faces/Face";
// import AboutMe from "../faces/AboutMe";
// import ContactForm from "../faces/ContactForm";
// import Projects from "../faces/Projects";
// import Resume from "../faces/Resume";
// import SecretPage from "../faces/SecretPage";

export const CubeWithFaces = () => {
    const activeFace = useAtomValue(activeFaceAtom);
    const [isRotating, setIsRotating] = useState(false);

    const faceSize = useAtomValue(faceSizeAtom);
    const cubeSize = useAtomValue(cubeSizeAtom);
    const cubeRef = useRef<THREE.Group>(null);

    let cubeHtmlSize = cubeSize / 2 + .02;

    const cubeFaces: Record<string, CubeFace> = {
        chat: {
            position: [0, 0, cubeHtmlSize],
            rotation: { x: 0, y: 0 },
            htmlRotation: [0, 0, 0],
            page: (
                <MyRuntimeProvider>
                    <Face>
                        <ChatUI />
                    </Face>
                </MyRuntimeProvider>
            )
        },
        about: {
            position: [cubeHtmlSize, 0, 0],
            rotation: { x: 0, y: -Math.PI/2 },
            htmlRotation: [0, Math.PI/2, 0],
            page: (
                <MyRuntimeProvider>
                    <Face>
                        <ChatUI />
                    </Face>
                </MyRuntimeProvider>
            )
        },
        projects: {
            position: [0, 0, cubeHtmlSize * -1],
            rotation: { x: 0, y: Math.PI },
            htmlRotation: [0, Math.PI, 0],
            page: (
                <MyRuntimeProvider>
                    <Face>
                        <ChatUI />
                    </Face>
                </MyRuntimeProvider>
            )
        },
        contact: {
            position: [cubeHtmlSize * -1, 0, 0],
            rotation: { x: 0, y: Math.PI/2 },
            htmlRotation: [0, -Math.PI/2, 0],
            page: (
                <MyRuntimeProvider>
                    <Face>
                        <ChatUI />
                    </Face>
                </MyRuntimeProvider>
            )
        },
        resume: {
            position: [0, cubeHtmlSize * -1, 0],
            rotation: { x: -Math.PI/2, y: 0 },
            htmlRotation: [Math.PI/2, 0, 0],
            page: (
                <MyRuntimeProvider>
                    <Face>
                        <ChatUI />
                    </Face>
                </MyRuntimeProvider>
            )
        },
        secret: {
            position: [0, cubeHtmlSize, 0],
            rotation: { x: Math.PI/2, y: 0 },
            htmlRotation: [-Math.PI/2, 0, 0],
            page: (
                <MyRuntimeProvider>
                    <Face>
                        <ChatUI />
                    </Face>
                </MyRuntimeProvider>
            )
        },
    }

    useEffect(() => {
        if (cubeRef.current && cubeFaces[activeFace]) {
            const targetRotation = cubeFaces[activeFace].rotation;
            setIsRotating(true);
            
            const current = {
                x: cubeRef.current.rotation.x,
                y: cubeRef.current.rotation.y
            };
            
            // Calculate shortest path for Y rotation
            let deltaY = targetRotation.y - current.y;
            
            // Normalize to [-PI, PI]
            if (deltaY > Math.PI) deltaY -= Math.PI * 2;
            if (deltaY < -Math.PI) deltaY += Math.PI * 2;

            gsap.to(
                cubeRef.current.rotation, {
                    x: targetRotation.x,
                    y: current.y + deltaY,
                    duration: 0.8,
                    ease: "power2.inOut",
                    onComplete: () => {
                        // Force the rotation to the expected value
                        if (cubeRef.current) {
                            cubeRef.current.rotation.y = targetRotation.y;
                            cubeRef.current.rotation.x = targetRotation.x;
                            setIsRotating(false); 
                        }
                    }
                }
            );
        }
    }, [activeFace])

    return (
        <group ref={cubeRef}>
            <mesh castShadow>
                <boxGeometry args={[cubeSize, cubeSize, cubeSize]} />
                <meshStandardMaterial color={"#ffffff"} transparent opacity={1} />
            </mesh>

            {Object.entries(cubeFaces).map(([face, data]) => (
                <Html
                    key={face}
                    position={data.position}
                    rotation={data.htmlRotation}
                    center
                    transform
                    occlude
                    sprite={false}
                    distanceFactor={(400 * cubeSize) / faceSize}
                    style={{
                        opacity: face === activeFace || isRotating ? 1 : 0,
                        pointerEvents: face === activeFace ? 'auto' : 'none',
                        transition: "opacity 1.3s ease-in-out",
                        transform: 'translate3d(0, 0, 0)',
                        willChange: 'transform'
                    }}
                >
                    {data.page}
                </Html>
            ))}
        </group>
    )
}