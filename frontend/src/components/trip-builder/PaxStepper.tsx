'use client';

export function PaxStepper({
  label,
  value,
  min,
  max = 20,
  onChange,
  hint,
}: {
  label: string;
  value: number;
  min: number;
  max?: number;
  onChange: (value: number) => void;
  hint?: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/12 bg-white/[0.04] px-5 py-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-white">{label}</p>
          {hint ? <p className="mt-1 text-xs text-white/50">{hint}</p> : null}
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label={`Меньше: ${label}`}
            disabled={value <= min}
            onClick={() => onChange(Math.max(min, value - 1))}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-xl text-white transition enabled:hover:bg-white/10 disabled:opacity-30"
          >
            −
          </button>
          <span className="min-w-[2ch] text-center text-2xl font-bold tabular-nums text-accent">
            {value}
          </span>
          <button
            type="button"
            aria-label={`Больше: ${label}`}
            disabled={value >= max}
            onClick={() => onChange(Math.min(max, value + 1))}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-xl text-white transition enabled:hover:bg-white/10 disabled:opacity-30"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
