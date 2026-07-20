import { AppButton } from './AppButton';

export function EmptyState({
  title = 'Ничего не найдено',
  message = 'Попробуйте изменить параметры поиска.',
  actionLabel,
  onAction,
}: {
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-card border border-dashed border-border bg-surface px-6 py-16 text-center">
      <h3 className="text-xl font-semibold text-text-primary">{title}</h3>
      <p className="max-w-md text-text-secondary">{message}</p>
      {actionLabel && onAction ? (
        <AppButton onClick={onAction}>{actionLabel}</AppButton>
      ) : null}
    </div>
  );
}
