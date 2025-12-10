'use client';

import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useCallback } from 'react';
import {
  calendarScaleAtom,
  focusDateAtom,
  prevScaleAtom,
  transitionDirectionAtom,
  getNextScale,
  getPrevScale,
} from '@/shared/stores/calendar';
import type { CalendarScale } from '@/shared/types/calendar';
import { addMonths, addDays } from '@/shared/lib/date-utils';

export function useCalendar() {
  const [scale, setScale] = useAtom(calendarScaleAtom);
  const [focusDate, setFocusDate] = useAtom(focusDateAtom);
  const setPrevScale = useSetAtom(prevScaleAtom);
  const transitionDirection = useAtomValue(transitionDirectionAtom);

  const zoomIn = useCallback(() => {
    const next = getNextScale(scale);
    if (next) {
      setPrevScale(scale);
      setScale(next);
    }
  }, [scale, setScale, setPrevScale]);

  const zoomOut = useCallback(() => {
    const prev = getPrevScale(scale);
    if (prev) {
      setPrevScale(scale);
      setScale(prev);
    }
  }, [scale, setScale, setPrevScale]);

  const goToDate = useCallback((date: Date) => {
    setFocusDate(date);
  }, [setFocusDate]);

  const goToToday = useCallback(() => {
    setFocusDate(new Date());
  }, [setFocusDate]);

  const navigatePrev = useCallback(() => {
    switch (scale) {
      case 'decade':
        setFocusDate(new Date(focusDate.getFullYear() - 10, focusDate.getMonth(), 1));
        break;
      case 'year':
        setFocusDate(new Date(focusDate.getFullYear() - 1, focusDate.getMonth(), 1));
        break;
      case 'month':
        setFocusDate(addMonths(focusDate, -1));
        break;
      case 'week':
        setFocusDate(addDays(focusDate, -7));
        break;
      case 'day':
        setFocusDate(addDays(focusDate, -1));
        break;
    }
  }, [scale, focusDate, setFocusDate]);

  const navigateNext = useCallback(() => {
    switch (scale) {
      case 'decade':
        setFocusDate(new Date(focusDate.getFullYear() + 10, focusDate.getMonth(), 1));
        break;
      case 'year':
        setFocusDate(new Date(focusDate.getFullYear() + 1, focusDate.getMonth(), 1));
        break;
      case 'month':
        setFocusDate(addMonths(focusDate, 1));
        break;
      case 'week':
        setFocusDate(addDays(focusDate, 7));
        break;
      case 'day':
        setFocusDate(addDays(focusDate, 1));
        break;
    }
  }, [scale, focusDate, setFocusDate]);

  const setScaleTo = useCallback((newScale: CalendarScale) => {
    setPrevScale(scale);
    setScale(newScale);
  }, [scale, setScale, setPrevScale]);

  return {
    scale,
    focusDate,
    transitionDirection,
    zoomIn,
    zoomOut,
    goToDate,
    goToToday,
    navigatePrev,
    navigateNext,
    setScaleTo,
  };
}
