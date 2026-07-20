'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { BRAND } from '@/lib/brand';
import { useAuth } from '@/lib/auth-context';
import { AppButton } from './AppButton';
import { IconWhatsApp } from './icons';

const NAV = [
  { href: '/tours', label: 'Туры' },
  { href: '/destinations', label: 'Направления' },
  { href: '/#about', label: 'О нас' },
  { href: '/#reviews', label: 'Отзывы' },
  { href: '/#contacts', label: 'Контакты' },
];

export function Header() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const transparent = pathname === '/';
  const darkChrome = pathname.startsWith('/trip-builder');

  return (
    <header
      className={
        transparent
          ? 'absolute inset-x-0 top-0 z-40 bg-gradient-to-b from-ink/70 to-transparent text-white'
          : darkChrome
            ? 'sticky top-0 z-40 border-b border-white/10 bg-ink/95 text-white backdrop-blur'
            : 'sticky top-0 z-40 border-b border-border bg-surface/95 text-text-primary backdrop-blur'
      }
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 desktop:px-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-semibold tracking-wide"
        >
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-full ${
              transparent || darkChrome
                ? 'bg-accent text-ink'
                : 'bg-forest text-accent'
            }`}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden
            >
              <path d="M12 3 L22 20 H2 Z" />
            </svg>
          </span>
          <span className="font-sans text-xl lowercase tracking-tight">
            {BRAND.name}
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm desktop:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="opacity-90 transition hover:opacity-100"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 desktop:flex">
          <a
            href={BRAND.whatsappUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="WhatsApp"
            className={`flex h-10 w-10 items-center justify-center rounded-full transition ${
              transparent || darkChrome
                ? 'bg-white/15 hover:bg-white/25'
                : 'bg-primary/10 text-primary hover:bg-primary/15'
            }`}
          >
            <IconWhatsApp size={18} />
          </a>
          <a href={`tel:${BRAND.phoneTel}`} className="text-sm font-medium">
            {BRAND.phoneDisplay}
          </a>
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link href="/trips" className="text-sm font-medium opacity-90 hover:opacity-100">
                Поездки
              </Link>
              <Link href="/profile" className="text-sm font-medium">
                {user?.firstName}
              </Link>
              {isAdmin ? (
                <Link
                  href="/admin"
                  className="text-sm underline underline-offset-2"
                >
                  Админ
                </Link>
              ) : null}
              <AppButton
                size="sm"
                variant={transparent || darkChrome ? 'ghost' : 'secondary'}
                onClick={() => void logout()}
              >
                Выйти
              </AppButton>
            </div>
          ) : (
            <Link href="/login">
              <AppButton
                size="sm"
                variant={transparent || darkChrome ? 'accent' : 'primary'}
              >
                Войти
              </AppButton>
            </Link>
          )}
        </div>

        <button
          type="button"
          className="rounded-xl px-3 py-2 text-lg desktop:hidden"
          aria-label="Меню"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? '✕' : '☰'}
        </button>
      </div>

      {open ? (
        <div
          className={`border-t px-4 py-4 desktop:hidden ${
            transparent || darkChrome
              ? 'border-white/10 bg-ink text-white'
              : 'border-border bg-surface text-text-primary'
          }`}
        >
          <div className="flex flex-col gap-3">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="py-1"
              >
                {item.label}
              </Link>
            ))}
            <Link href="/trip-builder" onClick={() => setOpen(false)}>
              Создать тур
            </Link>
            {isAuthenticated ? (
              <>
                <Link href="/profile" onClick={() => setOpen(false)}>
                  Профиль
                </Link>
                <Link href="/trips" onClick={() => setOpen(false)}>
                  Мои поездки
                </Link>
                <Link href="/bookings" onClick={() => setOpen(false)}>
                  Бронирования
                </Link>
                {isAdmin ? (
                  <Link href="/admin" onClick={() => setOpen(false)}>
                    Админ
                  </Link>
                ) : null}
                <button
                  type="button"
                  className="text-left"
                  onClick={() => {
                    setOpen(false);
                    void logout();
                  }}
                >
                  Выйти
                </button>
              </>
            ) : (
              <Link href="/login" onClick={() => setOpen(false)}>
                Войти
              </Link>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
