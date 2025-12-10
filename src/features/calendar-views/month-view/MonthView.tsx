'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { useAtomValue } from 'jotai';
import { useCalendar } from '@/shared/hooks/use-calendar';
import { cn } from '@/shared/lib/cn';
import { getMonthCalendarDays, isToday, isSameDay, isSameMonth, getDaysInMonth } from '@/shared/lib/date-utils';
import { entriesAtom, eventsAtom } from '@/shared/stores/entries';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
const START_YEAR = 1900;
const END_YEAR = 2100;

const MOOD_EMOJI: Record<number, string> = {
  1: '😢',
  2: '😔',
  3: '😐',
  4: '🙂',
  5: '😄',
};

interface MonthData {
  year: number;
  month: number;
  key: string;
  days: Date[];
  calendarDays: Date[];
}

function generateMonths(): MonthData[] {
  const months: MonthData[] = [];
  for (let year = START_YEAR; year <= END_YEAR; year++) {
    for (let month = 0; month < 12; month++) {
      const daysInMonth = getDaysInMonth(year, month);
      const days: Date[] = [];
      for (let day = 1; day <= daysInMonth; day++) {
        days.push(new Date(year, month, day));
      }
      months.push({
        year,
        month,
        key: `${year}-${String(month + 1).padStart(2, '0')}`,
        days,
        calendarDays: getMonthCalendarDays(year, month),
      });
    }
  }
  return months;
}

const ALL_MONTHS = generateMonths();

