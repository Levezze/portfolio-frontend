import { Html, RenderTexture } from "@react-three/drei";
import { useRef, useEffect, act, useState } from "react";
import { activeFaceAtom, faceSizeAtom, cubeSizeAtom } from "@/atoms/atomStore";
import { useAtomValue } from "jotai";
import { gsap } from "gsap";
import { MyRuntimeProvider } from "../providers/MyRuntimeProvider";
import { CubeFace } from "@/types/cubeTypes";
import * as THREE from "three";
import ChatUI from "../faces/ChatUI";
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

    let cubeHtmlSize = cubeSize / 2 + .01;

    const cubeFaces: Record<string, CubeFace> = {
        chat: {
            position: [0, 0, cubeHtmlSize],
            rotation: { x: 0, y: 0 },
            htmlRotation: [0, 0, 0],
            page: (
                <MyRuntimeProvider>
                    <ChatUI />
                </MyRuntimeProvider>
            )
        },
        about: {
            position: [0, 0, cubeHtmlSize * -1],
            rotation: { x: 0, y: Math.PI },
            htmlRotation: [0, Math.PI, 0],
            page: (
                <MyRuntimeProvider>
                    <ChatUI />
                </MyRuntimeProvider>
            )
        },
        projects: {
            position: [cubeHtmlSize, 0, 0],
            rotation: { x: 0, y: -Math.PI/2 },
            htmlRotation: [0, Math.PI/2, 0],
            page: (
                <MyRuntimeProvider>
                    <ChatUI />
                </MyRuntimeProvider>
            )
        },
        contact: {
            position: [cubeHtmlSize * -1, 0, 0],
            rotation: { x: 0, y: Math.PI/2 },
            htmlRotation: [0, -Math.PI/2, 0],
            page: (
                <MyRuntimeProvider>
                    <ChatUI />
                </MyRuntimeProvider>
            )
        },
        resume: {
            position: [0, cubeHtmlSize * -1, 0],
            rotation: { x: -Math.PI/2, y: 0 },
            htmlRotation: [Math.PI/2, 0, 0],
            page: (
                <MyRuntimeProvider>
                    <ChatUI />
                </MyRuntimeProvider>
            )
        },
        secret: {
            position: [0, cubeHtmlSize, 0],
            rotation: { x: Math.PI/2, y: 0 },
            htmlRotation: [-Math.PI/2, 0, 0],
            page: (
                <MyRuntimeProvider>
                    <ChatUI />
                </MyRuntimeProvider>
            )
        },
    }

    useEffect(() => {
        if (cubeRef.current && cubeFaces[activeFace]) {
            const targetRotation = cubeFaces[activeFace].rotation;

            setIsRotating(true);
            
            const rotatingTimeout = setTimeout(() => {
                setIsRotating(false);
            }, 1000)

            gsap.to(
                cubeRef.current.rotation, {
                    x: targetRotation.x,
                    y: targetRotation.y,
                    duration: 0.8,
                    ease: "power2.inOut",
                }
            );

            return () => {
                clearTimeout(rotatingTimeout);
            }
        }
    }, [activeFace])

    return (
        <group ref={cubeRef}>
            <mesh>
                <boxGeometry args={[cubeSize, cubeSize, cubeSize]} />
                <meshBasicMaterial color="#ffffff" />
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
                        // transition: 'opacity 1s'
                    }}
                >
                    {data.page}
                </Html>
            ))}
        </group>
    )
}