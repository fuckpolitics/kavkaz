'use client';

import { useEffect, useState } from 'react';
import { destinationsApi } from '@/api/destinations.api';
import { toursApi } from '@/api/tours.api';
import { AppButton } from '@/components/AppButton';
import { AppInput } from '@/components/AppInput';
import { AppSelect } from '@/components/AppSelect';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { Pagination } from '@/components/Pagination';
import { SectionHeader } from '@/components/SectionHeader';
import { TourCard } from '@/components/TourCard';
import type { DestinationShortDto } from '@/types/destination';
import type { TourShortDto } from '@/types/tour';

const LIMIT = 12;

export default function ToursPage() {
  const [tours, setTours] = useState<TourShortDto[]>([]);
  const [destinations, setDestinations] = useState<DestinationShortDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [destinationId, setDestinationId] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [durationDays, setDurationDays] = useState('');

  async function load(nextPage = page) {
    setLoading(true);
    setError(null);
    try {
      const data = await toursApi.list({
        page: nextPage,
        limit: LIMIT,
        search: search || undefined,
        destinationId: destinationId || undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        durationDays: durationDays ? Number(durationDays) : undefined,
      });
      setTours(data);
      setPage(nextPage);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void destinationsApi.list({ limit: 100 }).then(setDestinations).catch(() => undefined);
    void load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 desktop:px-6">
      <SectionHeader title="Туры" subtitle="Готовые авторские маршруты" />

      <form
        className="mb-6 grid grid-cols-1 gap-3 rounded-card border border-border bg-surface p-4 tablet:grid-cols-2 desktop:grid-cols-6"
        onSubmit={(e) => {
          e.preventDefault();
          void load(1);
        }}
      >
        <AppInput
          label="Поиск"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Название тура"
        />
        <AppSelect
          label="Направление"
          value={destinationId}
          onChange={(e) => setDestinationId(e.target.value)}
          placeholder="Все"
          options={destinations.map((d) => ({ value: d.id, label: d.name }))}
        />
        <AppInput
          label="Цена от"
          type="number"
          min={0}
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
        />
        <AppInput
          label="Цена до"
          type="number"
          min={0}
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />
        <AppInput
          label="Дней"
          type="number"
          min={1}
          value={durationDays}
          onChange={(e) => setDurationDays(e.target.value)}
        />
        <div className="flex items-end">
          <AppButton type="submit" className="w-full">
            Применить
          </AppButton>
        </div>
      </form>

      {loading ? (
        <LoadingSkeleton rows={3} />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void load(page)} />
      ) : tours.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2 desktop:grid-cols-4">
            {tours.map((tour) => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>
          <Pagination
            page={page}
            hasNext={tours.length >= LIMIT}
            onChange={(p) => void load(p)}
          />
        </>
      )}
    </div>
  );
}
