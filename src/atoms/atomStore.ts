import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { type BoxFaces } from '@/types/atomTypes';

// Visitor
export const visitorIdAtom = atomWithStorage('visitorId', '');

// 3D Scene
export const isLoadedAtom = atom<boolean>(false);
export const activeFaceAtom = atom<BoxFaces>('chat');
export const cubeColorAtom = atom<string>('')
export const pageColorAtom = atom<string>('#A8DADC')

// Styling
export const lightThemeAtom = atomWithStorage<boolean>('lightTheme', true);
export const bgMotionAtom = atomWithStorage<boolean>('bgMotion', true)
export const cubeMotionAtom = atomWithStorage<boolean>('cubeMotion', true)

// Sizing
export const cubeSizeAtom = atom<number>(10);
export const faceSizeAtom = atom<number>(800);

// Animation
export const cubeFloatingAtom = atom<boolean>(true);