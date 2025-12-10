'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { useAtomValue } from 'jotai';
import { useCalendar } from '@/shared/hooks/use-calendar';
import { cn } from '@/shared/lib/cn';
import { getWeekRange, isToday, isSameDay, formatDate } from '@/shared/lib/date-utils';
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

  let current = new Date(firstSunday);
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

export function WeekView() {
  const { focusDate, goToDate, zoomIn } = useCalendar();
  const entries = useAtomValue(entriesAtom);
  const events = useAtomValue(eventsAtom);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);
  const [visibleRange, setVisibleRange] = useState('');

  const { start: currentWeekStart } = getWeekRange(focusDate);
  const currentWeekKey = formatDate(currentWeekStart, 'YYYY-MM-DD');
  const currentWeekIdx = ALL_WEEKS.findIndex((w) => w.key === currentWeekKey);

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
      {/* 현재 구간 표시 */}
      <div className="px-6 py-3 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center justify-between">
          <div className="text-sm text-neutral-500">보이는 주</div>
          <div className="font-semibold">{visibleRange}</div>
        </div>
      </div>

      {/* 가로 스크롤 영역 */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-x-auto overflow-y-hidden"
      >
        <div className="h-full min-w-max flex items-stretch px-4 py-4 gap-4">
          {displayWeeks.map((week, weekIdx) => {
            const isCurrentWeek = week.key === currentWeekKey;
            const weekYear = week.days[0].getFullYear();
            const isYearStart = week.days.some((d) => d.getMonth() === 0 && d.getDate() <= 7);

            return (
              <div
                key={week.key}
                className={cn(
                  'flex flex-col h-full w-[500px] shrink-0 rounded-xl border p-3',
                  'border-neutral-200 dark:border-neutral-800',
                  isCurrentWeek && 'ring-2 ring-purple-500 bg-purple-50/50 dark:bg-purple-900/10',
                  isYearStart && 'border-l-4 border-l-purple-500'
                )}
              >
                {/* 주 헤더 */}
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-neutral-100 dark:border-neutral-800">
                  <div>
                    {isYearStart && (
                      <span className="text-xs font-bold text-purple-600 mr-2">{weekYear}년</span>
                    )}
                    <span className="text-sm font-semibold">{week.label}</span>
                  </div>
                  {isCurrentWeek && (
                    <span className="text-xs px-2 py-0.5 bg-purple-500 text-white rounded-full">이번 주</span>
                  )}
                </div>

                {/* 7일 그리드 */}
                <div className="flex-1 grid grid-cols-7 gap-1">
                  {week.days.map((date, dayIdx) => {
                    const isTodayDate = isToday(date);
                    const isSelected = isSameDay(date, focusDate);
                    const dateKey = getDateKey(date);
                    const entry = entries[dateKey];
                    const dayEvents = getEventsForDate(date);

                    return (
                      <button
                        key={dayIdx}
                        onClick={() => handleDayClick(date)}
                        className={cn(
                          'flex flex-col p-2 rounded-lg border transition-all text-left h-full',
                          'hover:border-purple-400 hover:shadow-sm',
                          'border-neutral-100 dark:border-neutral-800',
                          dayIdx === 0 && 'text-red-500',
                          dayIdx === 6 && 'text-blue-500',
                          isTodayDate && 'ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-900/20',
                          isSelected && !isTodayDate && 'bg-purple-50 dark:bg-purple-900/20 border-purple-400'
                        )}
                      >
                        {/* 요일 + 날짜 */}
                        <div className="text-center mb-1">
                          <div className="text-[10px] text-neutral-400">{WEEKDAYS[dayIdx]}</div>
                          <div
                            className={cn(
                              'text-lg font-bold',
                              isTodayDate && 'w-7 h-7 mx-auto rounded-full bg-purple-500 text-white flex items-center justify-center text-sm'
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
                            <div
                              key={event.id}
                              className="flex items-center gap-1"
                            >
                              <div
                                className="w-1 h-2 rounded-full shrink-0"
                                style={{ backgroundColor: event.color }}
                              />
                              <span className="text-[9px] truncate">{event.title}</span>
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <div className="text-[9px] text-neutral-400">+{dayEvents.length - 2}</div>
                          )}
                        </div>

                        {/* 기록 표시 */}
                        {entry && !entry.moodScore && (
                          <div className="text-center">
                            <div className="w-1.5 h-1.5 mx-auto rounded-full bg-purple-400" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
