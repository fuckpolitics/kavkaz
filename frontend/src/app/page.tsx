'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { destinationsApi } from '@/api/destinations.api';
import { toursApi } from '@/api/tours.api';
import {
  DestinationCard,
  DestinationCtaCard,
} from '@/components/DestinationCard';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { HeroSection } from '@/components/HeroSection';
import { BenefitsSection } from '@/components/home/BenefitsSection';
import { ComparisonSection } from '@/components/home/ComparisonSection';
import { GallerySection } from '@/components/home/GallerySection';
import { HomeCtaBand } from '@/components/home/HomeCtaBand';
import { LeadCaptureSection } from '@/components/home/LeadCaptureSection';
import { MessengerStrip } from '@/components/home/MessengerStrip';
import { QuizSection } from '@/components/home/QuizSection';
import { SafetySection } from '@/components/home/SafetySection';
import { SectionIntro } from '@/components/home/SectionIntro';
import { TrustSection } from '@/components/home/TrustSection';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { Reveal } from '@/components/Reveal';
import { TourCard } from '@/components/TourCard';
import { IconArrow, IconStar } from '@/components/icons';
import { DEMO_REVIEWS } from '@/lib/brand';
import type { DestinationShortDto } from '@/types/destination';
import type { TourShortDto } from '@/types/tour';

export default function HomePage() {
  const [destinations, setDestinations] = useState<DestinationShortDto[]>([]);
  const [tours, setTours] = useState<TourShortDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [d, t] = await Promise.all([
        destinationsApi.list({ limit: 8 }),
        toursApi.list({ limit: 8 }),
      ]);
      setDestinations(d);
      setTours(t);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const featuredTours = useMemo(() => tours.slice(0, 8), [tours]);

  return (
    <div>
      <HeroSection />
      <MessengerStrip />
      <QuizSection />

      {/* 3. Выбор тура + конструктор */}
      <section id="tours-pick" className="bg-cream py-20 desktop:py-24">
        <div className="mx-auto max-w-7xl px-4 desktop:px-6">
          <Reveal>
            <SectionIntro
              tone="light"
              eyebrow="готовое или своё"
              title="Выберите тур или соберите маршрут"
              subtitle="Проверенные программы по регионам — или конструктор под ваш состав и темп."
              action={
                <Link
                  href="/destinations"
                  className="text-sm font-semibold text-forest underline decoration-accent underline-offset-4"
                >
                  Все направления
                </Link>
              }
            />
          </Reveal>
          {loading ? (
            <LoadingSkeleton rows={2} />
          ) : error ? (
            <ErrorState message={error} onRetry={() => void load()} />
          ) : destinations.length === 0 ? (
            <EmptyState title="Направлений пока нет" />
          ) : (
            <div className="mt-10 grid grid-cols-1 gap-4 tablet:grid-cols-2 desktop:grid-cols-4">
              {destinations.map((d, i) => (
                <Reveal key={d.id} delayMs={i * 60}>
                  <DestinationCard destination={d} />
                </Reveal>
              ))}
              <Reveal delayMs={destinations.length * 60}>
                <DestinationCtaCard />
              </Reveal>
            </div>
          )}
        </div>
      </section>

      <section className="bg-surface py-20 desktop:py-24">
        <div className="mx-auto max-w-7xl px-4 desktop:px-6">
          <Reveal>
            <SectionIntro
              tone="light"
              eyebrow="популярные программы"
              title="Маршруты, которые бронируют чаще всего"
              action={
                <Link
                  href="/tours"
                  className="text-sm font-semibold text-forest underline decoration-accent underline-offset-4"
                >
                  Смотреть все
                </Link>
              }
            />
          </Reveal>
          {loading ? (
            <LoadingSkeleton rows={2} />
          ) : error ? (
            <ErrorState message={error} onRetry={() => void load()} />
          ) : featuredTours.length === 0 ? (
            <EmptyState title="Туров пока нет" />
          ) : (
            <div className="mt-10 flex snap-x gap-4 overflow-x-auto pb-2 scrollbar-hide desktop:grid desktop:grid-cols-4 desktop:overflow-visible">
              {featuredTours.map((tour, i) => (
                <Reveal key={tour.id} delayMs={i * 50}>
                  <TourCard tour={tour} />
                </Reveal>
              ))}
            </div>
          )}

          <Reveal>
            <div className="section-forest-glow section-grain relative mt-12 flex flex-col items-start justify-between gap-5 overflow-hidden rounded-[32px] px-7 py-8 text-white tablet:flex-row tablet:items-center">
              <div>
                <p className="font-script text-2xl text-accent">конструктор</p>
                <p className="mt-1 text-xl font-bold">Нужен свой сценарий?</p>
                <p className="mt-1 text-sm text-white/65">
                  Соберите индивидуальный маршрут под даты и состав
                </p>
              </div>
              <Link
                href="/trip-builder"
                className="group inline-flex items-center gap-3 rounded-btn bg-accent px-6 py-3.5 text-sm font-semibold text-ink transition hover:bg-white"
              >
                Собрать индивидуальную поездку
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-white transition group-hover:translate-x-0.5">
                  <IconArrow size={14} />
                </span>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <TrustSection routesCount={tours.length} />
      <BenefitsSection />

      <HomeCtaBand
        title="Узнайте полную стоимость до оплаты"
        cta="Рассчитать полную стоимость"
        href="/#lead"
        tone="ink"
      />

      <SafetySection />
      <GallerySection />
      <ComparisonSection />

      <section id="reviews" className="bg-surface py-20 desktop:py-24">
        <div className="mx-auto max-w-7xl px-4 desktop:px-6">
          <Reveal>
            <SectionIntro
              tone="light"
              eyebrow="живые впечатления"
              title="Отзывы после разных маршрутов"
              subtitle="Семьи, пары и компании — разные сценарии, одна команда сопровождения."
            />
          </Reveal>
          <div className="mt-12 grid gap-5 tablet:grid-cols-3">
            {DEMO_REVIEWS.map((review, i) => (
              <Reveal key={review.id} delayMs={i * 80}>
                <article className="flex h-full flex-col rounded-[28px] bg-cream px-6 py-6 transition duration-300 hover:-translate-y-0.5 hover:shadow-soft">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={review.avatar}
                      alt=""
                      className="h-12 w-12 rounded-full object-cover ring-2 ring-accent/40"
                      onError={(e) => {
                        e.currentTarget.src =
                          '/images/placeholder-destination.svg';
                      }}
                    />
                    <div>
                      <p className="font-semibold">{review.name}</p>
                      <p className="text-xs text-text-secondary">
                        {review.route}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 inline-flex items-center gap-1 text-accent">
                    {Array.from({ length: review.rating }).map((_, idx) => (
                      <IconStar key={idx} size={13} />
                    ))}
                  </p>
                  <p className="mt-4 flex-1 text-sm leading-relaxed text-text-secondary">
                    «{review.text}»
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <LeadCaptureSection />
    </div>
  );
}
