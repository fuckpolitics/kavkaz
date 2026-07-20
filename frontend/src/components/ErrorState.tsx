import { AppButton } from './AppButton';

export function ErrorState({
  title = 'Ошибка загрузки',
  message = 'Не удалось получить данные. Попробуйте ещё раз.',
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-card border border-danger/30 bg-surface px-6 py-16 text-center">
      <h3 className="text-xl font-semibold text-danger">{title}</h3>
      <p className="max-w-md text-text-secondary">{message}</p>
      {onRetry ? (
        <AppButton variant="secondary" onClick={onRetry}>
          Повторить
        </AppButton>
      ) : null}
    </div>
  );
}
