'use client';

import { useAtomValue } from 'jotai';
import { useCalendar } from '@/shared/hooks/use-calendar';
import { isToday } from '@/shared/lib/date-utils';
import { cn } from '@/shared/lib/cn';
import { entriesAtom, eventsAtom } from '@/shared/stores/entries';

const WEEKDAY_NAMES = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

const MOOD_EMOJI: Record<number, string> = {
  1: '😢',
  2: '😔',
  3: '😐',
  4: '🙂',
  5: '😄',
};

const MOOD_LABELS: Record<number, string> = {
  1: '매우 나쁨',
  2: '나쁨',
  3: '보통',
  4: '좋음',
  5: '매우 좋음',
};

export function DayView() {
  const { focusDate, navigatePrev, navigateNext } = useCalendar();
  const entries = useAtomValue(entriesAtom);
  const events = useAtomValue(eventsAtom);

  const isTodayDate = isToday(focusDate);
  const dayOfWeek = focusDate.getDay();
  const dateKey = focusDate.toISOString().split('T')[0];
  const entry = entries[dateKey];
  const dayEvents = events.filter((e) => e.startDate === dateKey);

  return (
    <div className="p-4 h-full flex flex-col max-w-2xl mx-auto">
      {/* 날짜 헤더 */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-4">
          <div className={cn(
            'text-6xl font-bold',
            dayOfWeek === 0 && 'text-red-500',
            dayOfWeek === 6 && 'text-blue-500'
          )}>
            {focusDate.getDate()}
          </div>
          {entry?.moodScore && (
            <div className="text-5xl">{MOOD_EMOJI[entry.moodScore]}</div>
          )}
        </div>
        <div className="text-lg text-neutral-600 dark:text-neutral-400">
          {WEEKDAY_NAMES[dayOfWeek]}
        </div>
        {isTodayDate && (
          <span className="inline-block mt-2 px-3 py-1 bg-blue-500 text-white text-sm rounded-full">
            오늘
          </span>
        )}
      </div>

      {/* 이벤트 */}
      {dayEvents.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-neutral-500 mb-2">이벤트</h3>
          <div className="space-y-2">
            {dayEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-neutral-200 dark:border-neutral-800"
              >
                <div
                  className="w-1 h-8 rounded-full"
                  style={{ backgroundColor: event.color }}
                />
                <div>
                  <div className="font-medium">{event.title}</div>
                  {event.description && (
                    <div className="text-sm text-neutral-500">{event.description}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 기존 기록 표시 */}
      {entry && (
        <div className="mb-4 space-y-3">
          {/* 무드 */}
          {entry.moodScore && (
            <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900">
              <div className="text-sm text-neutral-500 mb-1">오늘의 기분</div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{MOOD_EMOJI[entry.moodScore]}</span>
                <span className="font-medium">{MOOD_LABELS[entry.moodScore]}</span>
              </div>
            </div>
          )}

          {/* 요약 */}
          {entry.summaryText && (
            <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900">
              <div className="text-sm text-neutral-500 mb-1">한 줄 요약</div>
              <div className="font-medium">{entry.summaryText}</div>
            </div>
          )}

          {/* 태그 */}
          {entry.tags && entry.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {entry.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 메모 입력 영역 */}
      <div className="flex-1 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4">
        <textarea
          placeholder={entry ? "추가 메모를 작성해보세요..." : "오늘 하루를 기록해보세요..."}
          className="w-full h-full resize-none bg-transparent outline-none text-neutral-800 dark:text-neutral-200 placeholder:text-neutral-400"
          defaultValue={entry?.blocks?.[0]?.content || ''}
        />
      </div>

      {/* 네비게이션 */}
      <div className="flex justify-between mt-4">
        <button
          onClick={navigatePrev}
          className="px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
        >
          ← 어제
        </button>
        <button
          onClick={navigateNext}
          className="px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
        >
          내일 →
        </button>
      </div>
    </div>
  );
}
