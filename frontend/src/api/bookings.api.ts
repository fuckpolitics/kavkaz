import { request } from './client';
import type { PaginationParams } from '@/types/common';
import type {
  BookingDto,
  BookingShortDto,
  CreateBookingDto,
  UpdateBookingStatusDto,
} from '@/types/booking';
import type { UserDto } from '@/types/user';

export interface BookFromTourDto {
  tourId: string;
  email?: string;
  phone?: string;
  code: string;
  firstName?: string;
  comment?: string;
  adults?: number;
  children?: number;
  startDate?: string | null;
  endDate?: string | null;
  locationIds?: string[];
  extraServiceIds?: string[];
}

export interface BookCustomTripDto {
  email?: string;
  phone?: string;
  code: string;
  firstName?: string;
  title?: string;
  comment?: string;
  notes?: string | null;
  adults?: number;
  children?: number;
  startDate?: string | null;
  endDate?: string | null;
  locationIds?: string[];
  days?: {
    isRest?: boolean;
    title?: string;
    locationIds?: string[];
  }[];
  extraServiceIds?: string[];
}

export interface BookWithAuthResponseDto {
  booking: BookingDto;
  accessToken: string;
  refreshToken: string;
  user: UserDto;
}

export const bookingsApi = {
  list(params?: PaginationParams) {
    return request<BookingShortDto[]>('/bookings', { query: params });
  },
  get(id: string) {
    return request<BookingDto>(`/bookings/${id}`);
  },
  create(dto: CreateBookingDto) {
    return request<BookingDto>('/bookings', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },
  bookFromTour(dto: BookFromTourDto) {
    return request<BookWithAuthResponseDto>('/bookings/from-tour', {
      method: 'POST',
      body: JSON.stringify(dto),
      auth: false,
    });
  },
  bookCustom(dto: BookCustomTripDto) {
    return request<BookWithAuthResponseDto>('/bookings/custom', {
      method: 'POST',
      body: JSON.stringify(dto),
      auth: false,
    });
  },
  updateStatus(id: string, dto: UpdateBookingStatusDto) {
    return request<BookingDto>(`/bookings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    });
  },
};
