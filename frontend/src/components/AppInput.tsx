import type { InputHTMLAttributes } from 'react';

interface AppInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function AppInput({ label, error, className = '', id, ...props }: AppInputProps) {
  const inputId = id ?? props.name;
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      {label ? <span className="font-medium text-text-primary">{label}</span> : null}
      <input
        id={inputId}
        className={`rounded-2xl border border-border bg-surface px-4 py-3 text-text-primary outline-none transition focus:border-primary ${error ? 'border-danger' : ''} ${className}`}
        {...props}
      />
      {error ? <span className="text-xs text-danger">{error}</span> : null}
    </label>
  );
}
