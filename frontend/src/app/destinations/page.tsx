'use client';

import { useEffect, useState } from 'react';
import { destinationsApi } from '@/api/destinations.api';
import { DestinationCard } from '@/components/DestinationCard';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { SectionHeader } from '@/components/SectionHeader';
import type { DestinationShortDto } from '@/types/destination';

export default function DestinationsPage() {
  const [items, setItems] = useState<DestinationShortDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setItems(await destinationsApi.list({ limit: 50 }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 desktop:px-6">
      <SectionHeader title="Направления" subtitle="Регионы Кавказа для путешествий" />
      {loading ? (
        <LoadingSkeleton rows={3} />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : items.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2 desktop:grid-cols-4">
          {items.map((d) => (
            <DestinationCard key={d.id} destination={d} />
          ))}
        </div>
      )}
    </div>
  );
}
