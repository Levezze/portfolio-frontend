import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { BoxFaces } from '@/types/atomTypes';

export const visitorIdAtom = atomWithStorage('visitorId', '');
export const activeFaceAtom = atom<BoxFaces>('front');

// Sizing
export const cubeSizeAtom = atom<number>(10);