import React, { useRef, useState, useEffect } from 'react';
import { GradientTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useAtomValue } from 'jotai';
import { pageColorAtom } from '@/atoms/atomStore';
import * as THREE from 'three';

export const BowlGroundPlane = ({position, color}:
    {position: [number, number, number], color: string}) => {
      
  const targetColor = useAtomValue(pageColorAtom);
  const [currentColor, setCurrentColor] = useState('#a8dadc');
  const colorRef = useRef(new THREE.Color('#a8dadc'));
  const targetColorRef = useRef(new THREE.Color('#a8dadc'));

  useEffect(() => {
    if (targetColor) {
      targetColorRef.current = new THREE.Color(targetColor);
    }
  }, [targetColor]);

  useFrame((_state, delta) => {
    colorRef.current.r = THREE.MathUtils.damp(
      colorRef.current.r,
      targetColorRef.current.r,
      0.8,
      delta
    );
    colorRef.current.g = THREE.MathUtils.damp(
      colorRef.current.g,
      targetColorRef.current.g,
      0.8,
      delta
    );
    colorRef.current.b = THREE.MathUtils.damp(
      colorRef.current.b,
      targetColorRef.current.b,
      0.8,
      delta
    );

    const hexColor = '#' + colorRef.current.getHexString();
    if (hexColor !== currentColor) {
      setCurrentColor(hexColor);
    }
  });

  return (
    <group>
        <mesh receiveShadow position={position} rotation={[Math.PI / 4, 0, 0]}>
            <sphereGeometry args={[
                200,  // radius
                32,   // widthSegments
                16,   // heightSegments
                0,    // phiStart
                Math.PI * 2, // phiLength
                Math.PI - Math.PI / 6,    // thetaStart - start from bottom
                Math.PI / 6  // thetaLength - sweep upward
            ]} />
            <meshStandardMaterial side={THREE.DoubleSide}>
                <GradientTexture
                    attach="map"
                    stops={[0, 0.999]}
                    colors={[currentColor, '#1c1c1c']}
                    size={1024}
                />
            </meshStandardMaterial>
        </mesh>
    </group>
  )
}


