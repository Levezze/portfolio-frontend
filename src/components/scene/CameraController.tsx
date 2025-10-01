import { isLoadedAtom, cubeSizeAtom, faceSizeAtom } from '@/atoms/atomStore';
import { useThree } from '@react-three/fiber';
import { useAtom, useAtomValue } from 'jotai';
import * as THREE from 'three';
import { useEffect } from 'react';

export const CameraController = () => {
    const { camera, size, viewport, scene, setSize } = useThree();
    const [isLoaded, setIsLoaded] = useAtom(isLoadedAtom);
    const cubeSize = useAtomValue(cubeSizeAtom);
    const faceSize = useAtomValue(faceSizeAtom);

    useEffect(() => {
        if (camera.type !== 'OrthographicCamera' || !faceSize) {
            return;
        }

        // Debug logs - commented out for production
        // console.log('camera', camera);
        // console.log('size', size);
        // console.log('viewport', viewport);
        // console.log('scene', scene);
        // console.log('setSize', setSize);

        // const perspCamera = camera as THREE.PerspectiveCamera;
        // const viewportHeight = size.height || window.innerHeight || 1;
        // const distance = calculateDistanceForSize(cubeSize, faceSize, perspCamera, viewportHeight);

        // perspCamera.position.set(0, 0, distance);
        // perspCamera.lookAt(0, 0, 0);
        // perspCamera.updateProjectionMatrix();

        if (isLoaded) {
            return;
        }

        const timeout = setTimeout(() => {
            setIsLoaded(true);
        }, 0);

        return () => {
            clearTimeout(timeout);
        }
    }, [camera, cubeSize, faceSize, size.height, isLoaded, setIsLoaded]);

    return null;
}

// function calculateDistanceForSize(
//     cubeWorldSize: number, 
//     targetPixelSize: number, 
//     camera: THREE.OrthographicCamera,
//     viewportHeight: number
// ) {
//     const fov = camera.fov * (Math.PI / 180);
//     return (cubeWorldSize * viewportHeight) / (2 * Math.tan(fov / 2) * targetPixelSize);
// }