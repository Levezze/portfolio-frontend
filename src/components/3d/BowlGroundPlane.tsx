import React from 'react';
import { GradientTexture } from '@react-three/drei';
import * as THREE from 'three';

export const BowlGroundPlane = ({position, color}: 
    {position: [number, number, number], color: string}) => {
  return (
    <group>
        <mesh receiveShadow position={position} rotation={[Math.PI / 6, 0, 0]}>
            <sphereGeometry args={[
                70,  // radius
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
                    stops={[0, 0.8]}
                    colors={['#1c1c1c', '#a8dadc']}
                    size={1024}
                />
            </meshStandardMaterial>
        </mesh>
    </group>
  )
}


