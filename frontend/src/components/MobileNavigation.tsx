'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  IconCompass,
  IconHome,
  IconMap,
  IconPlus,
  IconUser,
} from './icons';

const ITEMS = [
  { href: '/', label: 'Главная', Icon: IconHome },
  { href: '/tours', label: 'Туры', Icon: IconCompass },
  { href: '/trip-builder', label: 'Создать', Icon: IconPlus, emphasize: true },
  { href: '/destinations', label: 'Места', Icon: IconMap },
  { href: '/profile', label: 'Профиль', Icon: IconUser },
] as const;

export function MobileNavigation() {
  const pathname = usePathname();

  if (
    pathname.startsWith('/admin') ||
    pathname === '/login' ||
    pathname === '/register'
  ) {
    return null;
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur tablet:hidden">
      <ul className="grid grid-cols-5">
        {ITEMS.map((item) => {
          const active =
            item.href === '/'
              ? pathname === '/'
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.Icon;
          const emphasize = 'emphasize' in item && item.emphasize;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex flex-col items-center gap-1 px-1 py-2 text-[11px] ${
                  active ? 'text-forest' : 'text-text-secondary'
                }`}
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    emphasize
                      ? active
                        ? 'bg-forest text-white'
                        : 'bg-accent text-ink'
                      : ''
                  }`}
                >
                  <Icon size={emphasize ? 18 : 20} />
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
