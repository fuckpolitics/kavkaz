import Link from 'next/link';
import type { TourShortDto } from '@/types/tour';
import { formatPrice, resolveImageUrl } from '@/lib/format';
import { IconArrow, IconStar } from './icons';

function badgeFor(tour: TourShortDto): string | null {
  if (tour.durationDays >= 3) return 'Хит';
  if (tour.durationDays === 1) return 'Новый';
  return 'Популярный';
}

export function TourCard({ tour }: { tour: TourShortDto }) {
  const image = resolveImageUrl(
    tour.coverImage?.url,
    '/images/placeholder-tour.svg',
  );
  const nights = Math.max(tour.durationDays - 1, 0);
  const badge = badgeFor(tour);

  return (
    <Link
      href={`/tours/${tour.id}`}
      className="group flex w-[270px] shrink-0 snap-start flex-col overflow-hidden rounded-[26px] bg-surface shadow-card transition duration-300 hover:-translate-y-1 tablet:w-auto"
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt={tour.title}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/25 to-transparent" />
        {badge ? (
          <div className="absolute left-3 top-3">
            <span className="rounded-full bg-accent px-2.5 py-1 text-[11px] font-semibold text-ink">
              {badge}
            </span>
          </div>
        ) : null}
        <div className="absolute inset-x-0 bottom-0 p-4 text-white">
          <p className="text-xs text-white/75">{tour.destination.name}</p>
          <h3 className="mt-1 line-clamp-2 text-lg font-semibold leading-snug">
            {tour.title}
          </h3>
          <p className="mt-2 text-xs text-white/70">
            {tour.durationDays} дн.
            {nights > 0 ? ` / ${nights} ноч.` : ''}
            {' · '}
            группа до 8
          </p>
          <div className="mt-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">от {formatPrice(tour.price)}</p>
              <p className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-accent">
                <IconStar size={11} /> 5.0
              </p>
            </div>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-forest transition group-hover:translate-x-0.5">
              <IconArrow size={16} />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
