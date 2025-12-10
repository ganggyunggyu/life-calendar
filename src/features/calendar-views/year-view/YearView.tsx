'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { useAtomValue } from 'jotai';
import { useCalendar } from '@/shared/hooks/use-calendar';
import { cn } from '@/shared/lib/cn';
import { getDaysInMonth } from '@/shared/lib/date-utils';
import { entriesByMonthAtom, eventsByMonthAtom, getMonthStats } from '@/shared/stores/entries';

const START_YEAR = 1900;
const END_YEAR = 2100;
const MONTHS = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
const CARD_WIDTH_MOBILE = 72;
const CARD_WIDTH_DESKTOP = 120;

interface MonthData {
  year: number;
  month: number;
  key: string;
  label: string;
}

function generateAllMonths(): MonthData[] {
  const months: MonthData[] = [];
  for (let year = START_YEAR; year <= END_YEAR; year++) {
    for (let month = 0; month < 12; month++) {
      months.push({
        year,
        month,
        key: `${year}-${String(month + 1).padStart(2, '0')}`,
        label: `${year}.${String(month + 1).padStart(2, '0')}`,
      });
    }
  }
  return months;
}

const ALL_MONTHS = generateAllMonths();

export function YearView() {
  const { focusDate, goToDate, zoomIn } = useCalendar();
  const currentYear = focusDate.getFullYear();
  const currentMonth = focusDate.getMonth();
  const today = new Date();
  const scrollRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);
  const [visibleRange, setVisibleRange] = useState({ start: `${currentYear}.01`, end: `${currentYear}.12` });

  const entriesByMonth = useAtomValue(entriesByMonthAtom);
  const eventsByMonth = useAtomValue(eventsByMonthAtom);

  const allMonths = ALL_MONTHS;

  const maxEntries = Math.max(
    ...Object.values(entriesByMonth).map((arr) => arr?.length || 0),
    1
  );

  const getCardWidth = () => {
    if (typeof window === 'undefined') return CARD_WIDTH_DESKTOP;
    return window.innerWidth < 640 ? CARD_WIDTH_MOBILE : CARD_WIDTH_DESKTOP;
  };

  const handleMonthClick = (year: number, month: number) => {
    goToDate(new Date(year, month, 1));
    zoomIn();
  };

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    const cardWidth = getCardWidth() + 8;
    const startIdx = Math.floor(scrollLeft / cardWidth);
    const endIdx = Math.floor((scrollLeft + clientWidth) / cardWidth);

    setVisibleRange({
      start: allMonths[Math.max(0, startIdx)]?.label || '',
      end: allMonths[Math.min(allMonths.length - 1, endIdx)]?.label || '',
    });
  };

  const scrollToMonth = useCallback((year: number, month: number, smooth = true) => {
    const el = scrollRef.current;
    if (!el) return;

    const cardWidth = getCardWidth() + 8;
    const monthIdx = ALL_MONTHS.findIndex((m) => m.year === year && m.month === month);
    if (monthIdx >= 0) {
      const scrollPos = monthIdx * cardWidth - el.clientWidth / 2 + cardWidth / 2;
      el.scrollTo({ left: Math.max(0, scrollPos), behavior: smooth ? 'smooth' : 'instant' });
    }
  }, []);

  useEffect(() => {
    if (isInitialMount.current) {
      scrollToMonth(currentYear, currentMonth, false);
      isInitialMount.current = false;
    } else {
      scrollToMonth(currentYear, currentMonth, true);
    }
  }, [currentYear, currentMonth, scrollToMonth]);

  return (
    <div className="h-full flex flex-col">
      {/* 현재 구간 표시 */}
      <div className="px-4 sm:px-6 py-2 sm:py-3 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center justify-between">
          <div className="text-xs sm:text-sm text-neutral-500">보이는 구간</div>
          <div className="font-semibold text-sm sm:text-base">{visibleRange.start} - {visibleRange.end}</div>
        </div>
        <div className="mt-2 h-1 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full transition-all"
            style={{
              marginLeft: `${(allMonths.findIndex((m) => m.label === visibleRange.start) / allMonths.length) * 100}%`,
              width: `${((allMonths.findIndex((m) => m.label === visibleRange.end) - allMonths.findIndex((m) => m.label === visibleRange.start) + 1) / allMonths.length) * 100}%`,
            }}
          />
        </div>
        <div className="hidden sm:flex justify-between text-xs text-neutral-400 mt-1">
          <span>{START_YEAR}</span>
          <span>{END_YEAR}</span>
        </div>
      </div>

      {/* 가로 스크롤 타임라인 */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-x-auto overflow-y-hidden scroll-smooth snap-x snap-mandatory touch-pan-x"
      >
        <div className="h-full min-w-max flex items-stretch px-4 sm:px-6 py-3 sm:py-4 gap-2">
          {allMonths.map((monthData, idx) => {
            const { year, month, key } = monthData;
            const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();
            const isSelected = year === currentYear && month === currentMonth;
            const daysCount = getDaysInMonth(year, month);
            const monthEntries = entriesByMonth[key] || [];
            const monthEvents = eventsByMonth[key] || [];
            const { count, avgMood } = getMonthStats(monthEntries);
            const barHeight = maxEntries > 0 ? (count / maxEntries) * 100 : 0;

            const isFuture = year > today.getFullYear() ||
              (year === today.getFullYear() && month > today.getMonth());
            const isLast = idx === allMonths.length - 1;
            const isYearStart = month === 0;

            return (
              <div
                key={key}
                className="flex flex-col h-full snap-center"
              >
                {/* 콘텐츠 카드 */}
                <button
                  onClick={() => handleMonthClick(year, month)}
                  className={cn(
                    'flex-1 w-[72px] sm:w-[120px] p-1.5 sm:p-2 rounded-lg border transition-all text-left flex flex-col',
                    'hover:border-green-400 hover:shadow-md hover:-translate-y-1',
                    'active:scale-95',
                    'border-neutral-200 dark:border-neutral-800',
                    isSelected && 'bg-green-50 dark:bg-green-900/20 border-green-400 -translate-y-1 shadow-md',
                    isFuture && 'opacity-40',
                    isYearStart && 'border-l-2 border-l-green-500'
                  )}
                >
                  {/* 월 헤더 */}
                  <div className="flex items-center justify-between mb-0.5 sm:mb-1">
                    <div>
                      {isYearStart && (
                        <div className="text-[10px] sm:text-xs font-bold text-green-600 dark:text-green-400">{year}</div>
                      )}
                      <span
                        className={cn(
                          'text-xs sm:text-sm font-bold',
                          isCurrentMonth && 'text-green-500',
                          isFuture && 'text-neutral-400'
                        )}
                      >
                        {MONTHS[month]}
                      </span>
                    </div>
                    {avgMood > 0 && (
                      <span className="text-xs sm:text-sm">{getMoodEmoji(avgMood)}</span>
                    )}
                  </div>

                  {/* 이벤트 - 모바일에서 숨김 */}
                  <div className="hidden sm:block flex-1 space-y-0.5 mb-1 overflow-y-auto">
                    {monthEvents.slice(0, 2).map((event) => (
                      <div key={event.id} className="flex items-center gap-1">
                        <div
                          className="w-1 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: event.color }}
                        />
                        <span className="text-[10px] truncate">{event.title}</span>
                      </div>
                    ))}
                    {monthEvents.length > 2 && (
                      <div className="text-[10px] text-neutral-400">+{monthEvents.length - 2}</div>
                    )}
                  </div>

                  {/* 모바일: 간단한 정보 */}
                  <div className="sm:hidden flex-1 flex items-center justify-center">
                    {count > 0 ? (
                      <span className="text-[10px] text-neutral-500">{count}</span>
                    ) : (
                      <span className="text-[10px] text-neutral-400">-</span>
                    )}
                  </div>

                  {/* 활동 바 */}
                  {count > 0 && (
                    <div>
                      <div className="hidden sm:block text-[10px] text-neutral-500">{count}개</div>
                      <div className="h-1 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-linear-to-r from-green-400 to-green-600 rounded-full"
                          style={{ width: `${barHeight}%` }}
                        />
                      </div>
                    </div>
                  )}
                </button>

                {/* 타임라인 점 */}
                <div className="flex items-center pt-1.5 sm:pt-2">
                  <div
                    className={cn(
                      'w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full border shrink-0',
                      isCurrentMonth
                        ? 'border-green-500 bg-green-500'
                        : isYearStart
                          ? 'border-green-400 bg-green-400'
                          : 'border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900',
                      isSelected && 'ring-2 ring-green-300'
                    )}
                  />
                  {!isLast && (
                    <div className="h-px w-[66px] sm:w-[112px] bg-neutral-200 dark:bg-neutral-700" />
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
