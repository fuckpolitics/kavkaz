import { BRAND } from '@/lib/brand';
import { IconTelegram, IconWhatsApp } from '../icons';

export function MessengerStrip() {
  return (
    <section className="border-b border-border bg-ink px-4 py-5 text-white tablet:hidden">
      <p className="text-center font-script text-2xl text-accent">
        Удобнее в мессенджере?
      </p>
      <p className="mt-1 text-center text-xs text-white/55">
        Координатор ответит и поможет с расчётом
      </p>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <a
          href={BRAND.whatsappUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-btn bg-accent px-3 py-3 text-sm font-semibold text-ink"
        >
          <IconWhatsApp size={16} />
          WhatsApp
        </a>
        <a
          href={BRAND.telegramUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-btn border border-white/25 px-3 py-3 text-sm font-medium text-white"
        >
          <IconTelegram size={16} />
          Telegram
        </a>
      </div>
    </section>
  );
}
