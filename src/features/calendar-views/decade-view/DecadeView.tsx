'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { useAtomValue } from 'jotai';
import { motion } from 'framer-motion';
import { useCalendar } from '@/shared/hooks/use-calendar';
import { cn } from '@/shared/lib/cn';
import { entriesByYearAtom, eventsByYearAtom, getYearStats } from '@/shared/stores/entries';

const START_YEAR = 1900;
const END_YEAR = 2100;
const CARD_WIDTH_MOBILE = 100;
const CARD_WIDTH_DESKTOP = 160;
const YEARS = Array.from({ length: END_YEAR - START_YEAR + 1 }, (_, i) => START_YEAR + i);

const buttonTransition = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 25,
};

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
              marginLeft: `${((visibleRange.start - startYear) / (endYear - startYear)) * 100}%`,
              width: `${((visibleRange.end - visibleRange.start + 1) / (endYear - startYear + 1)) * 100}%`,
            }}
          />
        </div>
        <div className="hidden sm:flex justify-between text-xs text-text-tertiary mt-1">
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
              <div key={year} className="flex flex-col h-full snap-center">
                {/* 콘텐츠 카드 */}
                <motion.button
                  onClick={() => handleYearClick(year)}
                  whileHover={!isFuture ? { y: -4 } : undefined}
                  whileTap={!isFuture ? { scale: 0.98 } : undefined}
                  transition={buttonTransition}
                  className={cn(
                    'flex-1 w-[100px] sm:w-40',
                    'p-2 sm:p-3',
                    'rounded-2xl border',
                    'transition-all duration-normal text-left flex flex-col',
                    'bg-bg-elevated',
                    'border-border-subtle',
                    'hover:border-accent/50 hover:shadow-lg',
                    isSelected && 'bg-accent-subtle border-accent shadow-lg -translate-y-1',
                    isFuture && 'opacity-40',
                    isDecadeStart && 'border-l-2 border-l-accent',
                  )}
                >
                  {/* 연도 헤더 */}
                  <div className="flex items-center justify-between mb-1 sm:mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'text-lg sm:text-xl font-bold',
                          isCurrentYear ? 'text-accent' : 'text-text-primary',
                          isFuture && 'text-text-tertiary',
                        )}
                      >
                        {year}
                      </span>
                      {/* PC: 도트 그리드 */}
                      {(() => {
                        const monthlyActivity = getMonthlyActivity(yearEntries);
                        const hasAnyActivity = monthlyActivity.some(Boolean);
                        if (!hasAnyActivity || isFuture) return null;
                        return (
                          <div className="hidden sm:grid grid-cols-6 gap-0.5">
                            {monthlyActivity.map((active, idx) => (
                              <div
                                key={idx}
                                className={cn(
                                  'w-1.5 h-1.5 rounded-full',
                                  active ? 'bg-accent' : 'bg-bg-tertiary',
                                )}
                              />
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                    {avgMood > 0 && (
                      <span className="text-sm sm:text-base">{getMoodEmoji(avgMood)}</span>
                    )}
                  </div>

                  {/* 이벤트 목록 - 모바일에서 숨김 */}
                  <div className="hidden sm:block flex-1 space-y-1 mb-2 overflow-y-auto">
                    {yearEvents.map((event) => (
                      <div key={event.id} className="flex items-center gap-1.5">
                        <div
                          className="w-1 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: event.color }}
                        />
                        <span className="text-xs truncate text-text-secondary">{event.title}</span>
                      </div>
                    ))}
                    {!yearEvents.length && !isFuture && count === 0 && (
                      <div className="text-xs text-text-tertiary">기록 없음</div>
                    )}
                    {isFuture && <div className="text-xs text-text-tertiary">미래</div>}
                  </div>

                  {/* 모바일: 도트 그리드 */}
                  <div className="sm:hidden flex-1 flex items-center justify-center">
                    {(() => {
                      const monthlyActivity = getMonthlyActivity(yearEntries);
                      const hasAnyActivity = monthlyActivity.some(Boolean);

                      if (isFuture) {
                        return <span className="text-xs text-text-tertiary">미래</span>;
                      }

                      if (!hasAnyActivity) {
                        return <span className="text-xs text-text-tertiary">-</span>;
                      }

                      return (
                        <div className="grid grid-cols-6 gap-1">
                          {monthlyActivity.map((active, idx) => (
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
                      <div className="hidden sm:block text-xs text-text-secondary mb-1">{count}개</div>
                      <div className="h-1 sm:h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-linear-to-r from-accent to-accent-hover rounded-full transition-all"
                          style={{ width: `${barHeight}%` }}
                        />
                      </div>
                    </div>
                  )}
                </motion.button>

                {/* 타임라인 연결선 + 점 */}
                <div className="flex items-center pt-2 sm:pt-3">
                  <div
                    className={cn(
                      'w-2 sm:w-3 h-2 sm:h-3 rounded-full border-2 z-10 shrink-0',
                      isCurrentYear
                        ? 'border-accent bg-accent'
                        : isDecadeStart
                          ? 'border-accent/70 bg-accent/70'
                          : 'border-border-strong bg-bg-primary',
                      isSelected && 'ring-2 ring-accent/30',
                    )}
                  />
                  {!isLast && (
                    <div className="h-0.5 w-[92px] sm:w-[148px] bg-border-default" />
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

function getMonthlyActivity(entries: { date: string }[]): boolean[] {
  const months = Array(12).fill(false);
  entries.forEach((entry) => {
    const month = new Date(entry.date).getMonth();
    months[month] = true;
  });
  return months;
}
