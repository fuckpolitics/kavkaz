'use client';

import { FormEvent, useState } from 'react';
import { usersApi } from '@/api/users.api';
import { imagesApi } from '@/api/images.api';
import { AppButton } from '@/components/AppButton';
import { AppInput } from '@/components/AppInput';
import { RequireAuth } from '@/lib/require-auth';
import { useAuth } from '@/lib/auth-context';
import { resolveImageUrl } from '@/lib/format';
import { ApiError } from '@/api/client';

function ProfileContent() {
  const { user, refreshUser } = useAuth();
  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await usersApi.updateMe({
        firstName,
        lastName: lastName || undefined,
        phone: phone || undefined,
      });
      await refreshUser();
      setSuccess('Профиль обновлён');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Ошибка сохранения');
    } finally {
      setLoading(false);
    }
  }

  async function onAvatar(file: File | null) {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const image = await imagesApi.upload(file);
      await usersApi.updateMe({ avatarId: image.id });
      await refreshUser();
      setSuccess('Аватар обновлён');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Ошибка загрузки');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Профиль</h1>
      <div className="mb-6 flex items-center gap-4 rounded-card bg-surface p-4 shadow-soft">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={resolveImageUrl(user?.avatar?.url, '/images/category-traditions.svg')}
          alt="Аватар"
          className="h-16 w-16 rounded-full object-cover"
        />
        <div>
          <p className="font-semibold">
            {user?.firstName} {user?.lastName}
          </p>
          <p className="text-sm text-text-secondary">{user?.email}</p>
          <p className="text-xs text-text-secondary">Роль: {user?.role}</p>
          <label className="mt-2 inline-block cursor-pointer text-sm text-primary underline">
            {uploading ? 'Загрузка…' : 'Сменить аватар'}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploading}
              onChange={(e) => void onAvatar(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4 rounded-card bg-surface p-5 shadow-card">
        <AppInput
          label="Имя"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
        <AppInput
          label="Фамилия"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
        <AppInput
          label="Телефон"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        {success ? <p className="text-sm text-primary">{success}</p> : null}
        <AppButton type="submit" loading={loading}>
          Сохранить
        </AppButton>
      </form>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <RequireAuth>
      <ProfileContent />
    </RequireAuth>
  );
}
