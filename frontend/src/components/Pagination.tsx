import { AppButton } from './AppButton';

export function Pagination({
  page,
  hasNext,
  onChange,
}: {
  page: number;
  hasNext: boolean;
  onChange: (page: number) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-3 py-4">
      <AppButton
        variant="secondary"
        size="sm"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        Назад
      </AppButton>
      <span className="text-sm text-text-secondary">Страница {page}</span>
      <AppButton
        variant="secondary"
        size="sm"
        disabled={!hasNext}
        onClick={() => onChange(page + 1)}
      >
        Вперёд
      </AppButton>
    </div>
  );
}
