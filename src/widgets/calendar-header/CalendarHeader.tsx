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

  return (
    <header className="flex items-center justify-between gap-2 p-2 sm:p-3 border-b border-neutral-200 dark:border-neutral-800">
      {/* 좌측: 스케일 버튼 */}
      <div className="flex items-center gap-0.5 bg-neutral-100 dark:bg-neutral-800 rounded-lg p-0.5">
        {SCALE_ORDER.map((s) => (
          <button
            key={s}
            onClick={() => setScaleTo(s)}
            className={cn(
              'px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm rounded-md transition-colors',
              scale === s
                ? 'bg-white dark:bg-neutral-900 shadow-sm font-medium'
                : 'hover:bg-neutral-200 dark:hover:bg-neutral-700'
            )}
          >
            {SCALE_LABELS[s]}
          </button>
        ))}
      </div>

      {/* 중앙: 날짜 (day 뷰일 때만) + 네비게이션 */}
      {showNavButtons && (
        <div className="flex items-center gap-1">
          <button
            onClick={navigatePrev}
            className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            aria-label="이전"
          >
            ←
          </button>
          <span className="text-xs sm:text-sm font-medium min-w-24 sm:min-w-32 text-center">
            {formatDate(focusDate, 'YYYY.MM.DD')}
          </span>
          <button
            onClick={navigateNext}
            className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            aria-label="다음"
          >
            →
          </button>
        </div>
      )}

      {/* 우측: 오늘 + 데이터 버튼 */}
      <div className="flex items-center gap-1">
        <button
          onClick={goToToday}
          className="px-2 py-1 sm:py-1.5 text-xs sm:text-sm bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors"
        >
          오늘
        </button>
        {!hasData ? (
          <button
            onClick={handleLoadDummy}
            className="px-2 py-1 sm:py-1.5 text-xs sm:text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            <span className="sm:hidden">+</span>
            <span className="hidden sm:inline">더미</span>
          </button>
        ) : (
          <button
            onClick={handleClearData}
            className="px-2 py-1 sm:py-1.5 text-xs sm:text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            <span className="sm:hidden">×</span>
            <span className="hidden sm:inline">초기화</span>
          </button>
        )}
      </div>
    </header>
  );
}
