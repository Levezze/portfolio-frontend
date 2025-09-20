import { useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { AsciiRenderer, OrthographicCamera } from '@react-three/drei';
// import { getCssColor } from '@/lib/utils';
import * as THREE from 'three';

export const LoadingScene = () => {
    // const asciiColor = getCssColor('--primary');
    console.log('LoadingScene rendering');

    return (
        <div className="w-full h-full absolute inset-0">
            <Canvas className="w-full h-full" shadows>
                <OrthographicCamera makeDefault position={[0, 0, 1000]} zoom={200}/>
                {/* <color attach="background" args={['black']} /> */}
                <ambientLight intensity={6} />
                <directionalLight
                    castShadow
                    position={[8, 7, 15]}
                    intensity={2}
                    shadow-mapSize={[2048, 2048]}
                    shadow-camera-far={50}
                    shadow-camera-left={-10}
                    shadow-camera-right={10}
                    shadow-camera-top={10}
                    shadow-camera-bottom={-10}
                />
                <LoadingCube />
                {/* <AsciiRenderer fgColor="white" bgColor="transparent" /> */}
            </Canvas>
        </div>
    );
}

const LoadingCube = () => {
    const ref = useRef<THREE.Mesh>(null);
    // const viewport = useThree((state) => state.viewport);
    useFrame((_state, delta) => {
        if (ref.current) {
            ref.current.rotation.y += delta * 2
    
        }
    });
    
    return (
        <mesh ref={ref} castShadow>
            <boxGeometry args={[0.2, 0.2, 0.2]} />
            <meshStandardMaterial color="white" />
        </mesh>
    );
}
