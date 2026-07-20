'use client';

import Link from 'next/link';
import { useState } from 'react';
import { BRAND, VALUE_PROPS } from '@/lib/brand';
import { BrandIcon, IconArrow, IconStar } from './icons';

export function HeroSection() {
  const [heroSrc, setHeroSrc] = useState('/images/hero.jpg');

  return (
    <section className="relative isolate min-h-[100svh] overflow-hidden text-white">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={heroSrc}
        alt="Кавказ"
        className="hero-kenburns absolute inset-0 h-full w-full object-cover"
        onError={() => setHeroSrc('/images/placeholder-mountains.svg')}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-ink/20" />

      <div className="relative mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-end px-4 pb-8 pt-28 desktop:px-6 desktop:pb-12">
        <div className="animate-fade-up max-w-3xl">
          <h1 className="font-sans text-[2.5rem] font-bold leading-[1.05] tracking-tight tablet:text-5xl desktop:text-6xl">
            Авторские туры
            <br />
            по Кавказу
          </h1>
          <p className="font-script mt-3 text-3xl text-accent tablet:text-4xl">
            {BRAND.tagline}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-sm backdrop-blur">
              <IconStar size={14} className="text-accent" />
              <span className="font-semibold">{BRAND.rating.toFixed(1)}</span>
              <span className="text-white/70">{BRAND.reviewsLabel}</span>
            </span>
            <div className="flex -space-x-2">
              {['/images/avatars/a.jpg', '/images/avatars/b.jpg', '/images/avatars/c.jpg'].map(
                (src) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={src}
                    src={src}
                    alt=""
                    className="h-8 w-8 rounded-full border-2 border-ink/40 object-cover"
                  />
                ),
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 grid max-w-2xl gap-3 tablet:grid-cols-2">
          <Link
            href="/tours"
            className="group flex min-h-[120px] items-center justify-between rounded-[26px] bg-forest p-5 shadow-card transition duration-300 hover:-translate-y-0.5 hover:bg-forest-light"
          >
            <div>
              <p className="text-lg font-semibold">Выбрать готовый тур</p>
              <p className="mt-1 text-sm text-white/65">Проверенные маршруты</p>
            </div>
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-forest transition group-hover:translate-x-0.5">
              <IconArrow size={18} />
            </span>
          </Link>
          <Link
            href="/trip-builder"
            className="group flex min-h-[120px] items-center justify-between rounded-[26px] bg-cream p-5 text-ink shadow-card transition duration-300 hover:-translate-y-0.5 hover:bg-white"
          >
            <div>
              <p className="text-lg font-semibold">Создать свой тур</p>
              <p className="mt-1 text-sm text-text-secondary">
                С нуля или на основе тура
              </p>
            </div>
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ink text-white transition group-hover:translate-x-0.5">
              <IconArrow size={18} />
            </span>
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-3 rounded-[22px] bg-ink/70 px-4 py-4 backdrop-blur-md tablet:grid-cols-4 tablet:px-6">
          {VALUE_PROPS.map((item) => (
            <div key={item.id} className="flex items-start gap-2.5 text-sm">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent">
                <BrandIcon name={item.icon} size={16} />
              </span>
              <div>
                <p className="font-semibold leading-tight">{item.title}</p>
                <p className="mt-0.5 text-xs text-white/65">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
