import type { SelectHTMLAttributes } from 'react';

interface Option {
  value: string;
  label: string;
}

interface AppSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Option[];
  placeholder?: string;
}

export function AppSelect({
  label,
  error,
  options,
  placeholder,
  className = '',
  id,
  ...props
}: AppSelectProps) {
  const inputId = id ?? props.name;
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      {label ? <span className="font-medium text-text-primary">{label}</span> : null}
      <select
        id={inputId}
        className={`rounded-2xl border border-border bg-surface px-4 py-3 text-text-primary outline-none transition focus:border-primary ${error ? 'border-danger' : ''} ${className}`}
        {...props}
      >
        {placeholder ? (
          <option value="">{placeholder}</option>
        ) : null}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error ? <span className="text-xs text-danger">{error}</span> : null}
    </label>
  );
}
