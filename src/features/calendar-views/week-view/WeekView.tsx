'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { motion } from 'framer-motion';
import { useCalendar } from '@/shared/hooks/use-calendar';
import { cn } from '@/shared/lib/cn';
import { getWeekRange, isToday, isSameDay, formatDate } from '@/shared/lib/date-utils';
import { entriesAtom, eventsAtom, selectedDateAtom } from '@/shared/stores/entries';

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

function getWeekActivity(
  days: Date[],
  entries: Record<string, unknown>,
): boolean[] {
  return days.map((date) => {
    const key = date.toISOString().split('T')[0];
    return Boolean(entries[key]);
  });
}

function getWeekOfMonth(date: Date): { month: number; weekNum: number } {
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const firstSunday = new Date(firstDayOfMonth);
  firstSunday.setDate(firstSunday.getDate() - firstSunday.getDay());

  const diffTime = date.getTime() - firstSunday.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const weekNum = Math.floor(diffDays / 7) + 1;

  return { month: date.getMonth() + 1, weekNum };
}

interface WeekData {
  startDate: Date;
  days: Date[];
  key: string;
  label: string;
}

function generateAllWeeks(): WeekData[] {
  const weeks: WeekData[] = [];
  const startDate = new Date(START_YEAR, 0, 1);
  const endDate = new Date(END_YEAR, 11, 31);

  const firstSunday = new Date(startDate);
  firstSunday.setDate(firstSunday.getDate() - firstSunday.getDay());

  const current = new Date(firstSunday);
  while (current <= endDate) {
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(current);
      d.setDate(d.getDate() + i);
      days.push(d);
    }

    weeks.push({
      startDate: new Date(current),
      days,
      key: formatDate(current, 'YYYY-MM-DD'),
      label: `${formatDate(days[0], 'MM.DD')} - ${formatDate(days[6], 'MM.DD')}`,
    });

    current.setDate(current.getDate() + 7);
  }

  return weeks;
}

const ALL_WEEKS = generateAllWeeks();

const buttonTransition = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 25,
};

