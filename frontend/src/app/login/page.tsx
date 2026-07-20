'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { OtpVerifyForm } from '@/components/OtpVerifyForm';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
  const { isAuthenticated, loading: authLoading, verifyOtp } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace('/profile');
    }
  }, [authLoading, isAuthenticated, router]);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-10">
      <h1 className="mb-2 text-3xl font-bold">Вход по коду</h1>
      <p className="mb-6 text-sm text-text-secondary">
        Укажите email или телефон — пришлём одноразовый код. Пароль не нужен.
      </p>
      <div className="rounded-card bg-surface p-5 shadow-card">
        <OtpVerifyForm
          submitLabel="Войти"
          onVerified={async (payload) => {
            await verifyOtp(payload);
            router.push('/profile');
          }}
        />
      </div>
    </div>
  );
}
