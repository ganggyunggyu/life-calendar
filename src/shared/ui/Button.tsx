'use client';

import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/shared/lib/cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps
  extends Omit<HTMLMotionProps<'button'>, 'children'>,
    Pick<ButtonHTMLAttributes<HTMLButtonElement>, 'disabled' | 'type'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: cn(
    'bg-accent text-text-inverse',
    'hover:bg-accent-hover',
    'shadow-sm hover:shadow-md',
  ),
  secondary: cn(
    'bg-bg-tertiary text-text-primary',
    'hover:bg-border-default',
    'border border-border-subtle',
  ),
  ghost: cn(
    'bg-transparent text-text-secondary',
    'hover:bg-bg-secondary hover:text-text-primary',
  ),
  danger: cn(
    'bg-negative text-text-inverse',
    'hover:bg-negative/90',
    'shadow-sm hover:shadow-md',
  ),
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'min-h-[36px] px-3 py-1.5 text-sm gap-1.5',
  md: 'min-h-[44px] px-4 py-2.5 text-base gap-2',
  lg: 'min-h-[52px] px-6 py-3 text-lg gap-2.5',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      disabled = false,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <motion.button
        ref={ref}
        disabled={disabled}
        whileHover={disabled ? undefined : { scale: 1.02 }}
        whileTap={disabled ? undefined : { scale: 0.98 }}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 25,
        }}
        className={cn(
          'inline-flex items-center justify-center',
          'font-medium',
          'rounded-lg',
          'transition-colors duration-fast',
          'focus-visible:outline-none focus-visible:shadow-focus',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          className,
        )}
        {...props}
      >
        {children}
      </motion.button>
    );
  },
);

Button.displayName = 'Button';
