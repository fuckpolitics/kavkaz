export function StatusBadge({
  status,
  className = '',
}: {
  status: string;
  className?: string;
}) {
  const map: Record<string, string> = {
    DRAFT: 'bg-accent/40 text-primary',
    READY_FOR_BOOKING: 'bg-primary/10 text-primary',
    BOOKED: 'bg-primary text-white',
    ARCHIVED: 'bg-border text-text-secondary',
    PENDING: 'bg-accent/50 text-primary',
    CONFIRMED: 'bg-primary/15 text-primary',
    PAID: 'bg-primary text-white',
    CANCELLED: 'bg-danger/15 text-danger',
    COMPLETED: 'bg-primary-light text-white',
  };

  const labels: Record<string, string> = {
    DRAFT: 'Черновик',
    READY_FOR_BOOKING: 'Готов к бронированию',
    BOOKED: 'Забронирован',
    ARCHIVED: 'Архив',
    PENDING: 'Ожидает',
    CONFIRMED: 'Подтверждён',
    PAID: 'Оплачен',
    CANCELLED: 'Отменён',
    COMPLETED: 'Завершён',
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${map[status] ?? 'bg-border text-text-secondary'} ${className}`}
    >
      {labels[status] ?? status}
    </span>
  );
}
