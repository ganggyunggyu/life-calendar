'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useCalendar } from '@/shared/hooks/use-calendar';
import { usePinchZoom } from '@/shared/hooks/use-pinch-zoom';
import { cn } from '@/shared/lib/cn';
import { CalendarHeader } from '@/widgets/calendar-header/CalendarHeader';
import { DecadeView } from '@/features/calendar-views/decade-view/DecadeView';
import { YearView } from '@/features/calendar-views/year-view/YearView';
import { MonthView } from '@/features/calendar-views/month-view/MonthView';
import { WeekView } from '@/features/calendar-views/week-view/WeekView';
import { EntryFormModal } from '@/features/entry-form';

const viewComponents = {
  decade: DecadeView,
  year: YearView,
  month: MonthView,
  week: WeekView,
} as const;

const springTransition = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 30,
};

const exitTransition = {
  duration: 0.15,
  ease: 'easeOut' as const,
};

const zoomInVariants = {
  initial: {
    scale: 0.92,
    opacity: 0,
    filter: 'blur(4px)',
  },
  animate: {
    scale: 1,
    opacity: 1,
    filter: 'blur(0px)',
    transition: springTransition,
  },
  exit: {
    scale: 1.05,
    opacity: 0,
    filter: 'blur(2px)',
    transition: exitTransition,
  },
};

const zoomOutVariants = {
  initial: {
    scale: 1.08,
    opacity: 0,
    filter: 'blur(4px)',
  },
  animate: {
    scale: 1,
    opacity: 1,
    filter: 'blur(0px)',
    transition: springTransition,
  },
  exit: {
    scale: 0.95,
    opacity: 0,
    filter: 'blur(2px)',
    transition: exitTransition,
  },
};

export function CalendarShell() {
  const { scale, transitionDirection, zoomIn, zoomOut } = useCalendar();

  const pinchRef = usePinchZoom<HTMLElement>({
    onZoomIn: zoomIn,
    onZoomOut: zoomOut,
  });

  const ViewComponent = viewComponents[scale as keyof typeof viewComponents] || MonthView;
  const variants = transitionDirection === 'zoomOut' ? zoomOutVariants : zoomInVariants;

  return (
    <div className={cn('h-screen flex flex-col', 'bg-bg-primary')}>
      <CalendarHeader />
      <main ref={pinchRef} className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={scale}
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="absolute inset-0 overflow-auto"
          >
            <ViewComponent />
          </motion.div>
        </AnimatePresence>
      </main>
      <EntryFormModal />
    </div>
  );
}
