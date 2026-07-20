import Link from 'next/link';
import { FORM_MICROCOPY } from '@/lib/home-content';
import { IconArrow } from '../icons';
import { Reveal } from '../Reveal';

export function HomeCtaBand({
  title,
  cta,
  href,
  tone = 'forest',
}: {
  title: string;
  cta: string;
  href: string;
  tone?: 'forest' | 'ink' | 'cream';
}) {
  const shell =
    tone === 'forest'
      ? 'section-forest-glow text-white'
      : tone === 'ink'
        ? 'section-topo text-white'
        : 'section-mist text-ink border border-border';

  const btn =
    tone === 'cream'
      ? 'bg-forest text-white hover:bg-forest-light'
      : 'bg-accent text-ink hover:bg-white';

  const arrow =
    tone === 'cream' ? 'bg-white/15 text-white' : 'bg-ink text-white';

  return (
    <Reveal>
      <div className="px-4 py-3 desktop:px-6">
        <div
          className={`section-grain relative mx-auto flex max-w-7xl flex-col items-start justify-between gap-5 overflow-hidden rounded-[32px] px-7 py-8 tablet:flex-row tablet:items-center ${shell}`}
        >
          <div className="relative max-w-xl">
            <p className="text-xl font-bold tracking-tight tablet:text-2xl">
              {title}
            </p>
            <p
              className={`mt-2 text-sm leading-relaxed ${tone === 'cream' ? 'text-text-secondary' : 'text-white/65'}`}
            >
              {FORM_MICROCOPY}
            </p>
          </div>
          <Link
            href={href}
            className={`group relative inline-flex shrink-0 items-center gap-3 rounded-btn px-6 py-3.5 text-sm font-semibold transition ${btn}`}
          >
            {cta}
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full transition group-hover:translate-x-0.5 ${arrow}`}
            >
              <IconArrow size={14} />
            </span>
          </Link>
        </div>
      </div>
    </Reveal>
  );
}
