import { useThree } from "@react-three/fiber";
import { useAtom, useAtomValue } from "jotai";
import { useEffect } from "react";
import { cubeSizeAtom, faceSizeAtom, isLoadedAtom } from "@/atoms/atomStore";

export const CameraController = () => {
  const { camera, size, viewport, scene, setSize } = useThree();
  const [isLoaded, setIsLoaded] = useAtom(isLoadedAtom);
  const _cubeSize = useAtomValue(cubeSizeAtom);
  const faceSize = useAtomValue(faceSizeAtom);

  useEffect(() => {
    if (camera.type !== "OrthographicCamera" || !faceSize) {
      return;
    }

    if (isLoaded) {
      return;
    }

    const timeout = setTimeout(() => {
      setIsLoaded(true);
    }, 0);

    return () => {
      clearTimeout(timeout);
    };
  }, [camera, faceSize, isLoaded, setIsLoaded]);

  return null;
};

// function calculateDistanceForSize(
//     cubeWorldSize: number,
//     targetPixelSize: number,
//     camera: THREE.OrthographicCamera,
//     viewportHeight: number
// ) {
//     const fov = camera.fov * (Math.PI / 180);
//     return (cubeWorldSize * viewportHeight) / (2 * Math.tan(fov / 2) * targetPixelSize);
// }
