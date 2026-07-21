'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { bookingsApi } from '@/api/bookings.api';
import { destinationsApi } from '@/api/destinations.api';
import { locationsApi } from '@/api/locations.api';
import { toursApi } from '@/api/tours.api';
import { tripsApi } from '@/api/trips.api';
import { ApiError } from '@/api/client';
import { AppButton } from '@/components/AppButton';
import { ConsultationModal } from '@/components/ConsultationModal';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { ExtraServiceCard } from '@/components/ExtraServiceCard';
import { type BaseCityId, getBaseCity } from '@/components/map/base-cities';
import { GeoMap } from '@/components/map/GeoMap';
import { buildGeoRegions } from '@/components/map/geo-data';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { Modal } from '@/components/Modal';
import { OtpVerifyForm } from '@/components/OtpVerifyForm';
import { TourGallery } from '@/components/TourGallery';
import { TourProgram } from '@/components/TourProgram';
import { PaxStepper } from '@/components/trip-builder/PaxStepper';
import { useAuth } from '@/lib/auth-context';
import { formatPrice } from '@/lib/format';
import { MAX_GROUP_SEATS, payingSeats } from '@/lib/pricing';
import type { DestinationShortDto } from '@/types/destination';
import type { LocationShortDto } from '@/types/location';
import type { TourDto } from '@/types/tour';

