'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { RequireAuth } from '@/lib/require-auth';

const LINKS = [
  { href: '/admin', label: 'Обзор' },
  { href: '/admin/destinations', label: 'Направления' },
  { href: '/admin/locations', label: 'Локации' },
  { href: '/admin/extra-services', label: 'Услуги' },
  { href: '/admin/tours', label: 'Туры' },
  { href: '/admin/bookings', label: 'Бронирования' },
  { href: '/admin/users', label: 'Пользователи' },
];

function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 desktop:grid-cols-[240px_1fr] desktop:px-6">
      <aside className="rounded-card border border-border bg-primary p-4 text-white">
        <p className="mb-4 text-lg font-semibold">Админ · сорвались</p>
        <nav className="flex flex-col gap-1">
          {LINKS.map((link) => {
            const active =
              link.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-xl px-3 py-2 text-sm ${active ? 'bg-white/15' : 'hover:bg-white/10'}`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div>{children}</div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAuth adminOnly>
      <AdminShell>{children}</AdminShell>
    </RequireAuth>
  );
}
