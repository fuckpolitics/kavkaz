import type { ReactNode } from 'react';

export function SectionIntro({
  eyebrow,
  title,
  subtitle,
  tone = 'light',
  action,
}: {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  tone?: 'light' | 'dark' | 'forest';
  action?: ReactNode;
}) {
  const eyebrowClass =
    tone === 'light'
      ? 'text-forest'
      : tone === 'forest'
        ? 'text-accent'
        : 'text-accent';
  const titleClass =
    tone === 'light' ? 'text-ink' : 'text-white';
  const subClass =
    tone === 'light' ? 'text-text-secondary' : 'text-white/70';

  return (
    <div className="flex flex-col gap-4 tablet:flex-row tablet:items-end tablet:justify-between">
      <div className="max-w-3xl">
        {eyebrow ? (
          <p className={`font-script text-2xl tablet:text-3xl ${eyebrowClass}`}>
            {eyebrow}
          </p>
        ) : null}
        <h2
          className={`mt-1 text-[1.75rem] font-bold leading-[1.1] tracking-tight tablet:text-4xl desktop:text-[2.75rem] ${titleClass}`}
        >
          {title}
        </h2>
        {subtitle ? (
          <p className={`mt-3 max-w-2xl text-base leading-relaxed ${subClass}`}>
            {subtitle}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