export default function TourDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { isAuthenticated, applySession } = useAuth();
  const [tour, setTour] = useState<TourDto | null>(null);
  const [destinations, setDestinations] = useState<DestinationShortDto[]>([]);
  const [locations, setLocations] = useState<LocationShortDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [otpOpen, setOtpOpen] = useState(false);
  const [consultOpen, setConsultOpen] = useState(false);
  const [baseCityId, setBaseCityId] = useState<BaseCityId>('kislovodsk');
  const [selectedExtras, setSelectedExtras] = useState<Set<string>>(new Set());
  const [selectedLocations, setSelectedLocations] = useState<Set<string>>(
    new Set(),
  );
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [t, dests] = await Promise.all([
        toursApi.get(params.id),
        destinationsApi.list({ limit: 20 }),
      ]);
      setTour(t);
      setDestinations(dests);

      const parentIds = new Set(
        t.days.flatMap((d) => d.locations.map((l) => l.location.id)),
      );
      // Load locations for every destination so multi-region tours work later.
      const batches = await Promise.all(
        dests.map((d) =>
          locationsApi.list({ destinationId: d.id, limit: 100 }),
        ),
      );
      const allLocs = batches.flat();
      setLocations(allLocs);

      const initial = new Set<string>(parentIds);
      for (const loc of allLocs) {
        if (loc.parentId && parentIds.has(loc.parentId)) {
          initial.add(loc.id);
        }
      }
      setSelectedLocations(initial);
      setSelectedExtras(new Set(t.extraServices.map((e) => e.extraService.id)));
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

  const tourParentIds = useMemo(() => {
    if (!tour) return new Set<string>();
    return new Set(
      tour.days.flatMap((d) => d.locations.map((l) => l.location.id)),
    );
  }, [tour]);

  const tourSublocationIds = useMemo(() => {
    const ids = new Set<string>();
    for (const loc of locations) {
      if (loc.parentId && tourParentIds.has(loc.parentId)) {
        ids.add(loc.id);
      }
    }
    return ids;
  }, [locations, tourParentIds]);

  const geoRegions = useMemo(() => {
    const regions = buildGeoRegions(destinations, locations);
    // Only locations that belong to this tour (and their sublocations).
    return regions
      .map((r) => ({
        ...r,
        locations: r.locations.filter((l) => tourParentIds.has(l.id)),
      }))
      .filter((r) => r.locations.length > 0);
  }, [destinations, locations, tourParentIds]);

  const priceEstimate = useMemo(() => {
    if (!tour) {
      return {
        seats: 1,
        seatUnit: 0,
        programTotal: 0,
        extrasTotal: 0,
        total: 0,
      };
    }
    const seats = payingSeats(adults, children);
    const extrasTotal = tour.extraServices
      .filter((e) => selectedExtras.has(e.extraService.id))
      .reduce((sum, e) => sum + e.price, 0);
    const seatUnit = tour.price;
    const programTotal = seatUnit * seats;
    return {
      seats,
      seatUnit,
      programTotal,
      extrasTotal,
      total: programTotal + extrasTotal,
    };
  }, [tour, selectedExtras, adults, children]);

  const overGroupLimit = priceEstimate.seats > MAX_GROUP_SEATS;

  function toggleLocation(id: string) {
    if (!tourSublocationIds.has(id)) return;
    setSelectedLocations((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleExtra(id: string) {
    setSelectedExtras((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function submitBooking(contact?: {
    email?: string;
    phone?: string;
    code: string;
    firstName?: string;
  }) {
    if (!tour) return;
    const locationIds = Array.from(selectedLocations);
    const extraServiceIds = Array.from(selectedExtras);
    const baseName = getBaseCity(baseCityId)?.name;
    const comment = baseName ? `База: ${baseName}` : undefined;

    if (!contact && !isAuthenticated) {
      setOtpOpen(true);
      return;
    }

    setBooking(true);
    setActionError(null);
    try {
      if (contact) {
        const res = await bookingsApi.bookFromTour({
          tourId: tour.id,
          ...contact,
          adults,
          children,
          locationIds,
          extraServiceIds,
          comment,
        });
        applySession(res);
        router.push(`/bookings/${res.booking.id}`);
        return;
      }

      const trip = await tripsApi.createFromTour(tour.id, {
        adults,
        children,
        locationIds,
        extraServiceIds,
      });
      const bookingDto = await bookingsApi.create({
        tripId: trip.id,
        comment,
      });
      router.push(`/bookings/${bookingDto.id}`);
    } catch (e) {
      setActionError(
        e instanceof ApiError
          ? e.message
          : e instanceof Error
            ? e.message
            : 'Ошибка бронирования',
      );
    } finally {
      setBooking(false);
    }
  }

  if (loading) return <LoadingSkeleton rows={5} />;
  if (error) return <ErrorState message={error} onRetry={() => void load()} />;
  if (!tour) return <EmptyState title="Тур не найден" />;

  const nights = Math.max(tour.durationDays - 1, 0);
  const chips = [
    `${tour.durationDays} дн.${nights ? ` / ${nights} ноч.` : ''}`,
    'группа до 8',
    'трансфер',
    'питание по программе',
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 pb-28 desktop:px-6 desktop:pb-8">
      <Link
        href="/tours"
        className="mb-4 inline-block text-sm text-text-secondary hover:text-forest"
      >
        ← К списку туров
      </Link>

      <div className="grid gap-8 desktop:grid-cols-[1fr_340px]">
        <div>
          <TourGallery coverImage={tour.coverImage} title={tour.title} />
          <div className="mt-6">
            <p className="text-sm text-text-secondary">{tour.destination.name}</p>
            <h1 className="mt-1 text-3xl font-bold">{tour.title}</h1>
            <div className="mt-3 flex flex-wrap gap-2 text-sm">
              {chips.map((chip) => (
                <span
                  key={chip}
                  className="rounded-full bg-black/[0.04] px-3 py-1 text-text-secondary"
                >
                  {chip}
                </span>
              ))}
            </div>
            <p className="mt-5 leading-relaxed text-text-secondary">
              {tour.description}
            </p>
          </div>

          <div className="mt-10">
            <h2 className="mb-4 text-2xl font-bold">Программа</h2>
            <TourProgram days={tour.days} />
          </div>

          {tour.extraServices.length > 0 ? (
            <div className="mt-10">
              <h2 className="mb-2 text-2xl font-bold">Дополнительные услуги</h2>
              <p className="mb-4 text-sm text-text-secondary">
                Можно уточнить услуги перед бронированием.
              </p>
              <div className="grid gap-3 tablet:grid-cols-2">
                {tour.extraServices.map((s) => (
                  <ExtraServiceCard
                    key={s.id}
                    service={s.extraService}
                    price={s.price}
                    selected={selectedExtras.has(s.extraService.id)}
                    onToggle={() => toggleExtra(s.extraService.id)}
                  />
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-10">
            <h2 className="mb-2 text-2xl font-bold">Уточнение маршрута</h2>
            <p className="mb-4 text-sm text-text-secondary">
              Можно включать и выключать только подточки этого тура. Карту
              можно перетаскивать.
            </p>
            <GeoMap
              regions={geoRegions}
              selectedIds={selectedLocations}
              onToggle={toggleLocation}
              baseCityId={baseCityId}
              onBaseCityChange={setBaseCityId}
              allowedToggleIds={tourSublocationIds}
              toggleKinds={['sublocation']}
              variant="tour"
            />
          </div>
        </div>

        <aside className="desktop:sticky desktop:top-24 desktop:self-start">
          <div className="rounded-[24px] border border-border bg-surface p-5 shadow-card">
            <p className="text-sm text-text-secondary">Стоимость</p>
            <p className="mt-1 text-3xl font-bold text-forest">
              {formatPrice(priceEstimate.total)}
            </p>
            <p className="mt-1 text-sm text-text-secondary">
              {formatPrice(priceEstimate.seatUnit)} / место ×{' '}
              {priceEstimate.seats}
              {priceEstimate.extrasTotal > 0
                ? ` + услуги ${formatPrice(priceEstimate.extrasTotal)}`
                : ''}
            </p>

            <div className="mt-5 grid gap-3">
              <PaxStepper
                variant="light"
                label="Взрослые"
                value={adults}
                min={1}
                max={MAX_GROUP_SEATS}
                onChange={(value) => {
                  setAdults(value);
                  setChildren((c) => Math.min(c, Math.max(0, MAX_GROUP_SEATS - value)));
                }}
                hint="Цена за каждое место в группе"
              />
              <PaxStepper
                variant="light"
                label="Дети"
                value={children}
                min={0}
                max={Math.max(0, MAX_GROUP_SEATS - adults)}
                onChange={setChildren}
                hint="До 12 лет — тоже место"
              />
            </div>
            {overGroupLimit ? (
              <p className="mt-3 text-sm text-amber-700">
                Группа больше {MAX_GROUP_SEATS} человек — менеджер уточнит формат.
              </p>
            ) : null}

            {actionError ? (
              <p className="mt-3 text-sm text-danger">{actionError}</p>
            ) : null}
            <div className="mt-5 space-y-2">
              <AppButton
                className="w-full"
                loading={booking}
                onClick={() => void submitBooking()}
              >
                Забронировать
              </AppButton>
              <AppButton
                className="w-full"
                variant="secondary"
                onClick={() => setConsultOpen(true)}
              >
                Заказать консультацию
              </AppButton>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-text-secondary">
              Заявка без оплаты онлайн — менеджер подтвердит детали. Входные
              билеты и канатные дороги оплачиваются отдельно.
            </p>
          </div>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-[calc(3.5rem+env(safe-area-inset-bottom))] z-30 border-t border-border bg-surface/95 p-3 backdrop-blur tablet:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-text-secondary">
              {priceEstimate.seats} мест
            </p>
            <p className="truncate font-semibold text-forest">
              {formatPrice(priceEstimate.total)}
            </p>
          </div>
          <AppButton
            className="shrink-0"
            variant="secondary"
            onClick={() => setConsultOpen(true)}
          >
            Консультация
          </AppButton>
          <AppButton
            className="shrink-0"
            loading={booking}
            onClick={() => void submitBooking()}
          >
            Бронь
          </AppButton>
        </div>
      </div>

      <Modal
        open={otpOpen}
        title="Подтвердите заявку"
        onClose={() => setOtpOpen(false)}
      >
        <p className="mb-4 text-sm text-text-secondary">
          Укажите email или телефон — пришлём код. Регистрация и пароль не
          нужны.
        </p>
        <OtpVerifyForm
          submitLabel="Отправить заявку"
          onVerified={async (payload) => {
            await submitBooking(payload);
            setOtpOpen(false);
          }}
        />
      </Modal>

      <ConsultationModal
        open={consultOpen}
        onClose={() => setConsultOpen(false)}
        context={tour ? `Тур: ${tour.title}` : undefined}
      />
    </div>
  );
}