export function WeekView() {
  const { focusDate } = useCalendar();
  const entries = useAtomValue(entriesAtom);
  const events = useAtomValue(eventsAtom);
  const setSelectedDate = useSetAtom(selectedDateAtom);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);
  const [, setVisibleRange] = useState('');

  const { start: currentWeekStart } = getWeekRange(focusDate);
  const currentWeekKey = formatDate(currentWeekStart, 'YYYY-MM-DD');
  const currentWeekIdx = ALL_WEEKS.findIndex((w) => w.key === currentWeekKey);

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
    const { scrollLeft, clientWidth } = scrollRef.current;
    const weekWidth = 520;
    const centerIdx = Math.floor((scrollLeft + clientWidth / 2) / weekWidth);
    const displayWeeks = ALL_WEEKS.slice(
      Math.max(0, currentWeekIdx - 52),
      Math.min(ALL_WEEKS.length, currentWeekIdx + 52)
    );

    const week = displayWeeks[centerIdx];
    if (week) {
      setVisibleRange(`${formatDate(week.days[0], 'YYYY.MM.DD')} - ${formatDate(week.days[6], 'MM.DD')}`);
    }
  }, [currentWeekIdx]);

  const scrollToCurrentWeek = useCallback((smooth = true) => {
    const el = scrollRef.current;
    if (!el) return;

    const weekWidth = 520;
    const centerIdx = 52;
    const scrollPos = centerIdx * weekWidth - el.clientWidth / 2 + weekWidth / 2;
    el.scrollTo({ left: Math.max(0, scrollPos), behavior: smooth ? 'smooth' : 'instant' });
  }, []);

  useEffect(() => {
    if (isInitialMount.current) {
      scrollToCurrentWeek(false);
      isInitialMount.current = false;
    } else {
      scrollToCurrentWeek(true);
    }
  }, [currentWeekIdx, scrollToCurrentWeek]);

  const displayWeeks = ALL_WEEKS.slice(
    Math.max(0, currentWeekIdx - 52),
    Math.min(ALL_WEEKS.length, currentWeekIdx + 52)
  );

  return (
    <div className="h-full flex flex-col">
      {/* 가로 스크롤 영역 */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-x-auto overflow-y-hidden"
      >
        <div className="h-full min-w-max flex items-stretch px-4 py-4 gap-4">
          {displayWeeks.map((week) => {
            const isCurrentWeek = week.key === currentWeekKey;
            const weekYear = week.days[0].getFullYear();
            const isYearStart = week.days.some((d) => d.getMonth() === 0 && d.getDate() <= 7);
            const midWeekDate = week.days[3];
            const { month, weekNum } = getWeekOfMonth(midWeekDate);

            return (
              <motion.div
                key={week.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  'flex flex-col h-full w-[500px] shrink-0',
                  'rounded-2xl border p-4',
                  'bg-bg-elevated',
                  'border-border-subtle',
                  'shadow-xs',
                  'transition-all duration-normal',
                  isCurrentWeek && 'ring-2 ring-accent bg-accent-subtle shadow-md',
                  isYearStart && 'border-l-4 border-l-accent',
                )}
              >
                {/* 주 헤더 */}
                <div
                  className={cn(
                    'flex items-center justify-between mb-3 pb-2',
                    'border-b border-border-subtle',
                  )}
                >
                  <div className="flex items-center gap-2">
                    {isYearStart && (
                      <span className="text-xs font-bold text-accent">{weekYear}년</span>
                    )}
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-text-primary">{month}월 {weekNum}째주</span>
                      <span className="text-xs text-text-tertiary">{week.label}</span>
                    </div>
                    {/* 활동 도트 */}
                    <div className="flex gap-1 ml-2">
                      {getWeekActivity(week.days, entries).map((active, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            'w-1.5 h-1.5 rounded-full transition-colors',
                            active ? 'bg-accent' : 'bg-bg-tertiary',
                          )}
                        />
                      ))}
                    </div>
                  </div>
                  {isCurrentWeek && (
                    <span
                      className={cn(
                        'text-xs px-2.5 py-1',
                        'bg-accent text-text-inverse',
                        'rounded-full font-medium',
                      )}
                    >
                      이번 주
                    </span>
                  )}
                </div>

                {/* 7일 그리드 */}
                <div className="flex-1 grid grid-cols-7 gap-1.5">
                  {week.days.map((date, dayIdx) => {
                    const isTodayDate = isToday(date);
                    const isSelected = isSameDay(date, focusDate);
                    const dateKey = getDateKey(date);
                    const entry = entries[dateKey];
                    const dayEvents = getEventsForDate(date);

                    return (
                      <motion.button
                        key={dayIdx}
                        onClick={() => handleDayClick(date)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        transition={buttonTransition}
                        className={cn(
                          'flex flex-col p-2 rounded-xl border',
                          'transition-all duration-fast text-left h-full',
                          'hover:border-accent/50 hover:shadow-sm',
                          'border-border-subtle',
                          'bg-bg-primary',
                          dayIdx === 0 && 'text-sunday',
                          dayIdx === 6 && 'text-saturday',
                          isTodayDate && 'ring-2 ring-accent bg-accent-subtle',
                          isSelected && !isTodayDate && 'bg-accent-subtle border-accent/30',
                        )}
                      >
                        {/* 요일 + 날짜 */}
                        <div className="text-center mb-1">
                          <div className="text-[10px] text-text-tertiary">{WEEKDAYS[dayIdx]}</div>
                          <div
                            className={cn(
                              'text-lg font-bold',
                              isTodayDate &&
                                'w-7 h-7 mx-auto rounded-full bg-accent text-text-inverse flex items-center justify-center text-sm',
                            )}
                          >
                            {date.getDate()}
                          </div>
                        </div>

                        {/* 무드 */}
                        {entry?.moodScore && (
                          <div className="text-center text-sm mb-1">{MOOD_EMOJI[entry.moodScore]}</div>
                        )}

                        {/* 이벤트 */}
                        <div className="flex-1 space-y-0.5 overflow-hidden">
                          {dayEvents.slice(0, 2).map((event) => (
                            <div key={event.id} className="flex items-center gap-1">
                              <div
                                className="w-1 h-2 rounded-full shrink-0"
                                style={{ backgroundColor: event.color }}
                              />
                              <span className="text-[9px] truncate text-text-secondary">
                                {event.title}
                              </span>
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <div className="text-[9px] text-text-tertiary">+{dayEvents.length - 2}</div>
                          )}
                        </div>

                        {/* 기록 표시 */}
                        {entry && !entry.moodScore && (
                          <div className="text-center">
                            <div className="w-1.5 h-1.5 mx-auto rounded-full bg-accent" />
                          </div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
