'use client';

export function PaxStepper({
  label,
  value,
  min,
  max = 20,
  onChange,
  hint,
  variant = 'dark',
}: {
  label: string;
  value: number;
  min: number;
  max?: number;
  onChange: (value: number) => void;
  hint?: string;
  variant?: 'dark' | 'light';
}) {
  const isLight = variant === 'light';

  return (
    <div
      className={
        isLight
          ? 'rounded-[20px] border border-border bg-black/[0.02] px-4 py-4'
          : 'rounded-[24px] border border-white/12 bg-white/[0.04] px-5 py-5'
      }
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p
            className={
              isLight ? 'font-semibold text-ink' : 'font-semibold text-white'
            }
          >
            {label}
          </p>
          {hint ? (
            <p
              className={
                isLight
                  ? 'mt-1 text-xs text-text-secondary'
                  : 'mt-1 text-xs text-white/50'
              }
            >
              {hint}
            </p>
          ) : null}
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label={`Меньше: ${label}`}
            disabled={value <= min}
            onClick={() => onChange(Math.max(min, value - 1))}
            className={
              isLight
                ? 'flex h-10 w-10 items-center justify-center rounded-full border border-border text-xl text-ink transition enabled:hover:bg-black/[0.04] disabled:opacity-30'
                : 'flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-xl text-white transition enabled:hover:bg-white/10 disabled:opacity-30'
            }
          >
            −
          </button>
          <span
            className={
              isLight
                ? 'min-w-[2ch] text-center text-2xl font-bold tabular-nums text-forest'
                : 'min-w-[2ch] text-center text-2xl font-bold tabular-nums text-accent'
            }
          >
            {value}
          </span>
          <button
            type="button"
            aria-label={`Больше: ${label}`}
            disabled={value >= max}
            onClick={() => onChange(Math.min(max, value + 1))}
            className={
              isLight
                ? 'flex h-10 w-10 items-center justify-center rounded-full border border-border text-xl text-ink transition enabled:hover:bg-black/[0.04] disabled:opacity-30'
                : 'flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-xl text-white transition enabled:hover:bg-white/10 disabled:opacity-30'
            }
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
