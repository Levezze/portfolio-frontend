import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { type BoxFaces } from '@/types/atomTypes';

// Visitor
export const visitorIdAtom = atomWithStorage('visitorId', '');

// Cube Faces
export const activeFaceAtom = atom<BoxFaces>('chat');

// Styling
export const lightThemeAtom = atom<boolean>(true);
export const bgMotionAtom = atom<boolean>(true)
export const cubeMotionAtom = atom<boolean>(true)

// Sizing
export const cubeSizeAtom = atom<number>(10);
export const faceSizeAtom = atom<number>(800);

// Animation
export const cubeFloatingAtom = atom<boolean>(true);