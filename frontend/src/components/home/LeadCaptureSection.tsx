'use client';

import { useState, type FormEvent } from 'react';
import { BRAND } from '@/lib/brand';
import { FORM_MICROCOPY } from '@/lib/home-content';
import { IconArrow, IconTelegram, IconWhatsApp } from '../icons';
import { AppInput } from '../AppInput';
import { Reveal } from '../Reveal';
import { SectionIntro } from './SectionIntro';

export function LeadCaptureSection() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [sent, setSent] = useState(false);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const text = encodeURIComponent(
      `Здравствуйте! Хочу расчёт поездки.\nИмя: ${name}\nТелефон: ${phone}`,
    );
    window.open(`${BRAND.whatsappUrl}?text=${text}`, '_blank', 'noreferrer');
    setSent(true);
  }

  return (
    <section
      id="lead"
      className="section-forest-glow section-grain relative overflow-hidden py-20 text-white desktop:py-28"
    >
      <div className="pointer-events-none absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-accent/15 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 desktop:grid-cols-2 desktop:items-center desktop:px-6">
        <Reveal>
          <SectionIntro
            tone="forest"
            eyebrow="можно ничего не покупать"
            title="Получите расчёт полной стоимости"
            subtitle="Координатор пришлёт предварительный бюджет и три варианта маршрута под ваш состав — без навязывания тура."
          />
          <ul className="mt-8 space-y-3 text-sm text-white/75">
            {[
              'Полная стоимость заранее',
              'Готовый или индивидуальный формат',
              'Один ответственный на всём пути',
            ].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={BRAND.whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm text-white/85 transition hover:bg-white/10"
            >
              <IconWhatsApp size={16} />
              WhatsApp
            </a>
            <a
              href={BRAND.telegramUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm text-white/85 transition hover:bg-white/10"
            >
              <IconTelegram size={16} />
              Telegram
            </a>
          </div>
        </Reveal>

        <Reveal delayMs={90}>
          <form
            onSubmit={onSubmit}
            className="receipt-panel space-y-4 rounded-[32px] p-7 text-ink shadow-card"
          >
            <p className="font-script text-3xl text-forest">Заявка на расчёт</p>
            <AppInput
              label="Имя"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Как к вам обращаться"
            />
            <AppInput
              label="Телефон"
              name="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              placeholder="+7 …"
            />
            <button
              type="submit"
              className="group flex w-full items-center justify-between rounded-btn bg-forest px-5 py-4 text-sm font-semibold text-white transition hover:bg-forest-light"
            >
              <span>
                {sent ? 'Открыть WhatsApp ещё раз' : 'Рассчитать полную стоимость'}
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-ink transition group-hover:translate-x-0.5">
                <IconArrow size={16} />
              </span>
            </button>
            <p className="text-xs leading-relaxed text-text-secondary">
              {FORM_MICROCOPY}
            </p>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
