'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { useAtomValue } from 'jotai';
import { motion } from 'framer-motion';
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

const buttonTransition = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 25,
};

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
      <div
        className={cn(
          'px-4 sm:px-6 py-2 sm:py-3',
          'border-b border-border-subtle',
          'bg-bg-primary/80 backdrop-blur-xl',
        )}
      >
        <div className="flex items-center justify-between">
          <div className="text-xs sm:text-sm text-text-tertiary">보이는 구간</div>
          <div className="font-semibold text-sm sm:text-base text-text-primary">
            {visibleRange.start} - {visibleRange.end}
          </div>
        </div>
        <div className="mt-2 h-1 bg-bg-tertiary rounded-full overflow-hidden">
          <div
            className="h-full bg-accent rounded-full transition-all"
            style={{
              marginLeft: `${(allMonths.findIndex((m) => m.label === visibleRange.start) / allMonths.length) * 100}%`,
              width: `${((allMonths.findIndex((m) => m.label === visibleRange.end) - allMonths.findIndex((m) => m.label === visibleRange.start) + 1) / allMonths.length) * 100}%`,
            }}
          />
        </div>
        <div className="hidden sm:flex justify-between text-xs text-text-tertiary mt-1">
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
            const monthEntries = entriesByMonth[key] || [];
            const monthEvents = eventsByMonth[key] || [];
            const { count, avgMood } = getMonthStats(monthEntries);
            const barHeight = maxEntries > 0 ? (count / maxEntries) * 100 : 0;

            const isFuture = year > today.getFullYear() ||
              (year === today.getFullYear() && month > today.getMonth());
            const isLast = idx === allMonths.length - 1;
            const isYearStart = month === 0;

            return (
              <div key={key} className="flex flex-col h-full snap-center">
                {/* 콘텐츠 카드 */}
                <motion.button
                  onClick={() => handleMonthClick(year, month)}
                  whileHover={!isFuture ? { y: -4 } : undefined}
                  whileTap={!isFuture ? { scale: 0.98 } : undefined}
                  transition={buttonTransition}
                  className={cn(
                    'flex-1 w-[72px] sm:w-[120px]',
                    'p-1.5 sm:p-2',
                    'rounded-xl border',
                    'transition-all duration-normal text-left flex flex-col',
                    'bg-bg-elevated',
                    'border-border-subtle',
                    'hover:border-accent/50 hover:shadow-md',
                    isSelected && 'bg-accent-subtle border-accent shadow-md -translate-y-1',
                    isFuture && 'opacity-40',
                    isYearStart && 'border-l-2 border-l-accent',
                  )}
                >
                  {/* 월 헤더 */}
                  <div className="flex items-center justify-between mb-0.5 sm:mb-1">
                    <div className="flex items-center gap-1.5">
                      <div>
                        {isYearStart && (
                          <div className="text-[10px] sm:text-xs font-bold text-accent">{year}</div>
                        )}
                        <span
                          className={cn(
                            'text-xs sm:text-sm font-bold',
                            isCurrentMonth ? 'text-accent' : 'text-text-primary',
                            isFuture && 'text-text-tertiary',
                          )}
                        >
                          {MONTHS[month]}
                        </span>
                      </div>
                      {/* PC: 요일별 도트 */}
                      {(() => {
                        const weekdayActivity = getWeekdayActivity(monthEntries);
                        const hasAnyActivity = weekdayActivity.some(Boolean);
                        if (!hasAnyActivity || isFuture) return null;
                        return (
                          <div className="hidden sm:flex gap-0.5">
                            {weekdayActivity.map((active, idx) => (
                              <div
                                key={idx}
                                className={cn(
                                  'w-1 h-1 rounded-full',
                                  active ? 'bg-accent' : 'bg-bg-tertiary',
                                )}
                              />
                            ))}
                          </div>
                        );
                      })()}
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
                        <span className="text-[10px] truncate text-text-secondary">{event.title}</span>
                      </div>
                    ))}
                    {monthEvents.length > 2 && (
                      <div className="text-[10px] text-text-tertiary">+{monthEvents.length - 2}</div>
                    )}
                  </div>

                  {/* 모바일: 요일별 도트 그리드 */}
                  <div className="sm:hidden flex-1 flex items-center justify-center">
                    {(() => {
                      const weekdayActivity = getWeekdayActivity(monthEntries);
                      const hasAnyActivity = weekdayActivity.some(Boolean);

                      if (isFuture) {
                        return <span className="text-[10px] text-text-tertiary">-</span>;
                      }

                      if (!hasAnyActivity) {
                        return <span className="text-[10px] text-text-tertiary">-</span>;
                      }

                      return (
                        <div className="flex gap-0.5">
                          {weekdayActivity.map((active, idx) => (
                            <div
                              key={idx}
                              className={cn(
                                'w-2 h-2 rounded-full transition-colors',
                                active ? 'bg-accent' : 'bg-bg-tertiary',
                              )}
                            />
                          ))}
                        </div>
                      );
                    })()}
                  </div>

                  {/* 활동 바 */}
                  {count > 0 && (
                    <div>
                      <div className="hidden sm:block text-[10px] text-text-secondary">{count}개</div>
                      <div className="h-1 bg-bg-tertiary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-linear-to-r from-accent to-accent-hover rounded-full"
                          style={{ width: `${barHeight}%` }}
                        />
                      </div>
                    </div>
                  )}
                </motion.button>

                {/* 타임라인 점 */}
                <div className="flex items-center pt-1.5 sm:pt-2">
                  <div
                    className={cn(
                      'w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full border shrink-0',
                      isCurrentMonth
                        ? 'border-accent bg-accent'
                        : isYearStart
                          ? 'border-accent/70 bg-accent/70'
                          : 'border-border-strong bg-bg-primary',
                      isSelected && 'ring-2 ring-accent/30',
                    )}
                  />
                  {!isLast && (
                    <div className="h-px w-[66px] sm:w-[112px] bg-border-default" />
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

function getWeekdayActivity(entries: { date: string }[]): boolean[] {
  const weekdays = Array(7).fill(false);
  entries.forEach((entry) => {
    const day = new Date(entry.date).getDay();
    weekdays[day] = true;
  });
  return weekdays;
}
