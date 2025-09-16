import { Html } from "@react-three/drei";
import { useRef, useEffect, act } from "react";
import { activeFaceAtom, faceSizeAtom, cubeSizeAtom } from "@/atoms/atomStore";
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
    const cubeSize = useAtomValue(cubeSizeAtom);
    const cubeRef = useRef<THREE.Group>(null);

    let cubeHtmlSize = cubeSize / 2 + .01;

    const cubeFaces: Record<string, CubeFace> = {
        chat: {
            position: [0, 0, cubeHtmlSize],
            rotation: { x: 0, y: 0 },
            page: (
                <MyRuntimeProvider>
                    <ChatUI />
                </MyRuntimeProvider>
            )
        },
        about: {
            position: [0, 0, cubeHtmlSize * -1],
            rotation: { x: 0, y: Math.PI },
            page: <AboutMe />
        },
        projects: {
            position: [cubeHtmlSize, 0, 0],
            rotation: { x: 0, y: -Math.PI/2 },
            page: <Projects />
        },
        contact: {
            position: [cubeHtmlSize * -1, 0, 0],
            rotation: { x: 0, y: Math.PI/2 },
            page: <ContactForm />
        },
        resume: {
            position: [0, cubeHtmlSize, 0],
            rotation: { x: -Math.PI/2, y: 0 },
            page: <Resume />
        },
        secret: {
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
                <boxGeometry args={[cubeSize, cubeSize, cubeSize]} />
                <meshBasicMaterial color="#ffffff" />
            </mesh>

            {activeFace && cubeFaces[activeFace] && (
                <Html 
                    position={cubeFaces[activeFace].position} 
                    center
                    transform
                    occlude
                    sprite={false}
                    distanceFactor={(400 * cubeSize) / faceSize}
                    // scale={0.5}
                >
                    {cubeFaces[activeFace].page}
                </Html>
            )}
        </group>
    )
}