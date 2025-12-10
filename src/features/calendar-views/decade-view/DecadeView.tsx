'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { useAtomValue } from 'jotai';
import { useCalendar } from '@/shared/hooks/use-calendar';
import { cn } from '@/shared/lib/cn';
import { entriesByYearAtom, eventsByYearAtom, getYearStats } from '@/shared/stores/entries';

const START_YEAR = 1900;
const END_YEAR = 2100;
const CARD_WIDTH_MOBILE = 100;
const CARD_WIDTH_DESKTOP = 160;
const YEARS = Array.from({ length: END_YEAR - START_YEAR + 1 }, (_, i) => START_YEAR + i);

export function DecadeView() {
  const { focusDate, goToDate, zoomIn } = useCalendar();
  const currentYear = focusDate.getFullYear();
  const today = new Date();
  const scrollRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);
  const [visibleRange, setVisibleRange] = useState({ start: currentYear - 5, end: currentYear + 5 });

  const entriesByYear = useAtomValue(entriesByYearAtom);
  const eventsByYear = useAtomValue(eventsByYearAtom);

  const startYear = START_YEAR;
  const endYear = END_YEAR;
  const years = YEARS;

  const maxEntries = Math.max(
    ...years.map((year) => entriesByYear[year]?.length || 0),
    1
  );

  const getCardWidth = () => {
    if (typeof window === 'undefined') return CARD_WIDTH_DESKTOP;
    return window.innerWidth < 640 ? CARD_WIDTH_MOBILE : CARD_WIDTH_DESKTOP;
  };

  const handleYearClick = (year: number) => {
    goToDate(new Date(year, focusDate.getMonth(), 1));
    zoomIn();
  };

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    const cardWidth = getCardWidth() + 12;
    const startIdx = Math.floor(scrollLeft / cardWidth);
    const endIdx = Math.floor((scrollLeft + clientWidth) / cardWidth);

    setVisibleRange({
      start: years[Math.max(0, startIdx)] || startYear,
      end: years[Math.min(years.length - 1, endIdx)] || endYear,
    });
  };

  const scrollToYear = useCallback((year: number, smooth = true) => {
    const el = scrollRef.current;
    if (!el) return;

    const cardWidth = getCardWidth() + 12;
    const yearIdx = YEARS.indexOf(year);
    if (yearIdx >= 0) {
      const scrollPos = yearIdx * cardWidth - el.clientWidth / 2 + cardWidth / 2;
      el.scrollTo({ left: Math.max(0, scrollPos), behavior: smooth ? 'smooth' : 'instant' });
    }
  }, []);

  useEffect(() => {
    if (isInitialMount.current) {
      scrollToYear(currentYear, false);
      isInitialMount.current = false;
    } else {
      scrollToYear(currentYear, true);
    }
  }, [currentYear, scrollToYear]);

  return (
    <div className="h-full flex flex-col">
      {/* 현재 구간 표시 */}
      <div className="px-4 sm:px-6 py-2 sm:py-3 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center justify-between">
          <div className="text-xs sm:text-sm text-neutral-500">
            보이는 구간
          </div>
          <div className="font-semibold text-sm sm:text-base">
            {visibleRange.start} - {visibleRange.end}
          </div>
        </div>
        <div className="mt-2 h-1 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all"
            style={{
              marginLeft: `${((visibleRange.start - startYear) / (endYear - startYear)) * 100}%`,
              width: `${((visibleRange.end - visibleRange.start + 1) / (endYear - startYear + 1)) * 100}%`,
            }}
          />
        </div>
        <div className="hidden sm:flex justify-between text-xs text-neutral-400 mt-1">
          <span>{startYear}</span>
          <span>{endYear}</span>
        </div>
      </div>

      {/* 가로 스크롤 타임라인 */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-x-auto overflow-y-hidden scroll-smooth snap-x snap-mandatory touch-pan-x"
      >
        <div className="h-full min-w-max flex items-stretch px-4 sm:px-8 py-4 sm:py-6 gap-3">
          {years.map((year, idx) => {
            const isCurrentYear = year === today.getFullYear();
            const isSelected = year === currentYear;
            const yearEntries = entriesByYear[year] || [];
            const yearEvents = eventsByYear[year] || [];
            const { count, avgMood } = getYearStats(yearEntries);
            const barHeight = maxEntries > 0 ? (count / maxEntries) * 100 : 0;
            const isFuture = year > today.getFullYear();
            const isLast = idx === years.length - 1;
            const isDecadeStart = year % 10 === 0;

            return (
              <div
                key={year}
                className="flex flex-col h-full snap-center"
              >
                {/* 콘텐츠 카드 */}
                <button
                  onClick={() => handleYearClick(year)}
                  className={cn(
                    'flex-1 w-[100px] sm:w-[160px] p-2 sm:p-3 rounded-xl border transition-all text-left flex flex-col',
                    'hover:border-blue-400 hover:shadow-lg hover:-translate-y-1',
                    'active:scale-95',
                    'border-neutral-200 dark:border-neutral-800',
                    isSelected && 'bg-blue-50 dark:bg-blue-900/20 border-blue-400 -translate-y-1 shadow-lg',
                    isFuture && 'opacity-40',
                    isDecadeStart && 'border-l-2 border-l-blue-400'
                  )}
                >
                  {/* 연도 헤더 */}
                  <div className="flex items-center justify-between mb-1 sm:mb-2">
                    <span
                      className={cn(
                        'text-lg sm:text-xl font-bold',
                        isCurrentYear && 'text-blue-500',
                        isFuture && 'text-neutral-400'
                      )}
                    >
                      {year}
                    </span>
                    {avgMood > 0 && (
                      <span className="text-sm sm:text-base">{getMoodEmoji(avgMood)}</span>
                    )}
                  </div>

                  {/* 이벤트 목록 - 모바일에서 숨김 */}
                  <div className="hidden sm:block flex-1 space-y-1 mb-2 overflow-y-auto">
                    {yearEvents.map((event) => (
                      <div
                        key={event.id}
                        className="flex items-center gap-1.5"
                      >
                        <div
                          className="w-1 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: event.color }}
                        />
                        <span className="text-xs truncate">{event.title}</span>
                      </div>
                    ))}
                    {!yearEvents.length && !isFuture && count === 0 && (
                      <div className="text-xs text-neutral-400">기록 없음</div>
                    )}
                    {isFuture && (
                      <div className="text-xs text-neutral-400">미래</div>
                    )}
                  </div>

                  {/* 모바일: 간단한 통계 */}
                  <div className="sm:hidden flex-1 flex items-center justify-center">
                    {count > 0 ? (
                      <span className="text-xs text-neutral-500">{count}개</span>
                    ) : isFuture ? (
                      <span className="text-xs text-neutral-400">-</span>
                    ) : (
                      <span className="text-xs text-neutral-400">-</span>
                    )}
                  </div>

                  {/* 활동 바 */}
                  {count > 0 && (
                    <div>
                      <div className="hidden sm:block text-xs text-neutral-500 mb-1">
                        {count}개
                      </div>
                      <div className="h-1 sm:h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-linear-to-r from-blue-400 to-blue-600 rounded-full transition-all"
                          style={{ width: `${barHeight}%` }}
                        />
                      </div>
                    </div>
                  )}
                </button>

                {/* 타임라인 연결선 + 점 */}
                <div className="flex items-center pt-2 sm:pt-3">
                  <div
                    className={cn(
                      'w-2 sm:w-3 h-2 sm:h-3 rounded-full border-2 z-10 shrink-0',
                      isCurrentYear
                        ? 'border-blue-500 bg-blue-500'
                        : isDecadeStart
                          ? 'border-blue-400 bg-blue-400'
                          : 'border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900',
                      isSelected && 'ring-2 ring-blue-300'
                    )}
                  />
                  {!isLast && (
                    <div className={cn(
                      'h-0.5 w-[92px] sm:w-[148px]',
                      'bg-neutral-200 dark:bg-neutral-700'
                    )} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function getMoodEmoji(avgMood: number): string {
  if (avgMood >= 4.5) return '😄';
  if (avgMood >= 3.5) return '🙂';
  if (avgMood >= 2.5) return '😐';
  if (avgMood >= 1.5) return '😔';
  return '😢';
}
