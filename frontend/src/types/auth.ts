import type { UserDto } from './user';

export interface RequestOtpDto {
  email?: string;
  phone?: string;
}

export interface VerifyOtpDto {
  email?: string;
  phone?: string;
  code: string;
  firstName?: string;
}

export interface RequestOtpResponseDto {
  ok: boolean;
  channel: 'email' | 'phone';
  /** Present only in OTP test mode */
  debugCode?: string;
  message: string;
}

export interface AuthTokensDto {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponseDto extends AuthTokensDto {
  user: UserDto;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface LogoutDto {
  refreshToken: string;
}
