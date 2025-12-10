'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useCalendar } from '@/shared/hooks/use-calendar';
import { CalendarHeader } from '@/widgets/calendar-header/CalendarHeader';
import { DecadeView } from '@/features/calendar-views/decade-view/DecadeView';
import { YearView } from '@/features/calendar-views/year-view/YearView';
import { MonthView } from '@/features/calendar-views/month-view/MonthView';
import { WeekView } from '@/features/calendar-views/week-view/WeekView';
import { DayView } from '@/features/calendar-views/day-view/DayView';

const viewComponents = {
  decade: DecadeView,
  year: YearView,
  month: MonthView,
  week: WeekView,
  day: DayView,
} as const;

const zoomInVariants = {
  initial: { scale: 0.9, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 1.1, opacity: 0 },
};

const zoomOutVariants = {
  initial: { scale: 1.1, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.9, opacity: 0 },
};

export function CalendarShell() {
  const { scale, transitionDirection } = useCalendar();

  const ViewComponent = viewComponents[scale];
  const variants = transitionDirection === 'zoomOut' ? zoomOutVariants : zoomInVariants;

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-neutral-950">
      <CalendarHeader />
      <main className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={scale}
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="absolute inset-0 overflow-auto"
          >
            <ViewComponent />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
