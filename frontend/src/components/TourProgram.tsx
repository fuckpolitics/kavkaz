import type { TourDayDto } from '@/types/tour';

export function TourProgram({ days }: { days: TourDayDto[] }) {
  if (!days.length) {
    return (
      <p className="text-text-secondary">Программа тура пока не заполнена.</p>
    );
  }

  return (
    <div className="space-y-4">
      {days
        .slice()
        .sort((a, b) => a.dayNumber - b.dayNumber)
        .map((day) => (
          <article
            key={day.id}
            className="rounded-card border border-border bg-surface p-4 shadow-soft"
          >
            <div className="mb-2 flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
                {day.dayNumber}
              </span>
              <h3 className="text-lg font-semibold">{day.title}</h3>
            </div>
            <p className="text-sm leading-relaxed text-text-secondary">
              {day.description}
            </p>
            {day.locations.length > 0 ? (
              <ul className="mt-3 space-y-1">
                {day.locations
                  .slice()
                  .sort((a, b) => a.order - b.order)
                  .map((loc) => (
                    <li
                      key={loc.id}
                      className="text-sm text-text-primary before:mr-2 before:content-['•']"
                    >
                      {loc.location.name}
                    </li>
                  ))}
              </ul>
            ) : null}
          </article>
        ))}
    </div>
  );
}
