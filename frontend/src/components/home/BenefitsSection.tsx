import { Reveal } from '../Reveal';
import { BENEFITS } from '@/lib/home-content';
import { SectionIntro } from './SectionIntro';

export function BenefitsSection() {
  return (
    <section id="benefits" className="section-mist relative py-20 desktop:py-24">
      <div className="mx-auto max-w-7xl px-4 desktop:px-6">
        <Reveal>
          <SectionIntro
            tone="light"
            eyebrow="прозрачные цены"
            title="Выгоды работы с нами"
            subtitle="Каждое обещание — с доказательством рядом: смета, сценарий сопровождения, кто отвечает."
          />
        </Reveal>

        <div className="mt-14 space-y-16">
          {BENEFITS.map((item, i) => (
            <Reveal key={item.id} delayMs={i * 60}>
              <div
                className={`grid items-center gap-8 desktop:grid-cols-2 desktop:gap-16 ${
                  i % 2 === 1 ? 'desktop:[&>*:first-child]:order-2' : ''
                }`}
              >
                <div>
                  <span className="font-script text-4xl text-forest/30">
                    0{i + 1}
                  </span>
                  <h3 className="mt-2 text-2xl font-bold tracking-tight tablet:text-3xl">
                    {item.title}
                  </h3>
                  <p className="mt-4 max-w-md text-base leading-relaxed text-text-secondary">
                    {item.text}
                  </p>
                </div>

                <div className="receipt-panel relative rounded-[28px] px-6 py-6">
                  <div className="absolute left-6 right-6 top-0 h-px border-t border-dashed border-border" />
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-forest">
                    {item.proof.label}
                  </p>
                  <ul className="mt-4 space-y-3">
                    {item.proof.lines.map((line) => {
                      const bold = 'bold' in line && line.bold;
                      return (
                        <li
                          key={line.name}
                          className={`flex items-baseline justify-between gap-4 text-sm ${
                            bold ? 'border-t border-forest/20 pt-3' : ''
                          }`}
                        >
                          <span className="text-text-secondary">{line.name}</span>
                          <span
                            className={
                              bold
                                ? 'text-lg font-bold text-forest'
                                : 'font-semibold text-ink'
                            }
                          >
                            {line.value}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
