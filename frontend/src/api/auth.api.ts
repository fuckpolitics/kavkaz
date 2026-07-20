import { request } from './client';
import type {
  AuthResponseDto,
  AuthTokensDto,
  RequestOtpDto,
  RequestOtpResponseDto,
  VerifyOtpDto,
} from '@/types/auth';
import type { UserDto } from '@/types/user';

export const authApi = {
  requestOtp(dto: RequestOtpDto) {
    return request<RequestOtpResponseDto>('/auth/otp/request', {
      method: 'POST',
      body: JSON.stringify(dto),
      auth: false,
    });
  },
  verifyOtp(dto: VerifyOtpDto) {
    return request<AuthResponseDto>('/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify(dto),
      auth: false,
    });
  },
  refresh(refreshToken: string) {
    return request<AuthTokensDto>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
      auth: false,
      retry: false,
    });
  },
  logout(refreshToken: string) {
    return request<void>('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  },
  me() {
    return request<UserDto>('/auth/me');
  },
};
