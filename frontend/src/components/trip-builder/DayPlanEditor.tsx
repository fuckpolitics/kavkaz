'use client';

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  type DragEndEvent,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { DaySlot } from '@/lib/day-plan';
import {
  estimateDayMinutes,
  formatDurationMinutes,
  selectedPointsForParent,
} from '@/lib/route-time';
import type { LocationShortDto } from '@/types/location';
import { AppInput } from '../AppInput';

function SortableDayCard({
  slot,
  index,
  parentName,
  pointNames,
  durationLabel,
  dateLabel,
  canRemoveRest,
  onRemoveRest,
}: {
  slot: DaySlot;
  index: number;
  parentName?: string;
  pointNames: string[];
  durationLabel: string;
  dateLabel: string;
  canRemoveRest: boolean;
  onRemoveRest: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: slot.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isRest = slot.kind === 'rest';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-stretch gap-3 rounded-[22px] border px-3 py-3 ${
        isDragging ? 'z-10 opacity-90 shadow-card' : ''
      } ${
        isRest
          ? 'border-dashed border-accent/40 bg-accent/10'
          : 'border-white/12 bg-white/[0.05]'
      }`}
    >
      <button
        type="button"
        className="flex w-8 shrink-0 cursor-grab items-center justify-center text-white/40 active:cursor-grabbing"
        aria-label="Перетащить"
        {...attributes}
        {...listeners}
      >
        ⋮⋮
      </button>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-script text-lg text-accent">
            День {index + 1}
          </span>
          <span className="text-xs text-white/45">{dateLabel}</span>
          {isRest ? (
            <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[11px] font-medium text-accent">
              Отдых
            </span>
          ) : (
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-medium text-white/80">
              ≈ {durationLabel}
            </span>
          )}
        </div>
        <p className="mt-1 truncate text-sm font-semibold text-white">
          {isRest ? 'День без экскурсий' : parentName ?? 'Локация'}
        </p>
        {!isRest && pointNames.length > 0 ? (
          <p className="mt-1 line-clamp-2 text-xs text-white/50">
            {pointNames.join(' · ')}
          </p>
        ) : null}
        {isRest ? (
          <p className="mt-1 text-xs text-white/45">
            Свободное время, восстановление или запас под погоду
          </p>
        ) : null}
      </div>
      {isRest && canRemoveRest ? (
        <button
          type="button"
          onClick={onRemoveRest}
          className="shrink-0 self-center rounded-full px-3 py-1.5 text-xs text-white/55 transition hover:bg-white/10 hover:text-white"
        >
          Убрать
        </button>
      ) : null}
    </div>
  );
}

export function DayPlanEditor({
  startDate,
  endDate,
  slots,
  locations,
  selectedIds,
  parentCount,
  totalRouteMinutes,
  onStartDateChange,
  onEndDateChange,
  onSlotsChange,
  onAddRestDay,
}: {
  startDate: string;
  endDate: string;
  slots: DaySlot[];
  locations: LocationShortDto[];
  selectedIds: Set<string>;
  parentCount: number;
  totalRouteMinutes: number;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onSlotsChange: (slots: DaySlot[]) => void;
  onAddRestDay: () => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const nameById = new Map(locations.map((l) => [l.id, l.name]));
  const tooShort = Boolean(startDate && endDate && slots.length < parentCount);
  const restCount = slots.filter((s) => s.kind === 'rest').length;

  function dateForIndex(index: number) {
    if (!startDate) return '—';
    const d = new Date(`${startDate}T12:00:00`);
    d.setDate(d.getDate() + index);
    return d.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
    });
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = slots.findIndex((s) => s.id === active.id);
    const newIndex = slots.findIndex((s) => s.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    onSlotsChange(arrayMove(slots, oldIndex, newIndex));
  }

  return (
    <div className="space-y-6">
      <div className="grid max-w-2xl gap-4 tablet:grid-cols-2">
        <div className="[&_input]:border-white/15 [&_input]:bg-white/5 [&_input]:text-white [&_span]:text-white/70">
          <AppInput
            label="Дата начала"
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
          />
        </div>
        <div className="[&_input]:border-white/15 [&_input]:bg-white/5 [&_input]:text-white [&_span]:text-white/70">
          <AppInput
            label="Дата окончания"
            type="date"
            value={endDate}
            min={startDate || undefined}
            onChange={(e) => onEndDateChange(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-[24px] border border-white/10 bg-white/[0.03] px-5 py-4">
        <p className="text-sm text-white/70">
          Дней: <span className="font-semibold text-white">{slots.length}</span>
          {' · '}
          Локаций:{' '}
          <span className="font-semibold text-white">{parentCount}</span>
          {' · '}
          Отдыха: <span className="font-semibold text-accent">{restCount}</span>
        </p>
        <p className="mt-2 text-sm text-accent">
          Активные дни ≈ {formatDurationMinutes(totalRouteMinutes)} в дороге и
          на местах
        </p>
        <p className="mt-2 text-xs text-white/45">
          Один день = одна локация. Подлокации (храм, озеро, канатка) идут в тот
          же день. Дней не может быть меньше числа локаций.
        </p>
        {tooShort ? (
          <p className="mt-3 text-sm text-red-300">
            Увеличьте даты: нужно минимум {parentCount}{' '}
            {parentCount === 1 ? 'день' : 'дня/дней'} под выбранные локации.
          </p>
        ) : null}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={slots.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {slots.map((slot, index) => {
              const points =
                slot.kind === 'location'
                  ? selectedPointsForParent(
                      slot.locationId,
                      selectedIds,
                      locations,
                    )
                  : [];
              const dayMinutes =
                slot.kind === 'location'
                  ? estimateDayMinutes(slot.locationId, selectedIds, locations)
                  : 0;
              return (
                <SortableDayCard
                  key={slot.id}
                  slot={slot}
                  index={index}
                  parentName={
                    slot.kind === 'location'
                      ? nameById.get(slot.locationId)
                      : undefined
                  }
                  pointNames={points.map((p) => p.name)}
                  durationLabel={formatDurationMinutes(dayMinutes)}
                  dateLabel={dateForIndex(index)}
                  canRemoveRest={slots.length > parentCount}
                  onRemoveRest={() =>
                    onSlotsChange(slots.filter((s) => s.id !== slot.id))
                  }
                />
              );
            })}
          </div>
        </SortableContext>
      </DndContext>

      <button
        type="button"
        onClick={onAddRestDay}
        disabled={!startDate || parentCount === 0}
        className="rounded-btn border border-dashed border-accent/50 px-5 py-3 text-sm font-medium text-accent transition hover:bg-accent/10 disabled:opacity-40"
      >
        + Добавить день отдыха
      </button>
    </div>
  );
}
