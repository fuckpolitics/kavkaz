'use client';

import { RequireAuth } from '@/lib/require-auth';
import { ErrorState } from '@/components/ErrorState';

export default function ForbiddenPage() {
  return (
    <RequireAuth>
      <div className="mx-auto max-w-xl px-4 py-16">
        <ErrorState
          title="403 — Доступ запрещён"
          message="У вас недостаточно прав для просмотра этой страницы."
        />
      </div>
    </RequireAuth>
  );
}
