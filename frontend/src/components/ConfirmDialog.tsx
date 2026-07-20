'use client';

import { AppButton } from './AppButton';
import { Modal } from './Modal';

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Подтвердить',
  loading = false,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Modal open={open} title={title} onClose={onClose}>
      <p className="mb-5 text-text-secondary">{message}</p>
      <div className="flex justify-end gap-2">
        <AppButton variant="secondary" onClick={onClose} disabled={loading}>
          Отмена
        </AppButton>
        <AppButton variant="danger" loading={loading} onClick={onConfirm}>
          {confirmLabel}
        </AppButton>
      </div>
    </Modal>
  );
}
