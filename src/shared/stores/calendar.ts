import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import type { CalendarScale } from '@/shared/types/calendar';
import { STORAGE_PREFIX } from '@/shared/constants/app-meta';

export const calendarScaleAtom = atomWithStorage<CalendarScale>(
  `${STORAGE_PREFIX}calendarScale`,
  'month'
);

export const focusDateAtom = atom<Date>(new Date());

export const prevScaleAtom = atom<CalendarScale | null>(null);

export type TransitionDirection = 'zoomIn' | 'zoomOut' | null;

export const transitionDirectionAtom = atom<TransitionDirection>((get) => {
  const prev = get(prevScaleAtom);
  const current = get(calendarScaleAtom);
  if (!prev) return null;

  const prevIdx = SCALE_ORDER.indexOf(prev);
  const currentIdx = SCALE_ORDER.indexOf(current);

  if (currentIdx > prevIdx) return 'zoomIn';
  if (currentIdx < prevIdx) return 'zoomOut';
  return null;
});

export const focusDateStringAtom = atom(
  (get) => {
    const date = get(focusDateAtom);
    return date.toISOString().split('T')[0];
  }
);

// 스케일 변경 헬퍼
export const SCALE_ORDER: CalendarScale[] = ['decade', 'year', 'month', 'week', 'day'];

export function getNextScale(current: CalendarScale): CalendarScale | null {
  const idx = SCALE_ORDER.indexOf(current);
  return idx < SCALE_ORDER.length - 1 ? SCALE_ORDER[idx + 1] : null;
}

export function getPrevScale(current: CalendarScale): CalendarScale | null {
  const idx = SCALE_ORDER.indexOf(current);
  return idx > 0 ? SCALE_ORDER[idx - 1] : null;
}
