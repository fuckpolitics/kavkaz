'use client';

import { useEffect } from 'react';
import { AppButton } from './AppButton';

export function Modal({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-primary/50 p-4 tablet:items-center">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Закрыть"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-lg rounded-card bg-surface p-5 shadow-card">
        <div className="mb-4 flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold">{title}</h3>
          <AppButton variant="secondary" size="sm" onClick={onClose}>
            ✕
          </AppButton>
        </div>
        {children}
      </div>
    </div>
  );
}
