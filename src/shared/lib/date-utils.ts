import type { CalendarScale, DateRange } from '@/shared/types/calendar';

export function formatDate(date: Date, format: string): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return format
    .replace('YYYY', String(year))
    .replace('MM', String(month).padStart(2, '0'))
    .replace('M', String(month))
    .replace('DD', String(day).padStart(2, '0'))
    .replace('D', String(day));
}

export function toDateString(date: Date): string {
  return formatDate(date, 'YYYY-MM-DD');
}

export function getDecadeRange(date: Date): DateRange {
  const year = date.getFullYear();
  const decadeStart = Math.floor(year / 10) * 10;
  return {
    start: new Date(decadeStart, 0, 1),
    end: new Date(decadeStart + 9, 11, 31),
  };
}

export function getYearRange(date: Date): DateRange {
  const year = date.getFullYear();
  return {
    start: new Date(year, 0, 1),
    end: new Date(year, 11, 31),
  };
}

export function getMonthRange(date: Date): DateRange {
  const year = date.getFullYear();
  const month = date.getMonth();
  return {
    start: new Date(year, month, 1),
    end: new Date(year, month + 1, 0),
  };
}

export function getWeekRange(date: Date): DateRange {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  const start = new Date(d.setDate(diff));
  const end = new Date(d.setDate(d.getDate() + 6));
  return { start, end };
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function getMonthCalendarDays(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPadding = firstDay.getDay();
  const endPadding = 6 - lastDay.getDay();

  const days: Date[] = [];

  // 이전 달 날짜
  for (let i = startPadding - 1; i >= 0; i--) {
    days.push(new Date(year, month, -i));
  }

  // 현재 달 날짜
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(year, month, i));
  }

  // 다음 달 날짜
  for (let i = 1; i <= endPadding; i++) {
    days.push(new Date(year, month + 1, i));
  }

  return days;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isSameMonth(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth()
  );
}

export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

export function getVisibleRange(date: Date, scale: CalendarScale): DateRange {
  switch (scale) {
    case 'decade':
      return getDecadeRange(date);
    case 'year':
      return getYearRange(date);
    case 'month':
      return getMonthRange(date);
    case 'week':
      return getWeekRange(date);
    case 'day':
      return { start: date, end: date };
  }
}

export function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}
