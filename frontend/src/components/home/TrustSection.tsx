import { Reveal } from '../Reveal';
import { TRUST_STATS, TRUST_STRIP } from '@/lib/home-content';
import { SectionIntro } from './SectionIntro';

export function TrustSection({ routesCount }: { routesCount: number }) {
  const stats = [
    {
      value: TRUST_STATS.travelers.toLocaleString('ru-RU'),
      label: 'путешественников',
    },
    { value: String(TRUST_STATS.years), label: 'лет в регионе' },
    {
      value: String(Math.max(routesCount, 1)),
      label: 'проверенных маршрутов',
    },
    {
      value: TRUST_STATS.rating.toFixed(1),
      label: 'средняя оценка',
    },
  ];

  return (
    <section
      id="trust"
      className="section-forest-glow section-grain relative overflow-hidden py-20 text-white desktop:py-24"
    >
      <div className="relative mx-auto max-w-7xl px-4 desktop:px-6">
        <Reveal>
          <SectionIntro
            tone="forest"
            eyebrow="полоса доверия"
            title={TRUST_STRIP.headline}
            subtitle="Домбай, Архыз, Эльбрус и КМВ — одна продуктовая линейка с местной командой и поддержкой до, во время и после поездки."
          />
        </Reveal>

        <div className="mt-10 flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {TRUST_STRIP.points.map((point, i) => (
            <Reveal key={point} delayMs={i * 40} className="shrink-0">
              <p className="max-w-[240px] rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white/80 backdrop-blur-sm">
                {point}
              </p>
            </Reveal>
          ))}
        </div>

        <div className="mt-14 grid grid-cols-2 gap-8 border-t border-white/15 pt-10 desktop:grid-cols-4">
          {stats.map((stat, i) => (
            <Reveal key={stat.label} delayMs={i * 70}>
              <p className="font-script text-5xl leading-none text-accent tablet:text-6xl">
                {stat.value}
              </p>
              <p className="mt-2 text-sm text-white/65">{stat.label}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
