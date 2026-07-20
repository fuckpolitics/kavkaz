'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { bookingsApi } from '@/api/bookings.api';
import { destinationsApi } from '@/api/destinations.api';
import { extraServicesApi } from '@/api/extra-services.api';
import { locationsApi } from '@/api/locations.api';
import { tripsApi } from '@/api/trips.api';
import { ApiError } from '@/api/client';
import { AppButton } from '@/components/AppButton';
import { ConsultationModal } from '@/components/ConsultationModal';
import { getBaseCity, type BaseCityId } from '@/components/map/base-cities';
import { GeoMap } from '@/components/map/GeoMap';
import { buildGeoRegions } from '@/components/map/geo-data';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { Modal } from '@/components/Modal';
import { OtpVerifyForm } from '@/components/OtpVerifyForm';
import { DayPlanEditor } from '@/components/trip-builder/DayPlanEditor';
import { ExtrasPicker } from '@/components/trip-builder/ExtrasPicker';
import { PaxStepper } from '@/components/trip-builder/PaxStepper';
import { useAuth } from '@/lib/auth-context';
import {
  addDaysIso,
  inclusiveDayCount,
  syncDaySlots,
  type DaySlot,
} from '@/lib/day-plan';
import { filterExtrasForLocations } from '@/lib/extra-services';
import { formatPrice } from '@/lib/format';
import {
  estimateDayMinutes,
  estimateRouteMinutes,
  formatDurationMinutes,
  orderedParentIds,
  selectedPointsForParent,
} from '@/lib/route-time';
import type { DestinationShortDto } from '@/types/destination';
import type { ExtraServiceDto } from '@/types/extra-service';
import type { LocationShortDto } from '@/types/location';

const STEPS = [
  { title: 'Куда хотите поехать?', short: 'Направление' },
  { title: 'Даты и программа', short: 'Программа' },
  { title: 'Участники', short: 'Участники' },
  { title: 'Дополнительные услуги', short: 'Услуги' },
  { title: 'Готово!', short: 'Готово' },
];

const NEXT_LABELS = [
  'Далее: Программа',
  'Далее: Участники',
  'Далее: Услуги',
  'Далее: Готово',
  'Отправить заявку',
];

const MUST_MATCH: Record<string, RegExp> = {
  dombay: /домбай/i,
  arkhyz: /архыз/i,
  elbrus: /эльбрус/i,
  kmv: /кисловодск|кмв|нарзан|медов|суворов/i,
};

export default function TripBuilderPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center bg-[#0B1013] text-white/60">
          Загрузка конструктора…
        </div>
      }
    >
      <TripBuilderContent />
    </Suspense>
  );
}

function TripBuilderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { applySession, isAuthenticated } = useAuth();
  const [step, setStep] = useState(0);
  const [destinations, setDestinations] = useState<DestinationShortDto[]>([]);
  const [locations, setLocations] = useState<LocationShortDto[]>([]);
  const [extras, setExtras] = useState<ExtraServiceDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  /** Selected map points (parents and/or sublocations), insertion order */
  const [orderedPointIds, setOrderedPointIds] = useState<string[]>([]);
  const [baseCityId, setBaseCityId] = useState<BaseCityId>('kislovodsk');
  const [selectedExtras, setSelectedExtras] = useState<Set<string>>(new Set());
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [daySlots, setDaySlots] = useState<DaySlot[]>([]);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [otpOpen, setOtpOpen] = useState(false);
  const [consultOpen, setConsultOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [quizApplied, setQuizApplied] = useState(false);

  const selectedPoints = useMemo(
    () => new Set(orderedPointIds),
    [orderedPointIds],
  );

  const parentIds = useMemo(
    () => orderedParentIds(orderedPointIds, locations),
    [orderedPointIds, locations],
  );

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [d, e] = await Promise.all([
          destinationsApi.list({ limit: 20 }),
          extraServicesApi.list({ limit: 100 }),
        ]);
        setDestinations(d);
        setExtras(e);
        const batches = await Promise.all(
          d.map((dest) =>
            locationsApi.list({ destinationId: dest.id, limit: 100 }),
          ),
        );
        setLocations(batches.flat());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки');
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  useEffect(() => {
    if (quizApplied || loading || locations.length === 0) return;
    const must = searchParams.get('must');
    if (!must) {
      setQuizApplied(true);
      return;
    }
    const keys = must.split(',').map((s) => s.trim()).filter(Boolean);
    const picked: string[] = [];
    for (const key of keys) {
      const re = MUST_MATCH[key];
      if (!re) continue;
      const parent = locations.find((l) => !l.parentId && re.test(l.name));
      if (parent) picked.push(parent.id);
    }
    if (picked.length > 0) {
      setOrderedPointIds(picked);
      setStep(1);
    }
    setQuizApplied(true);
  }, [loading, locations, quizApplied, searchParams]);

  const geoRegions = useMemo(
    () => buildGeoRegions(destinations, locations),
    [destinations, locations],
  );

  const selectedRegionIds = useMemo(() => {
    const ids = new Set<string>();
    for (const region of geoRegions) {
      for (const loc of region.locations) {
        if (
          selectedPoints.has(loc.id) ||
          loc.sublocations.some((s) => selectedPoints.has(s.id))
        ) {
          ids.add(region.id);
        }
      }
    }
    return ids;
  }, [geoRegions, selectedPoints]);

  const availableExtras = useMemo(
    () => filterExtrasForLocations(extras, selectedPoints, locations),
    [extras, selectedPoints, locations],
  );

  const routeMinutes = useMemo(
    () => estimateRouteMinutes(parentIds, selectedPoints, locations),
    [parentIds, selectedPoints, locations],
  );

  const extrasTotal = useMemo(
    () =>
      availableExtras
        .filter((e) => selectedExtras.has(e.id))
        .reduce((sum, e) => sum + e.price, 0),
    [availableExtras, selectedExtras],
  );

  useEffect(() => {
    const allowed = new Set(availableExtras.map((e) => e.id));
    setSelectedExtras((prev) => {
      const next = new Set([...prev].filter((id) => allowed.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [availableExtras]);

  useEffect(() => {
    if (startDate && parentIds.length > 0) {
      const minEnd = addDaysIso(startDate, parentIds.length - 1);
      setEndDate((prev) => (!prev || prev < minEnd ? minEnd : prev));
    }

    setDaySlots((prev) => {
      const minDays = Math.max(parentIds.length, 1);
      const count =
        startDate && endDate
          ? Math.max(inclusiveDayCount(startDate, endDate), minDays)
          : Math.max(minDays, prev.length || minDays);
      const next = syncDaySlots(prev, parentIds, count);
      if (
        next.length === prev.length &&
        next.every(
          (slot, i) =>
            slot.id === prev[i]?.id &&
            slot.kind === prev[i]?.kind &&
            (slot.kind !== 'location' ||
              (prev[i]?.kind === 'location' &&
                slot.locationId === prev[i].locationId)),
        )
      ) {
        return prev;
      }
      return next;
    });
  }, [parentIds, startDate, endDate]);

  function toggleLocation(id: string) {
    setOrderedPointIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      return [...prev, id];
    });
  }

  function handleStartDate(value: string) {
    setStartDate(value);
    if (!value) return;
    const minDays = Math.max(parentIds.length, daySlots.length, 1);
    const minEnd = addDaysIso(value, minDays - 1);
    setEndDate((prev) => (!prev || prev < minEnd ? minEnd : prev));
  }

  function handleEndDate(value: string) {
    if (!startDate || !value) {
      setEndDate(value);
      return;
    }
    const minEnd = addDaysIso(startDate, Math.max(parentIds.length, 1) - 1);
    setEndDate(value < minEnd ? minEnd : value);
  }

  function handleSlotsChange(next: DaySlot[]) {
    if (next.length < parentIds.length) return;
    setDaySlots(next);
    if (startDate) {
      setEndDate(addDaysIso(startDate, next.length - 1));
    }
  }

  function addRestDay() {
    if (!startDate) return;
    setDaySlots((prev) => {
      const next: DaySlot[] = [
        ...prev,
        { id: `rest-${Math.random().toString(36).slice(2, 9)}`, kind: 'rest' },
      ];
      setEndDate(addDaysIso(startDate, next.length - 1));
      return next;
    });
  }

  function canGoNext() {
    if (step === 0) return Boolean(baseCityId) && parentIds.length > 0;
    if (step === 1) {
      return (
        Boolean(startDate) &&
        Boolean(endDate) &&
        daySlots.length >= parentIds.length &&
        daySlots.length > 0
      );
    }
    return true;
  }

  function buildNotes() {
    const base = getBaseCity(baseCityId);
    return [
      base ? `База: ${base.name}` : '',
      `Оценка активных дней: ${formatDurationMinutes(routeMinutes)}`,
    ]
      .filter(Boolean)
      .join('. ');
  }

  function buildDaysPayload() {
    return daySlots.map((slot, index) => {
      if (slot.kind === 'rest') {
        return {
          isRest: true,
          title: `День ${index + 1} · отдых`,
          locationIds: [] as string[],
        };
      }
      const points = selectedPointsForParent(
        slot.locationId,
        selectedPoints,
        locations,
      );
      const parentName =
        locations.find((l) => l.id === slot.locationId)?.name ?? 'Локация';
      return {
        isRest: false,
        title: `День ${index + 1} · ${parentName}`,
        locationIds: points.map((p) => p.id),
      };
    });
  }

  function goNext() {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
      return;
    }
    if (isAuthenticated) {
      void finishAuthenticated();
      return;
    }
    setOtpOpen(true);
  }

  function routeTitle() {
    const names = geoRegions
      .filter((r) => selectedRegionIds.has(r.id))
      .map((r) => r.name);
    if (names.length === 0) return 'Мой маршрут';
    if (names.length === 1) return `Маршрут: ${names[0]}`;
    return `Маршрут: ${names.join(' → ')}`;
  }

  const payloadBase = () => ({
    title: routeTitle(),
    adults,
    children,
    startDate: startDate || null,
    endDate: endDate || null,
    locationIds: orderedPointIds,
    days: buildDaysPayload(),
    extraServiceIds: Array.from(selectedExtras),
    notes: buildNotes(),
  });

  async function finishAuthenticated() {
    setSubmitting(true);
    setError(null);
    try {
      const trip = await tripsApi.createCustom(payloadBase());
      const booking = await bookingsApi.create({ tripId: trip.id });
      router.push(`/bookings/${booking.id}`);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Не удалось отправить заявку',
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function finish(payload: {
    email?: string;
    phone?: string;
    code: string;
    firstName?: string;
  }) {
    setSubmitting(true);
    setError(null);
    try {
      const res = await bookingsApi.bookCustom({
        ...payload,
        ...payloadBase(),
      });
      applySession(res);
      setOtpOpen(false);
      router.push(`/bookings/${res.booking.id}`);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Не удалось отправить заявку',
      );
    } finally {
      setSubmitting(false);
    }
  }

  const consultContext = [
    routeTitle(),
    startDate ? `даты ${startDate}${endDate ? `–${endDate}` : ''}` : null,
    `${adults} взр.${children ? `, ${children} дет.` : ''}`,
    `локаций: ${parentIds.length}`,
  ]
    .filter(Boolean)
    .join('; ');

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#0B1013] text-[#F2EFE8]">
      <div className="mx-auto grid max-w-7xl desktop:grid-cols-[240px_1fr]">
        <aside className="border-b border-white/10 p-5 desktop:min-h-[calc(100vh-4rem)] desktop:border-b-0 desktop:border-r desktop:border-white/10">
          <p className="mb-2 text-xs uppercase tracking-[0.22em] text-[#D9C8A3]">
            Конструктор тура
          </p>
          <h1 className="mb-2 font-sans text-2xl font-semibold">сорвались</h1>
          <p className="mb-6 text-sm text-white/45">
            Локация = день. Подточки едут вместе.
          </p>
          <ol className="space-y-2.5">
            {STEPS.map((item, index) => {
              const active = step === index;
              const done = step > index;
              return (
                <li key={item.short}>
                  <button
                    type="button"
                    onClick={() => setStep(index)}
                    className={`flex w-full items-center gap-3 rounded-full px-3 py-2 text-left transition ${
                      active
                        ? 'bg-[#D9C8A3] text-[#0B1013]'
                        : 'text-white/55 hover:bg-white/5'
                    }`}
                  >
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs ${
                        active
                          ? 'border-[#0B1013]/20 bg-[#0B1013] text-[#D9C8A3]'
                          : done
                            ? 'border-[#1E3D2F] bg-[#1E3D2F] text-white'
                            : 'border-white/25'
                      }`}
                    >
                      {done && !active ? '✓' : index + 1}
                    </span>
                    <span className="text-sm leading-snug">{item.short}</span>
                  </button>
                </li>
              );
            })}
          </ol>
          <button
            type="button"
            onClick={() => setConsultOpen(true)}
            className="mt-8 w-full rounded-btn border border-white/20 px-4 py-2.5 text-sm text-white/80 transition hover:bg-white/10"
          >
            Нужна консультация
          </button>
        </aside>

        <div className="relative grid min-h-[70vh] desktop:grid-cols-[1fr_300px]">
          <div className="flex flex-col p-5 desktop:p-8">
            {error ? (
              <p className="mb-4 rounded-xl bg-red-500/15 px-3 py-2 text-sm text-red-200">
                {error}
              </p>
            ) : null}

            <div className="mb-5">
              <p className="text-sm text-white/50">
                Шаг {step + 1} из {STEPS.length}
              </p>
              <h2 className="mt-1 font-sans text-3xl font-bold tablet:text-4xl">
                {STEPS[step].title}
              </h2>
            </div>

            <div key={step} className="animate-fade-up flex-1">
              {step === 0 ? (
                <div className="space-y-2">
                  {loading ? (
                    <LoadingSkeleton rows={3} />
                  ) : (
                    <GeoMap
                      regions={geoRegions}
                      selectedIds={selectedPoints}
                      onToggle={toggleLocation}
                      baseCityId={baseCityId}
                      onBaseCityChange={setBaseCityId}
                      dark
                    />
                  )}
                </div>
              ) : null}

              {step === 1 ? (
                <DayPlanEditor
                  startDate={startDate}
                  endDate={endDate}
                  slots={daySlots}
                  locations={locations}
                  selectedIds={selectedPoints}
                  parentCount={parentIds.length}
                  totalRouteMinutes={routeMinutes}
                  onStartDateChange={handleStartDate}
                  onEndDateChange={handleEndDate}
                  onSlotsChange={handleSlotsChange}
                  onAddRestDay={addRestDay}
                />
              ) : null}

              {step === 2 ? (
                <div className="grid max-w-lg gap-4">
                  <PaxStepper
                    label="Взрослые"
                    value={adults}
                    min={1}
                    onChange={setAdults}
                    hint="От 1 человека"
                  />
                  <PaxStepper
                    label="Дети"
                    value={children}
                    min={0}
                    onChange={setChildren}
                    hint="До 12 лет — уточним кресла у координатора"
                  />
                </div>
              ) : null}

              {step === 3 ? (
                <div className="space-y-6">
                  <ExtrasPicker
                    extras={availableExtras}
                    locations={locations}
                    selectedIds={selectedExtras}
                    onToggle={(id) =>
                      setSelectedExtras((prev) => {
                        const next = new Set(prev);
                        if (next.has(id)) next.delete(id);
                        else next.add(id);
                        return next;
                      })
                    }
                  />
                  {selectedExtras.size > 0 ? (
                    <div className="sticky bottom-20 rounded-[22px] border border-accent/30 bg-ink/90 px-5 py-4 backdrop-blur desktop:bottom-4">
                      <p className="text-sm text-white/70">
                        Выбрано услуг: {selectedExtras.size}
                      </p>
                      <p className="text-xl font-bold text-accent">
                        от {formatPrice(extrasTotal)}
                      </p>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {step === 4 ? (
                <div className="space-y-3">
                  {daySlots.map((slot, index) => {
                    const parentName =
                      slot.kind === 'location'
                        ? locations.find((l) => l.id === slot.locationId)?.name
                        : null;
                    const points =
                      slot.kind === 'location'
                        ? selectedPointsForParent(
                            slot.locationId,
                            selectedPoints,
                            locations,
                          )
                        : [];
                    const minutes =
                      slot.kind === 'location'
                        ? estimateDayMinutes(
                            slot.locationId,
                            selectedPoints,
                            locations,
                          )
                        : 0;
                    return (
                      <div
                        key={slot.id}
                        className={`rounded-[20px] border px-4 py-3 ${
                          slot.kind === 'rest'
                            ? 'border-dashed border-accent/40 bg-accent/10'
                            : 'border-white/12 bg-white/[0.04]'
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-xs text-white/45">
                            День {index + 1}
                          </p>
                          {slot.kind === 'location' ? (
                            <p className="text-xs text-accent">
                              ≈ {formatDurationMinutes(minutes)}
                            </p>
                          ) : null}
                        </div>
                        <p className="font-semibold">
                          {slot.kind === 'rest'
                            ? 'День отдыха'
                            : parentName ?? 'Локация'}
                        </p>
                        {points.length > 0 ? (
                          <p className="mt-1 text-xs text-white/50">
                            {points.map((p) => p.name).join(' · ')}
                          </p>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
              <AppButton
                variant="ghost"
                disabled={step === 0}
                onClick={() => setStep((s) => Math.max(0, s - 1))}
              >
                Назад
              </AppButton>
              <div className="flex flex-wrap gap-2">
                <AppButton
                  variant="ghost"
                  onClick={() => setConsultOpen(true)}
                >
                  Консультация
                </AppButton>
                <AppButton
                  variant="accent"
                  size="lg"
                  disabled={!canGoNext() || submitting}
                  loading={submitting}
                  onClick={() => goNext()}
                >
                  {NEXT_LABELS[step]}
                </AppButton>
              </div>
            </div>
          </div>

          {/* Live preview — desktop */}
          <aside className="hidden border-l border-white/10 bg-white/[0.02] p-5 desktop:block">
            <p className="font-script text-2xl text-accent">живой маршрут</p>
            <p className="mt-1 text-sm text-white/50">
              Меняется вместе с вашими выборами
            </p>
            <div className="mt-5 space-y-3 text-sm">
              <div className="rounded-[18px] border border-white/10 px-4 py-3">
                <p className="text-white/45">База</p>
                <p className="font-medium">
                  {getBaseCity(baseCityId)?.name ?? '—'}
                </p>
              </div>
              <div className="rounded-[18px] border border-white/10 px-4 py-3">
                <p className="text-white/45">Активное время</p>
                <p className="text-lg font-semibold text-accent">
                  ≈ {formatDurationMinutes(routeMinutes)}
                </p>
                <p className="mt-1 text-xs text-white/40">
                  дорога туда-обратно + время на точках
                </p>
              </div>
              <div className="rounded-[18px] border border-white/10 px-4 py-3">
                <p className="text-white/45">Программа</p>
                <p className="font-medium">
                  {daySlots.length || '—'} дн. · {parentIds.length} локац. ·{' '}
                  {daySlots.filter((s) => s.kind === 'rest').length} отдых
                </p>
              </div>
              {selectedExtras.size > 0 ? (
                <div className="rounded-[18px] border border-white/10 px-4 py-3">
                  <p className="text-white/45">Услуги</p>
                  <p className="font-medium">
                    {selectedExtras.size} · от {formatPrice(extrasTotal)}
                  </p>
                </div>
              ) : null}
            </div>
            <ul className="mt-5 max-h-[40vh] space-y-2 overflow-y-auto text-xs text-white/60">
              {daySlots.map((slot, index) => (
                <li key={slot.id} className="flex justify-between gap-2">
                  <span>
                    {index + 1}.{' '}
                    {slot.kind === 'rest'
                      ? 'Отдых'
                      : locations.find((l) => l.id === slot.locationId)?.name}
                  </span>
                  {slot.kind === 'location' ? (
                    <span className="shrink-0 text-accent">
                      {formatDurationMinutes(
                        estimateDayMinutes(
                          slot.locationId,
                          selectedPoints,
                          locations,
                        ),
                      )}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>

      <Modal
        open={otpOpen}
        title="Подтвердите заявку"
        onClose={() => setOtpOpen(false)}
      >
        <OtpVerifyForm
          submitLabel="Отправить заявку"
          onVerified={(payload) => finish(payload)}
        />
      </Modal>

      <ConsultationModal
        open={consultOpen}
        onClose={() => setConsultOpen(false)}
        context={consultContext}
      />
    </div>
  );
}
