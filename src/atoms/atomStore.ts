import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

export const visitorIdAtom = atomWithStorage('visitorId', '');