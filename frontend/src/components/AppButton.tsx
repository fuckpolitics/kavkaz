import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'accent' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const variantClass: Record<Variant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-light',
  secondary: 'bg-surface text-primary border border-border hover:bg-background',
  accent: 'bg-accent text-primary hover:opacity-90',
  ghost: 'bg-transparent text-white hover:bg-white/10',
  danger: 'bg-danger text-white hover:opacity-90',
};

const sizeClass: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3.5 text-base',
};

interface AppButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  children: ReactNode;
}

export function AppButton({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className = '',
  children,
  ...props
}: AppButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-btn font-medium transition disabled:opacity-60 disabled:cursor-not-allowed ${variantClass[variant]} ${sizeClass[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? 'Загрузка…' : children}
    </button>
  );
}
