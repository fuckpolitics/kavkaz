import Link from 'next/link';
import { FORM_MICROCOPY, GALLERY_MOMENTS } from '@/lib/home-content';
import { IconArrow } from '../icons';
import { Reveal } from '../Reveal';
import { SectionIntro } from './SectionIntro';

export function GallerySection() {
  return (
    <section
      id="gallery"
      className="section-topo section-grain relative overflow-hidden py-20 desktop:py-24"
    >
      <div className="relative mx-auto max-w-7xl px-4 desktop:px-6">
        <Reveal>
          <SectionIntro
            tone="dark"
            eyebrow="как это выглядит изнутри"
            title="Галерея реального путешествия"
            subtitle="Не только вершины: встреча, дорога, завтраки, гид, вечер и запасной план — чтобы представить себя внутри поездки."
          />
        </Reveal>

        <div className="mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {GALLERY_MOMENTS.map((moment, i) => {
            const tall = i % 3 === 1;
            return (
              <Reveal
                key={moment.id}
                delayMs={i * 35}
                className="shrink-0 snap-start"
              >
                <figure
                  className={`film-tile w-[210px] rounded-[22px] tablet:w-[260px] ${
                    tall ? 'mt-8' : ''
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={moment.image}
                    alt={moment.label}
                    className={`w-full object-cover ${tall ? 'aspect-[3/4]' : 'aspect-[4/5]'}`}
                  />
                  <figcaption className="absolute inset-x-0 bottom-0 z-10 px-4 pb-4">
                    <span className="font-script text-lg text-accent">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <p className="text-base font-semibold text-white">
                      {moment.label}
                    </p>
                  </figcaption>
                </figure>
              </Reveal>
            );
          })}
        </div>

        <Reveal delayMs={80}>
          <div className="mt-10 flex flex-col gap-5 border-t border-white/10 pt-8 tablet:flex-row tablet:items-center tablet:justify-between">
            <p className="max-w-lg text-sm text-white/55">
              Чем меньше постановочных кадров — тем честнее ожидания. Замените
              плейсхолдеры реальными фото команды, когда материалы будут готовы.
            </p>
            <div>
              <Link
                href="/#quiz"
                className="group inline-flex items-center gap-3 rounded-btn bg-accent px-6 py-3.5 text-sm font-semibold text-ink transition hover:bg-white"
              >
                Хочу оказаться там
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-white transition group-hover:translate-x-0.5">
                  <IconArrow size={14} />
                </span>
              </Link>
              <p className="mt-2 text-xs text-white/40">{FORM_MICROCOPY}</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
