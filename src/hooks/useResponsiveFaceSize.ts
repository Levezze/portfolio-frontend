import { useEffect } from "react";
import { useSetAtom } from "jotai";
import { faceSizeAtom } from "@/atoms/atomStore";

export const useResponsiveFaceSize = () => {
    const setFaceSize = useSetAtom(faceSizeAtom);
    
    useEffect(() => {
        const updateSize = () => {
            const styles = getComputedStyle(document.documentElement);
            const size = styles.getPropertyValue('--face-size');
            setFaceSize(parseInt(size));
        }

        updateSize()
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, [setFaceSize])
}
