'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { destinationsApi } from '@/api/destinations.api';
import { toursApi } from '@/api/tours.api';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { SectionHeader } from '@/components/SectionHeader';
import { TourCard } from '@/components/TourCard';
import { resolveImageUrl } from '@/lib/format';
import type { DestinationDto } from '@/types/destination';
import type { TourShortDto } from '@/types/tour';

export default function DestinationDetailPage() {
  const params = useParams<{ id: string }>();
  const [destination, setDestination] = useState<DestinationDto | null>(null);
  const [tours, setTours] = useState<TourShortDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [d, t] = await Promise.all([
        destinationsApi.get(params.id),
        toursApi.list({ destinationId: params.id, limit: 50 }),
      ]);
      setDestination(d);
      setTours(t);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  if (loading) return <LoadingSkeleton rows={4} />;
  if (error) return <ErrorState message={error} onRetry={() => void load()} />;
  if (!destination) return <EmptyState title="Направление не найдено" />;

  const image = resolveImageUrl(
    destination.coverImage?.url,
    '/images/placeholder-destination.svg',
  );

  return (
    <div>
      <div className="relative h-64 overflow-hidden tablet:h-80">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt={destination.name} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-primary/50" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-4 pb-8 text-white desktop:px-6">
          <h1 className="text-3xl font-bold tablet:text-4xl">{destination.name}</h1>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-8 desktop:px-6">
        <p className="max-w-3xl leading-relaxed text-text-secondary">
          {destination.description}
        </p>
        <div className="mt-10">
          <SectionHeader
            title="Туры направления"
            action={
              <Link href="/tours" className="text-sm text-primary underline">
                Все туры
              </Link>
            }
          />
          {tours.length === 0 ? (
            <EmptyState title="Туры не найдены" />
          ) : (
            <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2 desktop:grid-cols-4">
              {tours.map((tour) => (
                <TourCard key={tour.id} tour={tour} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
