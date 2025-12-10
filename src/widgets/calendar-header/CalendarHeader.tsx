'use client';

import { useSetAtom, useAtomValue } from 'jotai';
import { useCalendar } from '@/shared/hooks/use-calendar';
import { cn } from '@/shared/lib/cn';
import { formatDate } from '@/shared/lib/date-utils';
import { initializeDummyData } from '@/shared/lib/dummy-data';
import { SCALE_ORDER } from '@/shared/stores/calendar';
import { entriesAtom, eventsAtom } from '@/shared/stores/entries';
import type { CalendarScale } from '@/shared/types/calendar';

const SCALE_LABELS: Record<CalendarScale, string> = {
  decade: '10년',
  year: '연',
  month: '월',
  week: '주',
  day: '일',
};

export function CalendarHeader() {
  const { scale, focusDate, navigatePrev, navigateNext, goToToday, setScaleTo } = useCalendar();
  const setEntries = useSetAtom(entriesAtom);
  const setEvents = useSetAtom(eventsAtom);
  const entries = useAtomValue(entriesAtom);

  const hasData = Object.keys(entries).length > 0;
  const showNavButtons = scale === 'day';

  const handleLoadDummy = () => {
    const { entries, events } = initializeDummyData();
    setEntries(entries);
    setEvents(events);
  };

  const handleClearData = () => {
    setEntries({});
    setEvents([]);
  };

  const getTitle = () => {
    switch (scale) {
      case 'decade':
        return '타임라인';
      case 'year':
        return '타임라인';
      case 'month':
        return '타임라인';
      case 'week':
        return '타임라인';
      case 'day':
        return formatDate(focusDate, 'YYYY년 M월 D일');
    }
  };

  return (
    <header className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800">
      <div className="flex items-center gap-2">
        {showNavButtons && (
          <button
            onClick={navigatePrev}
            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            aria-label="이전"
          >
            ←
          </button>
        )}
        <h1 className="text-lg font-semibold min-w-[120px] text-center">
          {getTitle()}
        </h1>
        {showNavButtons && (
          <button
            onClick={navigateNext}
            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            aria-label="다음"
          >
            →
          </button>
        )}
        <button
          onClick={goToToday}
          className="ml-2 px-3 py-1.5 text-sm bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors"
        >
          오늘
        </button>
        {!hasData ? (
          <button
            onClick={handleLoadDummy}
            className="ml-2 px-3 py-1.5 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            더미 데이터 로드
          </button>
        ) : (
          <button
            onClick={handleClearData}
            className="ml-2 px-3 py-1.5 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            데이터 초기화
          </button>
        )}
      </div>

      <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1">
        {SCALE_ORDER.map((s) => (
          <button
            key={s}
            onClick={() => setScaleTo(s)}
            className={cn(
              'px-3 py-1.5 text-sm rounded-md transition-colors',
              scale === s
                ? 'bg-white dark:bg-neutral-900 shadow-sm'
                : 'hover:bg-neutral-200 dark:hover:bg-neutral-700'
            )}
          >
            {SCALE_LABELS[s]}
          </button>
        ))}
      </div>
    </header>
  );
}
