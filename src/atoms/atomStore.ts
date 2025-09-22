import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { type PagesType } from '@/lib/api/schemas/tools';

// Visitor
export const visitorIdAtom = atomWithStorage('visitorId', '');

// 3D Scene
export const isLoadedAtom = atom<boolean>(false);
export const activeFaceAtom = atom<PagesType>('chat');
export const cubeColorAtom = atom<string>('')
export const pageColorAtom = atom<string>('#A8DADC')

// Styling
export const lightThemeAtom = atomWithStorage<boolean>('lightTheme', true);
export const bgMotionAtom = atomWithStorage<boolean>('bgMotion', true)
export const cubeMotionAtom = atomWithStorage<boolean>('cubeMotion', true)
export const transitionDurationAtom = atom<number>(200);

let currentTimeout: NodeJS.Timeout | null = null;
export const pageTransitionManagerAtom = atom(
    get => get(transitionDurationAtom),
    (_get, set, _update) => {
        const SHORT_TRANSITION = 200;
        const LONG_TRANSITION = 3000;

        if (currentTimeout) clearTimeout(currentTimeout);
        
        set(transitionDurationAtom, LONG_TRANSITION);
        
        currentTimeout = setTimeout(() => {
            set(transitionDurationAtom, SHORT_TRANSITION);
        }, LONG_TRANSITION);
    }
);

// Sizing
export const cubeSizeAtom = atom<number>(10);
export const faceSizeAtom = atom<number>(800);

// Animation
export const cubeFloatingAtom = atom<boolean>(true);