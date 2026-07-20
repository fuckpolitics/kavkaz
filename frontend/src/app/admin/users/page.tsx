'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/api/admin.api';
import { ApiError } from '@/api/client';
import { AppSelect } from '@/components/AppSelect';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import type { UserDto } from '@/types/user';
import type { UserRole } from '@/types/common';

export default function AdminUsersPage() {
  const [items, setItems] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setItems(await adminApi.listUsers());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Пользователи</h1>
      {loading ? (
        <LoadingSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : items.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-3">
          {items.map((user) => (
            <div
              key={user.id}
              className="rounded-card border border-border bg-surface p-4 shadow-soft"
            >
              <p className="font-semibold">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-sm text-text-secondary">{user.email}</p>
              <div className="mt-3">
                <AppSelect
                  label="Роль"
                  value={user.role}
                  options={[
                    { value: 'USER', label: 'USER' },
                    { value: 'ADMIN', label: 'ADMIN' },
                  ]}
                  onChange={async (e) => {
                    try {
                      await adminApi.updateUser(user.id, {
                        role: e.target.value as UserRole,
                      });
                      await load();
                    } catch (err) {
                      setError(err instanceof ApiError ? err.message : 'Ошибка');
                    }
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
