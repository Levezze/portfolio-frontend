import { cubeSizeAtom, faceSizeAtom } from '@/atoms/atomStore';
import { useThree } from '@react-three/fiber'
import { useAtomValue } from 'jotai';
import * as THREE from 'three';
import React, { useEffect } from 'react'

export const CameraController = () => {
    const { camera } = useThree();
    const cubeSize = useAtomValue(cubeSizeAtom);
    const faceSize = useAtomValue(faceSizeAtom);

    useEffect(() => {
        if (camera.type === 'OrthographicCamera') {
            const ortho = camera as THREE.OrthographicCamera;
            ortho.zoom = faceSize / cubeSize;
            ortho.updateProjectionMatrix();
        }
    }, [camera, cubeSize, faceSize])

    return null;
}
