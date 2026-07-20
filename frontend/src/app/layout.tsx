import type { Metadata } from 'next';
import { Caveat, Inter, Manrope } from 'next/font/google';
import { AuthProvider } from '@/lib/auth-context';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { MobileNavigation } from '@/components/MobileNavigation';
import { BRAND } from '@/lib/brand';
import './globals.css';

const manrope = Manrope({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-manrope',
});

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
});

const caveat = Caveat({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-caveat',
});

export const metadata: Metadata = {
  title: `${BRAND.name} — Авторские туры по Кавказу`,
  description:
    'Авторские туры и конструктор индивидуальных путешествий по Кавказу',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body
        className={`${manrope.variable} ${inter.variable} ${caveat.variable} antialiased`}
      >
        <AuthProvider>
          <Header />
          <main className="pb-mobile-nav min-h-screen">{children}</main>
          <Footer />
          <MobileNavigation />
        </AuthProvider>
      </body>
    </html>
  );
}
