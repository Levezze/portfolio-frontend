import { isLoadedAtom, cubeSizeAtom, faceSizeAtom } from '@/atoms/atomStore';
import { useThree } from '@react-three/fiber';
import { useAtom, useAtomValue } from 'jotai';
import * as THREE from 'three';
import { useEffect } from 'react';

export const CameraController = () => {
    const { camera } = useThree();
    const [isLoaded, setIsLoaded] = useAtom(isLoadedAtom);
    const cubeSize = useAtomValue(cubeSizeAtom);
    const faceSize = useAtomValue(faceSizeAtom);
    console.log(isLoaded);

    useEffect(() => {
        if (camera.type === 'OrthographicCamera') {
            const ortho = camera as THREE.OrthographicCamera;
            ortho.zoom = faceSize / cubeSize;
            ortho.updateProjectionMatrix();

            setTimeout(() => {
                if (!isLoaded) {
                    setIsLoaded(true);
                }
            }, 0);
        }
    }, [camera, cubeSize, faceSize, isLoaded, setIsLoaded])

    return null;
}
