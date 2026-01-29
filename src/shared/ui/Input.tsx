'use client';

import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes, useId } from 'react';
import { cn } from '@/shared/lib/cn';

type InputSize = 'sm' | 'md' | 'lg';

interface BaseInputProps {
  label?: string;
  error?: string;
  hint?: string;
  inputSize?: InputSize;
}

interface TextInputProps
  extends BaseInputProps,
    Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  multiline?: false;
  rows?: never;
}

interface TextareaProps
  extends BaseInputProps,
    Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  multiline: true;
  rows?: number;
}

type InputProps = TextInputProps | TextareaProps;

const sizeStyles: Record<InputSize, string> = {
  sm: 'min-h-9 px-3 py-1.5 text-sm',
  md: 'min-h-11 px-4 py-2.5 text-base',
  lg: 'min-h-13 px-5 py-3 text-lg',
};

const baseInputStyles = cn(
  'w-full',
  'bg-bg-secondary',
  'text-text-primary',
  'placeholder:text-text-tertiary',
  'border border-border-subtle',
  'rounded-lg',
  'transition-all duration-fast',
  'focus:outline-none focus:border-accent focus:shadow-focus',
  'disabled:opacity-50 disabled:cursor-not-allowed',
);

export const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      inputSize = 'md',
      multiline = false,
      className,
      id: providedId,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const id = providedId ?? generatedId;
    const hasError = Boolean(error);

    const inputClassName = cn(
      baseInputStyles,
      sizeStyles[inputSize],
      hasError && 'border-negative focus:border-negative focus:shadow-[0_0_0_3px_rgba(239,68,68,0.2)]',
      className,
    );

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={id}
            className={cn(
              'text-sm font-medium',
              hasError ? 'text-negative' : 'text-text-secondary',
            )}
          >
            {label}
          </label>
        )}

        {multiline ? (
          <textarea
            ref={ref as React.Ref<HTMLTextAreaElement>}
            id={id}
            rows={(props as TextareaProps).rows ?? 4}
            className={cn(inputClassName, 'resize-none')}
            {...(props as Omit<TextareaProps, 'multiline' | 'inputSize' | 'label' | 'error' | 'hint'>)}
          />
        ) : (
          <input
            ref={ref as React.Ref<HTMLInputElement>}
            id={id}
            className={inputClassName}
            {...(props as Omit<TextInputProps, 'multiline' | 'inputSize' | 'label' | 'error' | 'hint'>)}
          />
        )}

        {(error || hint) && (
          <p
            className={cn(
              'text-xs',
              hasError ? 'text-negative' : 'text-text-tertiary',
            )}
          >
            {error || hint}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
