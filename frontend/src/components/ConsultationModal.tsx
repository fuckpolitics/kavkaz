'use client';

import { useState, type FormEvent } from 'react';
import { BRAND } from '@/lib/brand';
import { FORM_MICROCOPY } from '@/lib/home-content';
import { AppButton } from './AppButton';
import { AppInput } from './AppInput';
import { AppTextarea } from './AppTextarea';
import { Modal } from './Modal';

export function ConsultationModal({
  open,
  onClose,
  context,
}: {
  open: boolean;
  onClose: () => void;
  /** Short context for the manager message */
  context?: string;
}) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [comment, setComment] = useState('');

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const text = [
      'Здравствуйте! Нужна консультация по поездке.',
      `Имя: ${name}`,
      `Телефон: ${phone}`,
      context ? `Контекст: ${context}` : null,
      comment ? `Комментарий: ${comment}` : null,
    ]
      .filter(Boolean)
      .join('\n');
    window.open(
      `${BRAND.whatsappUrl}?text=${encodeURIComponent(text)}`,
      '_blank',
      'noreferrer',
    );
    onClose();
  }

  return (
    <Modal open={open} title="Заявка на консультацию" onClose={onClose}>
      <p className="mb-4 text-sm text-text-secondary">
        Менеджер свяжется с вами, ответит на вопросы и поможет собрать маршрут.
        Ничего покупать заранее не нужно.
      </p>
      <form onSubmit={onSubmit} className="space-y-3">
        <AppInput
          label="Имя"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Как к вам обращаться"
        />
        <AppInput
          label="Телефон"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          placeholder="+7 …"
        />
        <AppTextarea
          label="Что уточнить"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Даты, состав, пожелания…"
        />
        <AppButton type="submit" className="w-full" size="lg">
          Задать вопрос координатору
        </AppButton>
        <p className="text-xs text-text-secondary">{FORM_MICROCOPY}</p>
      </form>
    </Modal>
  );
}
