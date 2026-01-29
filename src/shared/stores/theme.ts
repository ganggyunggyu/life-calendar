import { atomWithStorage } from 'jotai/utils';

export type Theme = 'system' | 'light' | 'dark';

export const themeAtom = atomWithStorage<Theme>('theme', 'system');
