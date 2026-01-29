'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { motion } from 'framer-motion';
import { useCalendar } from '@/shared/hooks/use-calendar';
import { MOOD_EMOJI } from '@/shared/constants/mood';
import { cn } from '@/shared/lib/cn';
import { getMonthCalendarDays, isToday, isSameDay, isSameMonth, getDaysInMonth } from '@/shared/lib/date-utils';
import { entriesAtom, eventsAtom, selectedDateAtom } from '@/shared/stores/entries';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
const START_YEAR = 1900;
const END_YEAR = 2100;

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

const buttonTransition = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 25,
};

export function MonthView() {
  const { focusDate } = useCalendar();
  const entries = useAtomValue(entriesAtom);
  const events = useAtomValue(eventsAtom);
  const setSelectedDate = useSetAtom(selectedDateAtom);
  const scrollRef = useRef<HTMLDivElement>(null);
  const monthRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const isInitialMount = useRef(true);
  const [visibleMonth, setVisibleMonth] = useState(`${focusDate.getFullYear()}-${String(focusDate.getMonth() + 1).padStart(2, '0')}`);

  const currentMonthIdx = ALL_MONTHS.findIndex(
    (m) => m.year === focusDate.getFullYear() && m.month === focusDate.getMonth()
  );

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
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
      <div
        className={cn(
          'px-3 sm:px-4 py-2 sm:py-2.5',
          'border-b border-border-subtle',
          'bg-bg-primary/80 backdrop-blur-xl',
        )}
      >
        <div className="text-base sm:text-lg font-semibold text-text-primary">
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
              className="border-b-4 border-border-subtle"
            >
              {/* 월 헤더 */}
              <div
                className={cn(
                  'sticky top-0 z-10',
                  'px-3 sm:px-4 py-2 sm:py-3',
                  'bg-bg-primary border-b border-border-subtle',
                  isCurrentMonth && 'bg-accent-subtle',
                )}
              >
                <span
                  className={cn(
                    'text-base sm:text-lg font-bold',
                    isCurrentMonth ? 'text-accent' : 'text-text-primary',
                  )}
                >
                  {year}년 {month + 1}월
                </span>
              </div>

              {/* 그리드 캘린더 */}
              <div className="p-2 sm:p-4 bg-bg-primary">
                <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-1 sm:mb-2">
                  {WEEKDAYS.map((day, idx) => (
                    <div
                      key={day}
                      className={cn(
                        'text-center text-[10px] sm:text-xs font-medium py-0.5 sm:py-1',
                        idx === 0 && 'text-sunday',
                        idx === 6 && 'text-saturday',
                        idx !== 0 && idx !== 6 && 'text-text-tertiary',
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
                      <motion.button
                        key={idx}
                        onClick={() => handleDayClick(date)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={buttonTransition}
                        className={cn(
                          'aspect-square flex items-center justify-center',
                          'rounded-lg text-xs sm:text-sm',
                          'transition-colors duration-fast relative',
                          'hover:bg-bg-secondary',
                          !isThisMonth && 'text-text-tertiary opacity-40',
                          isThisMonth && dayOfWeek === 0 && 'text-sunday',
                          isThisMonth && dayOfWeek === 6 && 'text-saturday',
                          isTodayDate && 'bg-accent text-text-inverse hover:bg-accent-hover shadow-sm',
                          isSelected && !isTodayDate && 'bg-accent-subtle border border-accent/30',
                        )}
                      >
                        {date.getDate()}
                        {isThisMonth && (entry || dayEvents.length > 0) && !isTodayDate && (
                          <div className="absolute bottom-0.5 sm:bottom-1 w-1 h-1 rounded-full bg-accent" />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* 날짜별 상세 리스트 */}
              <div className="bg-bg-secondary">
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
                    <motion.button
                      key={dateKey}
                      onClick={() => handleDayClick(date)}
                      whileTap={{ scale: 0.99 }}
                      className={cn(
                        'w-full flex items-start gap-2 sm:gap-3',
                        'px-3 sm:px-4 py-2.5 sm:py-3',
                        'border-b border-border-subtle',
                        'text-left transition-colors duration-fast',
                        'hover:bg-bg-elevated',
                        'active:bg-bg-tertiary',
                        isSelected && 'bg-accent-subtle',
                      )}
                    >
                      {/* 날짜 */}
                      <div className="w-8 sm:w-10 shrink-0 text-center">
                        <div
                          className={cn(
                            'text-[9px] sm:text-[10px]',
                            dayOfWeek === 0
                              ? 'text-sunday/70'
                              : dayOfWeek === 6
                                ? 'text-saturday/70'
                                : 'text-text-tertiary',
                          )}
                        >
                          {WEEKDAYS[dayOfWeek]}
                        </div>
                        <div
                          className={cn(
                            'text-base sm:text-lg font-bold',
                            dayOfWeek === 0 && 'text-sunday',
                            dayOfWeek === 6 && 'text-saturday',
                            dayOfWeek !== 0 && dayOfWeek !== 6 && 'text-text-primary',
                            isTodayDate &&
                              'w-6 h-6 sm:w-7 sm:h-7 mx-auto rounded-full bg-accent text-text-inverse flex items-center justify-center text-xs sm:text-sm',
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
                            className="flex items-center gap-1.5 sm:gap-2 mb-1 p-1.5 sm:p-2 rounded-md"
                            style={{ backgroundColor: `${event.color}15` }}
                          >
                            <div
                              className="w-0.5 h-3.5 sm:h-4 rounded-full shrink-0"
                              style={{ backgroundColor: event.color }}
                            />
                            <span className="text-xs sm:text-sm font-medium truncate text-text-primary">
                              {event.title}
                            </span>
                          </div>
                        ))}
                        {entry && (
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            {entry.moodScore && (
                              <span className="text-sm sm:text-base">{MOOD_EMOJI[entry.moodScore]}</span>
                            )}
                            {entry.summaryText && (
                              <span className="text-xs sm:text-sm text-text-secondary truncate">
                                {entry.summaryText}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.button>
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
