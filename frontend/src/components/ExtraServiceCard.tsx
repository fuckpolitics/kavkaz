import type { ExtraServiceDto } from '@/types/extra-service';
import { formatPrice } from '@/lib/format';
import { AppButton } from './AppButton';

export function ExtraServiceCard({
  service,
  selected,
  onToggle,
  price,
}: {
  service: ExtraServiceDto;
  selected?: boolean;
  onToggle?: () => void | Promise<void>;
  price?: number;
}) {
  return (
    <div
      className={`rounded-card border p-4 shadow-soft ${selected ? 'border-primary bg-primary/5' : 'border-border bg-surface'}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="font-semibold">{service.name}</h4>
          <p className="mt-1 text-sm text-text-secondary">{service.description}</p>
          <p className="mt-2 font-medium text-primary">
            {formatPrice(price ?? service.price)}
          </p>
        </div>
        {onToggle ? (
          <AppButton
            size="sm"
            variant={selected ? 'secondary' : 'primary'}
            onClick={onToggle}
          >
            {selected ? 'Убрать' : 'Добавить'}
          </AppButton>
        ) : null}
      </div>
    </div>
  );
}