export function MonthView() {
  const { focusDate, goToDate, zoomIn } = useCalendar();
  const entries = useAtomValue(entriesAtom);
  const events = useAtomValue(eventsAtom);
  const scrollRef = useRef<HTMLDivElement>(null);
  const monthRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const isInitialMount = useRef(true);
  const [visibleMonth, setVisibleMonth] = useState(`${focusDate.getFullYear()}-${String(focusDate.getMonth() + 1).padStart(2, '0')}`);

  const currentMonthIdx = ALL_MONTHS.findIndex(
    (m) => m.year === focusDate.getFullYear() && m.month === focusDate.getMonth()
  );

  const handleDayClick = (date: Date) => {
    goToDate(date);
    zoomIn();
  };

  const getDateKey = (date: Date) => date.toISOString().split('T')[0];

  const getEventsForDate = (date: Date) => {
    const dateStr = getDateKey(date);
    return events.filter((e) => e.startDate === dateStr);
  };

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;

    const container = scrollRef.current;
    let closestMonth = visibleMonth;
    let closestDistance = Infinity;

    monthRefs.current.forEach((el, key) => {
      const rect = el.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const elementTop = rect.top - containerRect.top;

      if (elementTop >= -rect.height / 2 && elementTop < closestDistance) {
        closestDistance = elementTop;
        closestMonth = key;
      }
    });

    if (closestMonth !== visibleMonth) {
      setVisibleMonth(closestMonth);
    }
  }, [visibleMonth]);

  const scrollToFocusMonth = useCallback((smooth = true) => {
    const targetKey = `${focusDate.getFullYear()}-${String(focusDate.getMonth() + 1).padStart(2, '0')}`;
    const targetEl = monthRefs.current.get(targetKey);
    if (targetEl) {
      targetEl.scrollIntoView({ block: 'start', behavior: smooth ? 'smooth' : 'instant' });
    }
  }, [focusDate]);

  useEffect(() => {
    if (isInitialMount.current) {
      scrollToFocusMonth(false);
      isInitialMount.current = false;
    } else {
      scrollToFocusMonth(true);
    }
  }, [scrollToFocusMonth]);

  const setMonthRef = useCallback((key: string) => (el: HTMLDivElement | null) => {
    if (el) {
      monthRefs.current.set(key, el);
    }
  }, []);

  const displayMonths = ALL_MONTHS.slice(
    Math.max(0, currentMonthIdx - 24),
    Math.min(ALL_MONTHS.length, currentMonthIdx + 24)
  );

  return (
    <div className="h-full flex flex-col">
      {/* 현재 보이는 월 표시 */}
      <div className="px-3 sm:px-4 py-1.5 sm:py-2 border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm">
        <div className="text-base sm:text-lg font-semibold">
          {visibleMonth.replace('-', '년 ')}월
        </div>
      </div>

      {/* 세로 스크롤 영역 */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto scroll-smooth touch-pan-y"
      >
        {displayMonths.map((monthData) => {
          const { year, month, key, days, calendarDays } = monthData;
          const isCurrentMonth = year === new Date().getFullYear() && month === new Date().getMonth();

          return (
            <div
              key={key}
              ref={setMonthRef(key)}
              className="border-b-4 border-neutral-100 dark:border-neutral-800"
            >
              {/* 월 헤더 */}
              <div
                className={cn(
                  'sticky top-0 z-10 px-3 sm:px-4 py-2 sm:py-3 bg-white dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800',
                  isCurrentMonth && 'bg-blue-50 dark:bg-blue-900/20'
                )}
              >
                <span className={cn('text-base sm:text-lg font-bold', isCurrentMonth && 'text-blue-600')}>
                  {year}년 {month + 1}월
                </span>
              </div>

              {/* 그리드 캘린더 */}
              <div className="p-2 sm:p-4 bg-white dark:bg-neutral-950">
                <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-1 sm:mb-2">
                  {WEEKDAYS.map((day, idx) => (
                    <div
                      key={day}
                      className={cn(
                        'text-center text-[10px] sm:text-xs font-medium py-0.5 sm:py-1',
                        idx === 0 && 'text-red-500',
                        idx === 6 && 'text-blue-500'
                      )}
                    >
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
                  {calendarDays.map((date, idx) => {
                    const isThisMonth = isSameMonth(date, new Date(year, month, 1));
                    const isTodayDate = isToday(date);
                    const isSelected = isSameDay(date, focusDate);
                    const dayOfWeek = date.getDay();
                    const dateKey = getDateKey(date);
                    const entry = entries[dateKey];
                    const dayEvents = getEventsForDate(date);

                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          goToDate(date);
                        }}
                        className={cn(
                          'aspect-square flex items-center justify-center rounded-md sm:rounded-lg text-xs sm:text-sm transition-colors relative',
                          'hover:bg-neutral-100 dark:hover:bg-neutral-800',
                          'active:scale-95',
                          !isThisMonth && 'text-neutral-300 dark:text-neutral-700',
                          isThisMonth && dayOfWeek === 0 && 'text-red-500',
                          isThisMonth && dayOfWeek === 6 && 'text-blue-500',
                          isTodayDate && 'bg-blue-500 text-white hover:bg-blue-600',
                          isSelected && !isTodayDate && 'bg-blue-100 dark:bg-blue-900/40'
                        )}
                      >
                        {date.getDate()}
                        {isThisMonth && (entry || dayEvents.length > 0) && (
                          <div className="absolute bottom-0.5 sm:bottom-1 w-1 h-1 rounded-full bg-blue-400" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 날짜별 상세 리스트 */}
              <div className="bg-neutral-50 dark:bg-neutral-900">
                {days.map((date) => {
                  const isTodayDate = isToday(date);
                  const isSelected = isSameDay(date, focusDate);
                  const dayOfWeek = date.getDay();
                  const dateKey = getDateKey(date);
                  const entry = entries[dateKey];
                  const dayEvents = getEventsForDate(date);
                  const hasContent = entry || dayEvents.length > 0;

                  if (!hasContent) return null;

                  return (
                    <button
                      key={dateKey}
                      onClick={() => handleDayClick(date)}
                      className={cn(
                        'w-full flex items-start gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 border-b border-neutral-100 dark:border-neutral-800 text-left transition-colors',
                        'hover:bg-white dark:hover:bg-neutral-800',
                        'active:bg-neutral-100 dark:active:bg-neutral-700',
                        isSelected && 'bg-blue-50 dark:bg-blue-900/20'
                      )}
                    >
                      {/* 날짜 */}
                      <div className="w-8 sm:w-10 shrink-0 text-center">
                        <div
                          className={cn(
                            'text-[9px] sm:text-[10px]',
                            dayOfWeek === 0 ? 'text-red-400' : dayOfWeek === 6 ? 'text-blue-400' : 'text-neutral-400'
                          )}
                        >
                          {WEEKDAYS[dayOfWeek]}
                        </div>
                        <div
                          className={cn(
                            'text-base sm:text-lg font-bold',
                            dayOfWeek === 0 && 'text-red-500',
                            dayOfWeek === 6 && 'text-blue-500',
                            isTodayDate && 'w-6 h-6 sm:w-7 sm:h-7 mx-auto rounded-full bg-blue-500 text-white flex items-center justify-center text-xs sm:text-sm'
                          )}
                        >
                          {date.getDate()}
                        </div>
                      </div>

                      {/* 콘텐츠 */}
                      <div className="flex-1 min-w-0">
                        {dayEvents.map((event) => (
                          <div
                            key={event.id}
                            className="flex items-center gap-1.5 sm:gap-2 mb-1 p-1 sm:p-1.5 rounded"
                            style={{ backgroundColor: `${event.color}15` }}
                          >
                            <div
                              className="w-0.5 h-3 sm:h-4 rounded-full shrink-0"
                              style={{ backgroundColor: event.color }}
                            />
                            <span className="text-xs sm:text-sm font-medium truncate">{event.title}</span>
                          </div>
                        ))}
                        {entry && (
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            {entry.moodScore && (
                              <span className="text-sm sm:text-base">{MOOD_EMOJI[entry.moodScore]}</span>
                            )}
                            {entry.summaryText && (
                              <span className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 truncate">
                                {entry.summaryText}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
