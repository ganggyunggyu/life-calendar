import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import type { DayEntry, TimelineEvent } from '@/shared/types/calendar';
import { STORAGE_PREFIX } from '@/shared/constants/app-meta';

export const entriesAtom = atomWithStorage<Record<string, DayEntry>>(
  `${STORAGE_PREFIX}entries`,
  {}
);

export const eventsAtom = atomWithStorage<TimelineEvent[]>(
  `${STORAGE_PREFIX}events`,
  []
);

export const entriesByYearAtom = atom((get) => {
  const entries = get(entriesAtom);
  const byYear: Record<number, DayEntry[]> = {};

  Object.values(entries).forEach((entry) => {
    const year = parseInt(entry.date.split('-')[0], 10);
    if (!byYear[year]) byYear[year] = [];
    byYear[year].push(entry);
  });

  return byYear;
});

export const entriesByMonthAtom = atom((get) => {
  const entries = get(entriesAtom);
  const byMonth: Record<string, DayEntry[]> = {};

  Object.values(entries).forEach((entry) => {
    const [year, month] = entry.date.split('-');
    const key = `${year}-${month}`;
    if (!byMonth[key]) byMonth[key] = [];
    byMonth[key].push(entry);
  });

  return byMonth;
});

export const eventsByYearAtom = atom((get) => {
  const events = get(eventsAtom);
  const byYear: Record<number, TimelineEvent[]> = {};

  events.forEach((event) => {
    const year = parseInt(event.startDate.split('-')[0], 10);
    if (!byYear[year]) byYear[year] = [];
    byYear[year].push(event);
  });

  return byYear;
});

export const eventsByMonthAtom = atom((get) => {
  const events = get(eventsAtom);
  const byMonth: Record<string, TimelineEvent[]> = {};

  events.forEach((event) => {
    const [year, month] = event.startDate.split('-');
    const key = `${year}-${month}`;
    if (!byMonth[key]) byMonth[key] = [];
    byMonth[key].push(event);
  });

  return byMonth;
});

export const getYearStats = (entries: DayEntry[]) => {
  if (!entries.length) return { count: 0, avgMood: 0 };

  const moodEntries = entries.filter((e) => e.moodScore);
  const avgMood = moodEntries.length
    ? moodEntries.reduce((sum, e) => sum + (e.moodScore || 0), 0) / moodEntries.length
    : 0;

  return { count: entries.length, avgMood };
};

export const getMonthStats = (entries: DayEntry[]) => {
  if (!entries.length) return { count: 0, avgMood: 0 };

  const moodEntries = entries.filter((e) => e.moodScore);
  const avgMood = moodEntries.length
    ? moodEntries.reduce((sum, e) => sum + (e.moodScore || 0), 0) / moodEntries.length
    : 0;

  return { count: entries.length, avgMood };
};
