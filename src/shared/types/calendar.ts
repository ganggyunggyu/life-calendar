export type CalendarScale = 'decade' | 'year' | 'month' | 'week' | 'day';

export interface DateRange {
  start: Date;
  end: Date;
}

export interface DayEntry {
  date: string; // YYYY-MM-DD
  summaryText?: string;
  moodScore?: 1 | 2 | 3 | 4 | 5;
  tags: string[];
  attachments?: string[];
  blocks: EntryBlock[];
}

export type EntryBlockType = 'note' | 'checklist' | 'metric' | 'photo';

export interface EntryBlock {
  id: string;
  type: EntryBlockType;
  content: string;
  checked?: boolean; // checklist용
  value?: number; // metric용
}

export interface TimelineEvent {
  id: string;
  title: string;
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  color: string;
  description?: string;
}

export interface ViewPreference {
  defaultScale: CalendarScale;
  theme: 'light' | 'dark' | 'system';
  moodColors: Record<1 | 2 | 3 | 4 | 5, string>;
}
