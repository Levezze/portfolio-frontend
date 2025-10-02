import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { gsap } from "gsap";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

import {
  activeFaceAtom,
  cubeColorAtom,
  cubeSizeAtom,
  faceSizeAtom,
  pageTransitionManagerAtom,
  transitionDurationAtom,
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
  const transitionDuration = useAtomValue(transitionDurationAtom);
  const triggerTransition = useSetAtom(pageTransitionManagerAtom);
  const cubeRef = useRef<THREE.Group>(null);
  const cubeMaterialRef = useRef<THREE.MeshStandardMaterial>(null);
  const isColorChanging = useRef(false);
  const targetColorRef = useRef<THREE.Color>(new THREE.Color());

  const distanceFactor = useMemo(() => {
    if (!faceSize) {
      return 400;
    }

    return (400 * cubeSize) / faceSize;
  }, [cubeSize, faceSize]);

  const cubeHtmlSize = cubeSize / 2 + 0.02;

  const boxArgs = useMemo<[number, number, number]>(
    () => [cubeSize, cubeSize, cubeSize],
    [cubeSize]
  );

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
    [cubeHtmlSize]
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

  // Trigger face opacity transition when active face changes
  useEffect(() => {
    if (!isMounted.current) return;
    triggerTransition(null);
  }, [activeFace, triggerTransition]);

  const targetColor = useAtomValue(cubeColorAtom);

  // Set up target color and start animation when color changes
  useEffect(() => {
    if (targetColor && targetColor !== "") {
      targetColorRef.current.set(targetColor);
      isColorChanging.current = true;
    }
  }, [targetColor]);

  useFrame((_state, delta) => {
    if (!isColorChanging.current || !cubeMaterialRef.current) return;

    const material = cubeMaterialRef.current;
    const target = targetColorRef.current;

    // Damp all RGB channels
    material.color.r = THREE.MathUtils.damp(material.color.r, target.r, 1.6, delta);
    material.color.g = THREE.MathUtils.damp(material.color.g, target.g, 1.6, delta);
    material.color.b = THREE.MathUtils.damp(material.color.b, target.b, 1.6, delta);

    // Stop when close enough (threshold check)
    const threshold = 0.001;
    const rDiff = Math.abs(material.color.r - target.r);
    const gDiff = Math.abs(material.color.g - target.g);
    const bDiff = Math.abs(material.color.b - target.b);

    if (rDiff < threshold && gDiff < threshold && bDiff < threshold) {
      material.color.copy(target);
      isColorChanging.current = false;
    }
  });

  useEffect(() => {
    isFirstRender.current = false;
  }, []);

  return (
    <group ref={cubeRef}>
      <mesh castShadow>
        <boxGeometry args={boxArgs} />
        <meshStandardMaterial
          ref={cubeMaterialRef}
          color={targetColor || undefined}
          transparent
          opacity={1}
        />
      </mesh>

      {Object.entries(cubeFaces).map(([face, data]) => {
        const isActive = face === activeFace;

        return (
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
              opacity: isActive ? 1 : 0,
              transition: isActive
                ? 'opacity 50ms ease-out'  // Quick appear
                : `opacity ${transitionDuration}ms ease-in-out`,  // Slow fade-out
              pointerEvents: isActive ? 'auto' : 'none',
            }}
            distanceFactor={4}
          >
            {data.page}
          </Html>
        );
      })}
    </group>
  );
};
