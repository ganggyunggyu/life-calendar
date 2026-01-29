'use client';

import { useAtom, useAtomValue } from 'jotai';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { MOOD_OPTIONS, type MoodScore } from '@/shared/constants/mood';
import { cn } from '@/shared/lib/cn';
import { isToday } from '@/shared/lib/date-utils';
import { selectedDateAtom, entriesAtom, eventsAtom } from '@/shared/stores/entries';
import { Button, Input } from '@/shared/ui';
import type { DayEntry, TimelineEvent } from '@/shared/types/calendar';

const WEEKDAY_NAMES = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

const springTransition = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 35,
};

const moodColors: Record<MoodScore, string> = {
  1: 'var(--mood-1)',
  2: 'var(--mood-2)',
  3: 'var(--mood-3)',
  4: 'var(--mood-4)',
  5: 'var(--mood-5)',
};

interface EntryFormContentProps {
  selectedDate: Date;
  entry: DayEntry | undefined;
  dayEvents: TimelineEvent[];
  onSave: (data: { moodScore?: MoodScore; summaryText: string; noteContent: string }) => void;
  onClose: () => void;
}

function EntryFormContent({
  selectedDate,
  entry,
  dayEvents,
  onSave,
  onClose,
}: EntryFormContentProps) {
  const [moodScore, setMoodScore] = useState<MoodScore | undefined>(entry?.moodScore);
  const [summaryText, setSummaryText] = useState(entry?.summaryText || '');
  const [noteContent, setNoteContent] = useState(entry?.blocks?.[0]?.content || '');

  const isTodayDate = isToday(selectedDate);
  const dayOfWeek = selectedDate.getDay();

  const handleSave = () => {
    onSave({ moodScore, summaryText, noteContent });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: 20 }}
      transition={springTransition}
      className={cn(
        'fixed z-50',
        'inset-x-4 top-[8%] bottom-[8%]',
        'sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2',
        'sm:w-full sm:max-w-lg sm:top-[10%] sm:bottom-auto sm:max-h-[80vh]',
        'bg-bg-elevated',
        'rounded-2xl',
        'shadow-elevated',
        'flex flex-col overflow-hidden',
      )}
    >
      {/* 헤더 */}
      <div
        className={cn(
          'px-5 py-4',
          'border-b border-border-subtle',
          'bg-bg-secondary/50',
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'text-3xl font-bold',
                dayOfWeek === 0 && 'text-sunday',
                dayOfWeek === 6 && 'text-saturday',
                dayOfWeek !== 0 && dayOfWeek !== 6 && 'text-text-primary',
              )}
            >
              {selectedDate.getDate()}
            </div>
            <div>
              <div className="text-sm text-text-secondary">
                {selectedDate.getFullYear()}년 {selectedDate.getMonth() + 1}월
              </div>
              <div className="font-medium text-text-primary">{WEEKDAY_NAMES[dayOfWeek]}</div>
            </div>
            {isTodayDate && (
              <span
                className={cn(
                  'px-2.5 py-1',
                  'bg-accent text-text-inverse',
                  'text-xs font-medium rounded-full',
                )}
              >
                오늘
              </span>
            )}
          </div>
          <motion.button
            onClick={onClose}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={cn(
              'w-8 h-8',
              'flex items-center justify-center',
              'text-text-secondary',
              'hover:bg-bg-tertiary hover:text-text-primary',
              'rounded-lg transition-colors',
            )}
          >
            ✕
          </motion.button>
        </div>
      </div>

      {/* 본문 */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* 이벤트 */}
        {dayEvents.length > 0 && (
          <div>
            <div className="text-sm font-medium text-text-secondary mb-2">이벤트</div>
            <div className="space-y-2">
              {dayEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center gap-2 p-2.5 rounded-xl"
                  style={{ backgroundColor: `${event.color}15` }}
                >
                  <div
                    className="w-1 h-6 rounded-full"
                    style={{ backgroundColor: event.color }}
                  />
                  <span className="text-sm font-medium text-text-primary">{event.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 기분 선택 */}
        <div>
          <div className="text-sm font-medium text-text-secondary mb-3">오늘의 기분</div>
          <div className="flex gap-2">
            {MOOD_OPTIONS.map((mood) => (
              <motion.button
                key={mood.score}
                onClick={() => setMoodScore(mood.score)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={springTransition}
                className={cn(
                  'flex-1 py-3',
                  'rounded-xl text-xl',
                  'transition-all duration-fast',
                  moodScore === mood.score
                    ? 'shadow-md scale-105'
                    : 'bg-bg-tertiary hover:bg-border-default',
                )}
                style={
                  moodScore === mood.score
                    ? { backgroundColor: `${moodColors[mood.score]}20` }
                    : undefined
                }
                title={mood.label}
              >
                {mood.emoji}
              </motion.button>
            ))}
          </div>
        </div>

        {/* 한 줄 요약 */}
        <Input
          label="한 줄 요약"
          value={summaryText}
          onChange={(e) => setSummaryText(e.target.value)}
          placeholder="오늘 하루를 한 줄로 요약해보세요"
        />

        {/* 메모 */}
        <Input
          label="메모"
          multiline
          rows={5}
          value={noteContent}
          onChange={(e) => setNoteContent(e.target.value)}
          placeholder="오늘 있었던 일을 기록해보세요..."
        />
      </div>

      {/* 푸터 */}
      <div
        className={cn(
          'px-5 py-4',
          'border-t border-border-subtle',
          'flex gap-3',
          'bg-bg-secondary/30',
        )}
      >
        <Button variant="secondary" fullWidth onClick={onClose}>
          취소
        </Button>
        <Button variant="primary" fullWidth onClick={handleSave}>
          저장
        </Button>
      </div>
    </motion.div>
  );
}

export function EntryFormModal() {
  const [selectedDate, setSelectedDate] = useAtom(selectedDateAtom);
  const [entries, setEntries] = useAtom(entriesAtom);
  const events = useAtomValue(eventsAtom);

  if (!selectedDate) return null;

  const dateKey = selectedDate.toISOString().split('T')[0];
  const entry = entries[dateKey];
  const dayEvents = events.filter((e) => e.startDate === dateKey);

  const handleClose = () => {
    setSelectedDate(null);
  };

  const handleSave = (data: { moodScore?: MoodScore; summaryText: string; noteContent: string }) => {
    const newEntry: DayEntry = {
      date: dateKey,
      moodScore: data.moodScore,
      summaryText: data.summaryText || undefined,
      tags: entry?.tags || [],
      blocks: data.noteContent
        ? [{ id: '1', type: 'note', content: data.noteContent }]
        : [],
    };

    setEntries((prev) => ({
      ...prev,
      [dateKey]: newEntry,
    }));

    handleClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={handleClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
      />
      <EntryFormContent
        key={dateKey}
        selectedDate={selectedDate}
        entry={entry}
        dayEvents={dayEvents}
        onSave={handleSave}
        onClose={handleClose}
      />
    </AnimatePresence>
  );
}
