import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { gsap } from "gsap";
import { useAtomValue } from "jotai";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

import {
  activeFaceAtom,
  cubeColorAtom,
  cubeSizeAtom,
  faceSizeAtom,
} from "@/atoms/atomStore";
import type { CubeFace } from "@/types/cubeTypes";
import { Face } from "../shared/Face";
import AboutMe from "./about/AboutMe";
import ChatUI from "./chat/ChatUI";
import { MyRuntimeProvider } from "./chat/MyRuntimeProvider";
import ContactForm from "./contact/ContactForm";
import Projects from "./projects/Projects";
import Resume from "./resume/Resume";
import SecretPage from "./secret/SecretPage";

export const CubeWithFaces = () => {
  const activeFace = useAtomValue(activeFaceAtom);
  const isFirstRender = useRef(true);
  const isMounted = useRef(false);
  const [, setIsRotating] = useState(false);

  const faceSize = useAtomValue(faceSizeAtom);
  const cubeSize = useAtomValue(cubeSizeAtom);
  const cubeRef = useRef<THREE.Group>(null);
  const cubeMaterialRef = useRef<THREE.MeshStandardMaterial>(null);

  const distanceFactor = useMemo(() => {
    if (!faceSize) {
      return 400;
    }

    return (400 * cubeSize) / faceSize;
  }, [cubeSize, faceSize]);

  const cubeHtmlSize = cubeSize / 2 + 0.02;

  const cubeFaces: Record<string, CubeFace> = useMemo(
    () => ({
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
        ),
      },
      about: {
        position: [cubeHtmlSize, 0, 0],
        rotation: { x: 0, y: -Math.PI / 2 },
        htmlRotation: [0, Math.PI / 2, 0],
        page: (
          <Face>
            <AboutMe />
          </Face>
        ),
      },
      projects: {
        position: [0, 0, cubeHtmlSize * -1],
        rotation: { x: 0, y: Math.PI },
        htmlRotation: [0, Math.PI, 0],
        page: (
          <Face>
            <Projects />
          </Face>
        ),
      },
      contact: {
        position: [cubeHtmlSize * -1, 0, 0],
        rotation: { x: 0, y: Math.PI / 2 },
        htmlRotation: [0, -Math.PI / 2, 0],
        page: (
          <Face>
            <ContactForm />
          </Face>
        ),
      },
      resume: {
        position: [0, cubeHtmlSize * -1, 0],
        rotation: { x: -Math.PI / 2, y: 0 },
        htmlRotation: [Math.PI / 2, 0, 0],
        page: (
          <Face>
            <Resume />
          </Face>
        ),
      },
      secret: {
        position: [0, cubeHtmlSize, 0],
        rotation: { x: Math.PI / 2, y: 0 },
        htmlRotation: [-Math.PI / 2, 0, 0],
        page: (
          <Face>
            <SecretPage />
          </Face>
        ),
      },
    }),
    [cubeHtmlSize],
  );

  const activeFaceData = cubeFaces[activeFace];

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }

    if (cubeRef.current && activeFaceData) {
      const targetRotation = activeFaceData.rotation;
      setIsRotating(true);

      const current = {
        x: cubeRef.current.rotation.x,
        y: cubeRef.current.rotation.y,
      };

      // Calculate shortest path for Y rotation
      let deltaY = targetRotation.y - current.y;

      // Normalize to [-PI, PI]
      if (deltaY > Math.PI) deltaY -= Math.PI * 2;
      if (deltaY < -Math.PI) deltaY += Math.PI * 2;

      gsap.to(cubeRef.current.rotation, {
        x: targetRotation.x,
        y: current.y + deltaY,
        duration: 0.8,
        ease: "power2.inOut",
        onComplete: () => {
          if (cubeRef.current) {
            cubeRef.current.rotation.y = targetRotation.y;
            cubeRef.current.rotation.x = targetRotation.x;
            setIsRotating(false);
          }
        },
      });
    }
  }, [activeFaceData]);

  const targetColor = useAtomValue(cubeColorAtom);

  useFrame((_state, delta) => {
    if (cubeMaterialRef.current && targetColor && targetColor !== "") {
      cubeMaterialRef.current.color.r = THREE.MathUtils.damp(
        cubeMaterialRef.current.color.r,
        new THREE.Color(targetColor).r,
        1.6,
        delta,
      );
    }
  });

  useEffect(() => {
    isFirstRender.current = false;
  }, []);

  return (
    <group ref={cubeRef}>
      <mesh castShadow>
        <boxGeometry args={[cubeSize, cubeSize, cubeSize]} />
        <meshStandardMaterial
          ref={cubeMaterialRef}
          color={targetColor || undefined}
          transparent
          opacity={1}
        />
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
          style={{
            fontSize: "1rem",
            imageRendering: "crisp-edges",
            WebkitFontSmoothing: "antialiased",
          }}
          distanceFactor={distanceFactor}
        >
          {data.page}
        </Html>
      ))}
    </group>
  );
}