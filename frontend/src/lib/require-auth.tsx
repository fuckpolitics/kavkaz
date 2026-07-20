'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ErrorState } from '@/components/ErrorState';

export function RequireAuth({
  children,
  adminOnly = false,
}: {
  children: React.ReactNode;
  adminOnly?: boolean;
}) {
  const { loading, isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return <LoadingSkeleton rows={4} />;
  }

  if (!isAuthenticated) {
    return <LoadingSkeleton rows={2} />;
  }

  if (adminOnly && !isAdmin) {
    return (
      <ErrorState
        title="403 — Доступ запрещён"
        message="Эта страница доступна только администраторам."
      />
    );
  }

  return <>{children}</>;
}

export function useRequireUser() {
  const auth = useAuth();
  return auth.user;
}
