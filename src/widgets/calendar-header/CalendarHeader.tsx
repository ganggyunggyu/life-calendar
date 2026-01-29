'use client';

import { useSetAtom, useAtomValue } from 'jotai';
import { motion } from 'framer-motion';
import { useCalendar } from '@/shared/hooks/use-calendar';
import { useTheme } from '@/shared/hooks/use-theme';
import { cn } from '@/shared/lib/cn';
import { initializeDummyData } from '@/shared/lib/dummy-data';
import { SCALE_ORDER } from '@/shared/stores/calendar';
import { entriesAtom, eventsAtom } from '@/shared/stores/entries';
import type { CalendarScale } from '@/shared/types/calendar';
import type { Theme } from '@/shared/stores/theme';

const SCALE_LABELS: Record<CalendarScale, { short: string; full: string }> = {
  decade: { short: '10Y', full: '10년' },
  year: { short: '년', full: '연' },
  month: { short: '월', full: '월' },
  week: { short: '주', full: '주' },
};

const THEME_ICONS: Record<Theme, string> = {
  system: '🖥️',
  light: '☀️',
  dark: '🌙',
};

const buttonTransition = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 25,
};

export function CalendarHeader() {
  const { scale, goToToday, setScaleTo } = useCalendar();
  const { theme, toggleTheme } = useTheme();
  const setEntries = useSetAtom(entriesAtom);
  const setEvents = useSetAtom(eventsAtom);
  const entries = useAtomValue(entriesAtom);

  const hasData = Object.keys(entries).length > 0;

  const handleLoadDummy = () => {
    const { entries, events } = initializeDummyData();
    setEntries(entries);
    setEvents(events);
  };

  const handleClearData = () => {
    setEntries({});
    setEvents([]);
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-20',
        'flex items-center justify-between gap-2',
        'px-2 sm:px-4 py-2',
        'bg-bg-primary/80 backdrop-blur-xl',
        'border-b border-border-subtle',
      )}
    >
      {/* Segmented Control */}
      <div
        className={cn(
          'flex items-center gap-0.5',
          'bg-bg-tertiary',
          'rounded-lg sm:rounded-xl p-0.5 sm:p-1',
        )}
      >
        {SCALE_ORDER.map((s) => (
          <motion.button
            key={s}
            onClick={() => setScaleTo(s)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={buttonTransition}
            className={cn(
              'min-w-8 sm:min-w-10 min-h-8 sm:min-h-9',
              'px-2 sm:px-3 py-1.5 sm:py-2',
              'text-xs sm:text-sm font-medium',
              'rounded-md sm:rounded-lg',
              'transition-all duration-fast',
              scale === s
                ? cn('bg-bg-elevated', 'shadow-sm', 'text-text-primary')
                : cn('text-text-secondary', 'hover:text-text-primary'),
            )}
          >
            <span className="sm:hidden">{SCALE_LABELS[s].short}</span>
            <span className="hidden sm:inline">{SCALE_LABELS[s].full}</span>
          </motion.button>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <motion.button
          onClick={toggleTheme}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={buttonTransition}
          className={cn(
            'w-9 h-9 sm:w-11 sm:h-11',
            'flex items-center justify-center',
            'text-sm sm:text-base',
            'bg-bg-tertiary hover:bg-border-default',
            'rounded-lg sm:rounded-xl',
            'transition-colors duration-fast',
          )}
          aria-label={`테마: ${theme}`}
        >
          {THEME_ICONS[theme]}
        </motion.button>

        <motion.button
          onClick={goToToday}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={buttonTransition}
          className={cn(
            'h-9 sm:h-11',
            'px-2.5 sm:px-4 py-1.5 sm:py-2',
            'text-xs sm:text-sm font-medium',
            'bg-bg-tertiary hover:bg-border-default',
            'text-text-primary',
            'rounded-lg sm:rounded-xl',
            'transition-colors duration-fast',
          )}
        >
          오늘
        </motion.button>

        <motion.button
          onClick={hasData ? handleClearData : handleLoadDummy}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={buttonTransition}
          className={cn(
            'w-9 h-9 sm:w-auto sm:h-11',
            'px-0 sm:px-4 py-0 sm:py-2',
            'flex items-center justify-center',
            'text-sm font-medium',
            'rounded-lg sm:rounded-xl',
            'transition-colors duration-fast',
            hasData
              ? 'bg-negative hover:bg-negative/90 text-text-inverse'
              : 'bg-accent hover:bg-accent-hover text-text-inverse',
          )}
        >
          <span className="sm:hidden">{hasData ? '×' : '+'}</span>
          <span className="hidden sm:inline">{hasData ? '초기화' : '더미'}</span>
        </motion.button>
      </div>
    </header>
  );
}
