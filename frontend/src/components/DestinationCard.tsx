import Link from 'next/link';
import type { DestinationShortDto } from '@/types/destination';
import { formatPrice, pluralizeTours, resolveImageUrl } from '@/lib/format';

export function DestinationCard({
  destination,
}: {
  destination: DestinationShortDto;
}) {
  const image = resolveImageUrl(
    destination.coverImage?.url,
    '/images/placeholder-destination.svg',
  );

  return (
    <Link
      href={`/destinations/${destination.id}`}
      className="group relative block aspect-[5/6] overflow-hidden rounded-[26px] shadow-soft transition duration-300 hover:-translate-y-1"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image}
        alt={destination.name}
        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/25 to-transparent transition group-hover:from-ink/90" />
      <div className="absolute inset-x-0 bottom-0 p-4 text-white">
        <h3 className="text-xl font-semibold leading-tight">{destination.name}</h3>
        <div className="mt-2 flex items-end justify-between gap-2 text-sm text-white/90">
          <span className="font-medium">
            {destination.minTourPrice != null
              ? `от ${formatPrice(destination.minTourPrice)}`
              : 'Цены уточняйте'}
          </span>
          <span className="rounded-full bg-white/15 px-2.5 py-1 text-xs backdrop-blur">
            {pluralizeTours(destination.tourCount ?? 0)}
          </span>
        </div>
      </div>
    </Link>
  );
}

export function DestinationCtaCard() {
  return (
    <Link
      href="/trip-builder"
      className="group relative flex aspect-[5/6] flex-col justify-between overflow-hidden rounded-[26px] bg-forest p-5 text-white shadow-soft transition duration-300 hover:-translate-y-1 hover:bg-forest-light"
    >
      <div>
        <p className="text-sm text-accent">Не знаете куда?</p>
        <h3 className="mt-2 text-2xl font-semibold leading-tight">
          Создайте свой маршрут
        </h3>
        <p className="mt-3 text-sm text-white/70">
          База, точки и комфорт — за несколько шагов
        </p>
      </div>
      <span className="inline-flex w-fit items-center rounded-full bg-accent px-4 py-2 text-sm font-semibold text-ink transition group-hover:translate-x-0.5">
        Открыть конструктор →
      </span>
    </Link>
  );
}
