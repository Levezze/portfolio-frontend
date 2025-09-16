import { Html } from "@react-three/drei";
import { useRef, useEffect, act } from "react";
import { activeFaceAtom } from "@/atoms/atomStore";
import { useAtom } from "jotai";
import { gsap } from "gsap";
import { MyRuntimeProvider } from "../providers/MyRuntimeProvider";
import * as THREE from "three";
import ChatUI from "../faces/ChatUI";
import AboutMe from "../faces/AboutMe";
import ContactForm from "../faces/ContactForm";
import Projects from "../faces/Projects";
import Resume from "../faces/Resume";
import SecretPage from "../faces/SecretPage";

export const CubeWithFaces = () => {
    const [activeFace, setActiveFace] = useAtom(activeFaceAtom);
    const boxRef = useRef<THREE.Group>(null);

    const boxFaces = {
        front: {
            position: [0, 0, 1.01],
            rotation: { x: 0, y: 0 },
            page: (
                <MyRuntimeProvider>
                    <ChatUI />
                </MyRuntimeProvider>
            )
        },
        back: {
            position: [0, 0, -1.01],
            rotation: { x: 0, y: Math.PI },
            page: <AboutMe />
        },
        right: {
            position: [1.01, 0, 0],
            rotation: { x: 0, y: -Math.PI/2 },
            page: <Projects />
        },
        left: {
            position: [-1.01, 0, 0],
            rotation: { x: 0, y: Math.PI/2 },
            page: <ContactForm />
        },
        top: {
            position: [0, 1.01, 0],
            rotation: { x: -Math.PI/2, y: 0 },
            page: <Resume />
        },
        bottom: {
            position: [0, -1.01, 0],
            rotation: { x: Math.PI/2, y: 0 },
            page: <SecretPage />
        },
    }

    useEffect(() => {
        if (boxRef.current && boxFaces[activeFace]) {
            const targetRotation = boxFaces[activeFace].rotation;

            gsap.to(
                boxRef.current.rotation, {
                    x: targetRotation.x,
                    y: targetRotation.y,
                    duration: 0.8,
                    ease: "power2.inOut",
                }
            )
        }
    }, [activeFace])

    return (
        <group ref={boxRef}>
            <mesh>
                <boxGeometry args={[10, 10, 10]} />
                <meshBasicMaterial color="1c1c1c" />
            </mesh>

            {activeFace && boxFaces[activeFace] && (
                <Html position={boxFaces[activeFace].position} center>
                    {boxFaces[activeFace].page}
                </Html>
            )}
        </group>
    )
}