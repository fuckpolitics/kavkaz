import Link from 'next/link';
import { BRAND } from '@/lib/brand';
import { FORM_MICROCOPY, SAFETY } from '@/lib/home-content';
import { BrandIcon, IconArrow, IconShield } from '../icons';
import { Reveal } from '../Reveal';
import { SectionIntro } from './SectionIntro';

const ITEM_ICONS = {
  transport: 'comfort',
  drivers: 'route',
  guides: 'guide',
  docs: 'shield',
  kids: 'place',
  coord: 'support',
} as const;

export function SafetySection() {
  return (
    <section id="safety" className="relative overflow-hidden bg-surface py-20 desktop:py-24">
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-cream to-transparent" />

      <div className="relative mx-auto max-w-7xl px-4 desktop:px-6">
        <Reveal>
          <SectionIntro
            tone="light"
            eyebrow="конкретные люди и регламенты"
            title={SAFETY.title}
            subtitle={SAFETY.lead}
          />
        </Reveal>

        <div className="mt-12 grid gap-6 desktop:grid-cols-12">
          <Reveal className="desktop:col-span-5">
            <div className="relative h-full overflow-hidden rounded-[32px] bg-ink px-7 py-8 text-white">
              <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-accent/20 blur-2xl" />
              <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-accent/20 text-accent">
                <IconShield size={22} />
              </div>
              <p className="relative mt-6 font-script text-3xl text-accent">
                {SAFETY.planB.title}
              </p>
              <p className="relative mt-3 text-base leading-relaxed text-white/80">
                {SAFETY.planB.text}
              </p>
              <p className="relative mt-8 border-t border-white/15 pt-5 text-sm font-medium text-white/90">
                {SAFETY.evidence}
              </p>
            </div>
          </Reveal>

          <div className="grid gap-3 tablet:grid-cols-2 desktop:col-span-7">
            {SAFETY.items.map((item, i) => (
              <Reveal key={item.id} delayMs={i * 45}>
                <div className="group h-full rounded-[24px] border border-border bg-cream/60 px-5 py-5 transition duration-300 hover:-translate-y-0.5 hover:border-forest/30 hover:bg-cream hover:shadow-soft">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-forest/10 text-forest transition group-hover:bg-forest group-hover:text-accent">
                    <BrandIcon
                      name={ITEM_ICONS[item.id as keyof typeof ITEM_ICONS]}
                      size={18}
                    />
                  </span>
                  <h3 className="mt-4 font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                    {item.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal delayMs={80}>
          <div className="mt-12 flex flex-col items-start gap-4 border-t border-border pt-8 tablet:flex-row tablet:items-center tablet:justify-between">
            <p className="max-w-md text-sm text-text-secondary">{FORM_MICROCOPY}</p>
            <Link
              href={BRAND.whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-3 rounded-btn bg-forest px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-forest-light"
            >
              {SAFETY.cta}
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 transition group-hover:translate-x-0.5">
                <IconArrow size={14} />
              </span>
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
