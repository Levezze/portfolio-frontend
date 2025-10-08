import { GradientTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useAtomValue } from "jotai";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { pageColorAtom } from "@/atoms/atomStore";

export const BowlGroundPlane = ({
  position,
  color,
}: {
  position: [number, number, number];
  color: string;
}) => {
  const targetColor = useAtomValue(pageColorAtom);
  const [currentColor, setCurrentColor] = useState("#a8dadc");
  const colorRef = useRef(new THREE.Color("#a8dadc"));
  const targetColorRef = useRef(new THREE.Color("#a8dadc"));
  const isColorChanging = useRef(false);

  const sphereArgs = useMemo<
    [number, number, number, number, number, number, number]
  >(
    () => [
      200, // radius
      32, // widthSegments
      16, // heightSegments
      0, // phiStart
      Math.PI * 2, // phiLength
      Math.PI - Math.PI / 6, // thetaStart
      Math.PI / 6, // thetaLength
    ],
    [],
  );

  useEffect(() => {
    if (targetColor) {
      targetColorRef.current = new THREE.Color(targetColor);
      isColorChanging.current = true;
    }
  }, [targetColor]);

  useFrame((_state, delta) => {
    if (!isColorChanging.current) return;

    // Damp all RGB channels
    colorRef.current.r = THREE.MathUtils.damp(
      colorRef.current.r,
      targetColorRef.current.r,
      0.8,
      delta,
    );
    colorRef.current.g = THREE.MathUtils.damp(
      colorRef.current.g,
      targetColorRef.current.g,
      0.8,
      delta,
    );
    colorRef.current.b = THREE.MathUtils.damp(
      colorRef.current.b,
      targetColorRef.current.b,
      0.8,
      delta,
    );

    // Check if color is close enough (threshold check)
    const threshold = 0.001;
    const rDiff = Math.abs(colorRef.current.r - targetColorRef.current.r);
    const gDiff = Math.abs(colorRef.current.g - targetColorRef.current.g);
    const bDiff = Math.abs(colorRef.current.b - targetColorRef.current.b);

    if (rDiff < threshold && gDiff < threshold && bDiff < threshold) {
      // Close enough - snap to final color and stop
      colorRef.current.copy(targetColorRef.current);
      isColorChanging.current = false;
      setCurrentColor(`#${colorRef.current.getHexString()}`);
      return;
    }

    // Update current color for gradient texture
    const hexColor = `#${colorRef.current.getHexString()}`;
    if (hexColor !== currentColor) {
      setCurrentColor(hexColor);
    }
  });

  return (
    <group>
      <mesh receiveShadow position={position} rotation={[Math.PI / 4, 0, 0]}>
        <sphereGeometry args={sphereArgs} />
        <meshStandardMaterial side={THREE.DoubleSide}>
          <GradientTexture
            attach="map"
            stops={[0, 0.999]}
            colors={[currentColor, "#1c1c1c"]}
            size={256}
            width={256}
          />
        </meshStandardMaterial>
      </mesh>
    </group>
  );
};
