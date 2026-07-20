'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { bookingsApi } from '@/api/bookings.api';
import { extraServicesApi } from '@/api/extra-services.api';
import { locationsApi } from '@/api/locations.api';
import { tripsApi } from '@/api/trips.api';
import { ApiError } from '@/api/client';
import { AppButton } from '@/components/AppButton';
import { AppInput } from '@/components/AppInput';
import { AppSelect } from '@/components/AppSelect';
import { AppTextarea } from '@/components/AppTextarea';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { ExtraServiceCard } from '@/components/ExtraServiceCard';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { Modal } from '@/components/Modal';
import { StatusBadge } from '@/components/StatusBadge';
import { TripDayEditor } from '@/components/TripDayEditor';
import { filterExtrasForLocations } from '@/lib/extra-services';
import { RequireAuth } from '@/lib/require-auth';
import { formatPrice } from '@/lib/format';
import type { ExtraServiceDto } from '@/types/extra-service';
import type { LocationShortDto } from '@/types/location';
import type { TripDto } from '@/types/trip';

function TripDetailContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [trip, setTrip] = useState<TripDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);

  const [locationModalDayId, setLocationModalDayId] = useState<string | null>(null);
  const [locations, setLocations] = useState<LocationShortDto[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState('');
  const [allExtras, setAllExtras] = useState<ExtraServiceDto[]>([]);
  const [bookingComment, setBookingComment] = useState('');

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await tripsApi.get(params.id);
      setTrip(data);
      setTitle(data.title);
      setStartDate(data.startDate ?? '');
      setEndDate(data.endDate ?? '');
      setNotes(data.notes ?? '');
      setAdults(data.adults);
      setChildren(data.children);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    void extraServicesApi.list({ limit: 100 }).then(setAllExtras).catch(() => undefined);
    void locationsApi.list({ limit: 100 }).then(setLocations).catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const tripLocationIds = useMemo(() => {
    const ids = new Set<string>();
    for (const day of trip?.days ?? []) {
      for (const dayLoc of day.locations ?? []) {
        if (dayLoc.location?.id) ids.add(dayLoc.location.id);
      }
    }
    return ids;
  }, [trip]);

  const availableExtras = useMemo(
    () => filterExtrasForLocations(allExtras, tripLocationIds, locations),
    [allExtras, tripLocationIds, locations],
  );

  async function saveMeta(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const updated = await tripsApi.update(params.id, {
        title,
        startDate: startDate || null,
        endDate: endDate || null,
        notes: notes || null,
        adults,
        children,
      });
      setTrip(updated);
      setMessage('Изменения сохранены');
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : 'Ошибка сохранения');
    } finally {
      setBusy(false);
    }
  }

  async function openLocationModal(dayId: string) {
    setLocationModalDayId(dayId);
    setSelectedLocationId('');
    try {
      setLocations(await locationsApi.list({ limit: 100 }));
    } catch {
      setLocations([]);
    }
  }

  async function createBooking() {
    setBusy(true);
    setMessage(null);
    try {
      const booking = await bookingsApi.create({
        tripId: params.id,
        comment: bookingComment || undefined,
      });
      router.push(`/bookings/${booking.id}`);
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : 'Ошибка бронирования');
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <LoadingSkeleton rows={5} />;
  if (error) return <ErrorState message={error} onRetry={() => void load()} />;
  if (!trip) return <EmptyState title="Поездка не найдена" />;

  const editable = trip.status === 'DRAFT' || trip.status === 'READY_FOR_BOOKING';
  const selectedExtraIds = new Set(trip.extraServices.map((e) => e.extraService.id));

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 desktop:px-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">{trip.title}</h1>
          <div className="mt-2">
            <StatusBadge status={trip.status} />
          </div>
        </div>
        <p className="text-2xl font-bold text-primary">
          {formatPrice(trip.estimatedPrice)}
        </p>
      </div>

      {message ? <p className="mb-4 text-sm text-text-secondary">{message}</p> : null}

      <form
        onSubmit={saveMeta}
        className="mb-8 grid gap-3 rounded-card border border-border bg-surface p-4 tablet:grid-cols-2"
      >
        <AppInput
          label="Название"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={!editable}
        />
        <AppInput
          label="Взрослые"
          type="number"
          min={1}
          value={adults}
          onChange={(e) => setAdults(Number(e.target.value))}
          disabled={!editable}
        />
        <AppInput
          label="Дети"
          type="number"
          min={0}
          value={children}
          onChange={(e) => setChildren(Number(e.target.value))}
          disabled={!editable}
        />
        <AppInput
          label="Дата начала"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          disabled={!editable}
        />
        <AppInput
          label="Дата окончания"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          disabled={!editable}
        />
        <div className="tablet:col-span-2">
          <AppTextarea
            label="Заметки"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={!editable}
          />
        </div>
        {editable ? (
          <div className="tablet:col-span-2">
            <AppButton type="submit" loading={busy}>
              Сохранить параметры
            </AppButton>
          </div>
        ) : null}
      </form>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Дни поездки</h2>
        {editable ? (
          <AppButton
            size="sm"
            variant="secondary"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await tripsApi.addDay(trip.id, {
                  title: `День ${(trip.days?.length ?? 0) + 1}`,
                });
                await load();
              } catch (err) {
                setMessage(err instanceof ApiError ? err.message : 'Ошибка');
              } finally {
                setBusy(false);
              }
            }}
          >
            Добавить день
          </AppButton>
        ) : null}
      </div>

      <div className="space-y-4">
        {trip.days.length === 0 ? (
          <EmptyState title="Дней пока нет" />
        ) : (
          trip.days.map((day, index) => (
            <TripDayEditor
              key={day.id}
              day={day}
              isFirst={index === 0}
              isLast={index === trip.days.length - 1}
              busy={busy || !editable}
              onSave={async (data) => {
                await tripsApi.updateDay(day.id, data);
                await load();
              }}
              onDelete={async () => {
                await tripsApi.removeDay(day.id);
                await load();
              }}
              onAddLocation={() => void openLocationModal(day.id)}
              onRemoveLocation={async (id) => {
                await tripsApi.removeLocation(id);
                await load();
              }}
              onReorderLocation={async (id, order) => {
                await tripsApi.updateLocation(id, { order });
                await load();
              }}
            />
          ))
        )}
      </div>

      <div className="mt-10">
        <h2 className="mb-4 text-2xl font-bold">Дополнительные услуги</h2>
        <div className="grid gap-3 tablet:grid-cols-2">
          {availableExtras.map((service) => {
            const selected = selectedExtraIds.has(service.id);
            const existing = trip.extraServices.find(
              (e) => e.extraService.id === service.id,
            );
            return (
              <ExtraServiceCard
                key={service.id}
                service={service}
                selected={selected}
                onToggle={
                  editable
                    ? async () => {
                        setBusy(true);
                        try {
                          if (selected && existing) {
                            await tripsApi.removeExtraService(existing.id);
                          } else {
                            await tripsApi.addExtraService(trip.id, {
                              extraServiceId: service.id,
                            });
                          }
                          await load();
                        } catch (err) {
                          setMessage(
                            err instanceof ApiError ? err.message : 'Ошибка',
                          );
                        } finally {
                          setBusy(false);
                        }
                      }
                    : undefined
                }
              />
            );
          })}
        </div>
      </div>

      {editable ? (
        <div className="mt-10 rounded-card border border-border bg-surface p-5 shadow-card">
          <h2 className="text-xl font-bold">Бронирование</h2>
          <p className="mt-2 text-sm text-text-secondary">
            Booking создаёт неизменяемый снимок поездки.
          </p>
          <div className="mt-3">
            <AppTextarea
              label="Комментарий"
              value={bookingComment}
              onChange={(e) => setBookingComment(e.target.value)}
            />
          </div>
          <AppButton className="mt-4" loading={busy} onClick={() => void createBooking()}>
            Забронировать
          </AppButton>
        </div>
      ) : null}

      <Modal
        open={Boolean(locationModalDayId)}
        title="Добавить локацию"
        onClose={() => setLocationModalDayId(null)}
      >
        <AppSelect
          label="Локация"
          value={selectedLocationId}
          onChange={(e) => setSelectedLocationId(e.target.value)}
          placeholder="Выберите локацию"
          options={locations.map((l) => ({ value: l.id, label: l.name }))}
        />
        <AppButton
          className="mt-4 w-full"
          disabled={!selectedLocationId || !locationModalDayId}
          loading={busy}
          onClick={async () => {
            if (!locationModalDayId || !selectedLocationId) return;
            setBusy(true);
            try {
              await tripsApi.addLocation(locationModalDayId, {
                locationId: selectedLocationId,
              });
              setLocationModalDayId(null);
              await load();
            } catch (err) {
              setMessage(err instanceof ApiError ? err.message : 'Ошибка');
            } finally {
              setBusy(false);
            }
          }}
        >
          Добавить
        </AppButton>
      </Modal>
    </div>
  );
}

export default function TripDetailPage() {
  return (
    <RequireAuth>
      <TripDetailContent />
    </RequireAuth>
  );
}
