'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { authApi } from '@/api/auth.api';
import { configureApiClient } from '@/api/client';
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
} from '@/lib/token-storage';
import type {
  AuthResponseDto,
  RequestOtpDto,
  RequestOtpResponseDto,
  VerifyOtpDto,
} from '@/types/auth';
import type { UserDto } from '@/types/user';

interface AuthContextValue {
  user: UserDto | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  requestOtp: (dto: RequestOtpDto) => Promise<RequestOtpResponseDto>;
  verifyOtp: (dto: VerifyOtpDto) => Promise<void>;
  applySession: (session: AuthResponseDto) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserDto | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = useCallback(async (): Promise<string | null> => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      clearTokens();
      setUser(null);
      return null;
    }
    try {
      const tokens = await authApi.refresh(refreshToken);
      setAccessToken(tokens.accessToken);
      setRefreshToken(tokens.refreshToken);
      return tokens.accessToken;
    } catch {
      clearTokens();
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    configureApiClient({
      getAccessToken,
      setAccessToken,
      refresh: refreshSession,
    });

    async function bootstrap() {
      const access = getAccessToken();
      const refresh = getRefreshToken();
      if (!access && !refresh) {
        setLoading(false);
        return;
      }
      try {
        if (!access && refresh) {
          await refreshSession();
        }
        if (getAccessToken()) {
          const me = await authApi.me();
          setUser(me);
        }
      } catch {
        clearTokens();
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    void bootstrap();
  }, [refreshSession]);

  const applySession = useCallback((session: AuthResponseDto) => {
    setAccessToken(session.accessToken);
    setRefreshToken(session.refreshToken);
    setUser(session.user);
  }, []);

  const requestOtp = useCallback(async (dto: RequestOtpDto) => {
    return authApi.requestOtp(dto);
  }, []);

  const verifyOtp = useCallback(
    async (dto: VerifyOtpDto) => {
      const res = await authApi.verifyOtp(dto);
      applySession(res);
    },
    [applySession],
  );

  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken();
    try {
      if (refreshToken && getAccessToken()) {
        await authApi.logout(refreshToken);
      }
    } catch {
      // ignore logout errors
    } finally {
      clearTokens();
      setUser(null);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const me = await authApi.me();
    setUser(me);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === 'ADMIN',
      requestOtp,
      verifyOtp,
      applySession,
      logout,
      refreshUser,
    }),
    [
      user,
      loading,
      requestOtp,
      verifyOtp,
      applySession,
      logout,
      refreshUser,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
