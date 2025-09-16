import { Html } from "@react-three/drei";
import { useRef, useEffect, act } from "react";
import { activeFaceAtom, faceSizeAtom } from "@/atoms/atomStore";
import { useAtom, useAtomValue } from "jotai";
import { gsap } from "gsap";
import { MyRuntimeProvider } from "../providers/MyRuntimeProvider";
import { CubeFace } from "@/types/cubeTypes";
import * as THREE from "three";
import ChatUI from "../faces/ChatUI";
import AboutMe from "../faces/AboutMe";
import ContactForm from "../faces/ContactForm";
import Projects from "../faces/Projects";
import Resume from "../faces/Resume";
import SecretPage from "../faces/SecretPage";

export const CubeWithFaces = () => {
    const [activeFace, setActiveFace] = useAtom(activeFaceAtom);
    const faceSize = useAtomValue(faceSizeAtom);
    const cubeRef = useRef<THREE.Group>(null);

    let cubeHtmlSize = faceSize / 2 + .01;

    const cubeFaces: Record<string, CubeFace> = {
        front: {
            position: [0, 0, cubeHtmlSize],
            rotation: { x: 0, y: 0 },
            page: (
                <MyRuntimeProvider>
                    <ChatUI />
                </MyRuntimeProvider>
            )
        },
        back: {
            position: [0, 0, cubeHtmlSize * -1],
            rotation: { x: 0, y: Math.PI },
            page: <AboutMe />
        },
        right: {
            position: [cubeHtmlSize, 0, 0],
            rotation: { x: 0, y: -Math.PI/2 },
            page: <Projects />
        },
        left: {
            position: [cubeHtmlSize * -1, 0, 0],
            rotation: { x: 0, y: Math.PI/2 },
            page: <ContactForm />
        },
        top: {
            position: [0, cubeHtmlSize, 0],
            rotation: { x: -Math.PI/2, y: 0 },
            page: <Resume />
        },
        bottom: {
            position: [0, cubeHtmlSize * -1, 0],
            rotation: { x: Math.PI/2, y: 0 },
            page: <SecretPage />
        },
    }

    useEffect(() => {
        if (cubeRef.current && cubeFaces[activeFace]) {
            const targetRotation = cubeFaces[activeFace].rotation;

            gsap.to(
                cubeRef.current.rotation, {
                    x: targetRotation.x,
                    y: targetRotation.y,
                    duration: 0.8,
                    ease: "power2.inOut",
                }
            )
        }
    }, [activeFace])

    const htmlScale = faceSize;

    return (
        <group ref={cubeRef}>
            <mesh>
                <boxGeometry args={[faceSize, faceSize, faceSize]} />
                <meshBasicMaterial color="#1c1c1c" />
            </mesh>

            {activeFace && cubeFaces[activeFace] && (
                <Html 
                    position={cubeFaces[activeFace].position} 
                    center
                    transform
                    occlude
                    sprite={false}
                    distanceFactor={htmlScale / 1.21}
                    scale={1}
                >
                    {cubeFaces[activeFace].page}
                </Html>
            )}
        </group>
    )
}