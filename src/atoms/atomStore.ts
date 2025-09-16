import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { type BoxFaces } from '@/types/atomTypes';

export const visitorIdAtom = atomWithStorage('visitorId', '');
export const activeFaceAtom = atom<BoxFaces>('chat');

// Sizing
export const cubeSizeAtom = atom<number>(10);
export const faceSizeAtom = atom<number>(800);