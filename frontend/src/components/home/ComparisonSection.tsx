import Link from 'next/link';
import { COMPARISON, FORM_MICROCOPY } from '@/lib/home-content';
import { IconArrow } from '../icons';
import { Reveal } from '../Reveal';
import { SectionIntro } from './SectionIntro';

export function ComparisonSection() {
  const criteria = COMPARISON.rows.map((row) => row[0]);
  const self = COMPARISON.rows.map((row) => row[1]);
  const aggregator = COMPARISON.rows.map((row) => row[2]);
  const us = COMPARISON.rows.map((row) => row[3]);

  const columns = [
    { title: 'Самостоятельно', values: self, highlight: false },
    { title: 'Через агрегатор', values: aggregator, highlight: false },
    { title: 'С нами', values: us, highlight: true },
  ];

  return (
    <section id="compare" className="section-mist relative py-20 desktop:py-24">
      <div className="mx-auto max-w-7xl px-4 desktop:px-6">
        <Reveal>
          <SectionIntro
            tone="light"
            eyebrow="сравните не только цену"
            title={
              <>
                Самостоятельно, с агрегатором
                <br className="hidden tablet:block" /> или с местным организатором
              </>
            }
            subtitle={COMPARISON.subtitle}
          />
        </Reveal>

        {/* Mobile / tablet: stacked columns */}
        <div className="mt-12 grid gap-4 desktop:hidden">
          {columns.map((col, ci) => (
            <Reveal key={col.title} delayMs={ci * 60}>
              <div
                className={`rounded-[28px] p-5 ${
                  col.highlight
                    ? 'bg-forest text-white shadow-card'
                    : 'border border-border bg-surface'
                }`}
              >
                <p
                  className={`font-script text-2xl ${col.highlight ? 'text-accent' : 'text-forest'}`}
                >
                  {col.title}
                </p>
                <ul className="mt-4 space-y-3">
                  {col.values.map((value, i) => (
                    <li key={criteria[i]} className="text-sm">
                      <p
                        className={
                          col.highlight ? 'text-white/50' : 'text-text-secondary'
                        }
                      >
                        {criteria[i]}
                      </p>
                      <p className="mt-0.5 font-medium">{value}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Desktop: comparison grid with highlighted “us” */}
        <Reveal delayMs={60}>
          <div className="mt-12 hidden overflow-hidden rounded-[32px] border border-border bg-surface desktop:block">
            <div className="grid grid-cols-4 border-b border-border bg-cream/80">
              <div className="px-5 py-5 text-sm font-semibold text-text-secondary">
                Критерий
              </div>
              {columns.map((col) => (
                <div
                  key={col.title}
                  className={`px-5 py-5 text-sm font-semibold ${
                    col.highlight
                      ? 'compare-us text-forest'
                      : 'text-text-primary'
                  }`}
                >
                  {col.highlight ? (
                    <span className="font-script text-2xl text-forest">
                      {col.title}
                    </span>
                  ) : (
                    col.title
                  )}
                </div>
              ))}
            </div>
            {COMPARISON.rows.map((row, ri) => (
              <div
                key={row[0]}
                className={`grid grid-cols-4 ${ri < COMPARISON.rows.length - 1 ? 'border-b border-border/70' : ''}`}
              >
                <div className="px-5 py-4 text-sm font-medium text-ink">
                  {row[0]}
                </div>
                <div className="px-5 py-4 text-sm text-text-secondary">
                  {row[1]}
                </div>
                <div className="px-5 py-4 text-sm text-text-secondary">
                  {row[2]}
                </div>
                <div className="compare-us px-5 py-4 text-sm font-semibold text-forest">
                  {row[3]}
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delayMs={100}>
          <div className="mt-10 flex flex-col gap-5 tablet:flex-row tablet:items-center tablet:justify-between">
            <p className="max-w-xl text-sm leading-relaxed text-text-secondary">
              {COMPARISON.footer}
            </p>
            <div>
              <Link
                href="/trip-builder"
                className="group inline-flex items-center gap-3 rounded-btn bg-forest px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-forest-light"
              >
                {COMPARISON.cta}
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 transition group-hover:translate-x-0.5">
                  <IconArrow size={14} />
                </span>
              </Link>
              <p className="mt-2 text-xs text-text-secondary">{FORM_MICROCOPY}</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
