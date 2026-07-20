'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BRAND } from '@/lib/brand';
import { IconTelegram, IconWhatsApp } from './icons';

const LEGAL_LINKS = [
  { href: '/legal/privacy', label: 'Политика конфиденциальности' },
  { href: '/legal/booking', label: 'Условия бронирования' },
  { href: '/legal/payment', label: 'Правила оплаты и возврата' },
  { href: '/legal/organizer', label: 'Информация об организаторе' },
  { href: '/legal/safety', label: 'Страхование и безопасность' },
] as const;

export function Footer() {
  const pathname = usePathname();
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/trip-builder') ||
    pathname === '/login' ||
    pathname === '/register'
  ) {
    return null;
  }

  return (
    <footer className="border-t border-border bg-ink text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 tablet:grid-cols-2 desktop:grid-cols-4 desktop:px-6">
        <div>
          <p className="font-sans text-xl lowercase tracking-tight">
            {BRAND.name}
          </p>
          <p className="font-script mt-2 text-2xl text-accent">{BRAND.tagline}</p>
          <p className="mt-3 text-sm text-white/70">{BRAND.legalName}</p>
          <p className="mt-1 text-xs text-white/45">
            ИНН {BRAND.inn} · ОГРН {BRAND.ogrn}
          </p>
        </div>

        <div className="flex flex-col gap-2 text-sm text-white/80">
          <p className="font-medium text-white">Навигация</p>
          <Link href="/tours" className="hover:text-white">
            Туры
          </Link>
          <Link href="/destinations" className="hover:text-white">
            Направления
          </Link>
          <Link href="/trip-builder" className="hover:text-white">
            Конструктор
          </Link>
          <Link href="/#quiz" className="hover:text-white">
            Подобрать Кавказ
          </Link>
          <Link href="/#reviews" className="hover:text-white">
            Отзывы
          </Link>
        </div>

        <div className="text-sm text-white/80" id="contacts">
          <p className="font-medium text-white">Контакты</p>
          <a
            href={`tel:${BRAND.phoneTel}`}
            className="mt-2 block hover:text-white"
          >
            {BRAND.phoneDisplay}
          </a>
          <a
            href={`mailto:${BRAND.email}`}
            className="mt-1 block hover:text-white"
          >
            {BRAND.email}
          </a>
          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href={BRAND.whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 hover:bg-white/15"
            >
              <IconWhatsApp size={16} />
              WhatsApp
            </a>
            <a
              href={BRAND.telegramUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 hover:bg-white/15"
            >
              <IconTelegram size={16} />
              Telegram
            </a>
          </div>
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-white/55">
            <a
              href={BRAND.socials.vk}
              target="_blank"
              rel="noreferrer"
              className="hover:text-white"
            >
              VK
            </a>
            <a
              href={BRAND.socials.telegram}
              target="_blank"
              rel="noreferrer"
              className="hover:text-white"
            >
              Telegram-канал
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-2 text-sm text-white/80">
          <p className="font-medium text-white">Документы</p>
          {LEGAL_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-white">
              {link.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-white/45 desktop:px-6">
        © {new Date().getFullYear()} {BRAND.name} · {BRAND.legalName}
      </div>
    </footer>
  );
}
