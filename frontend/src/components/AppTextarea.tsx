import type { TextareaHTMLAttributes } from 'react';

interface AppTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function AppTextarea({
  label,
  error,
  className = '',
  id,
  ...props
}: AppTextareaProps) {
  const inputId = id ?? props.name;
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      {label ? <span className="font-medium text-text-primary">{label}</span> : null}
      <textarea
        id={inputId}
        className={`min-h-28 rounded-2xl border border-border bg-surface px-4 py-3 text-text-primary outline-none transition focus:border-primary ${error ? 'border-danger' : ''} ${className}`}
        {...props}
      />
      {error ? <span className="text-xs text-danger">{error}</span> : null}
    </label>
  );
}
