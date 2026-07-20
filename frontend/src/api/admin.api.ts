import { request } from './client';
import type { PaginationParams } from '@/types/common';
import type { AdminBookingDto } from '@/types/booking';
import type { UpdateAdminUserDto, UserDto } from '@/types/user';

export const adminApi = {
  listUsers() {
    return request<UserDto[]>('/admin/users');
  },
  updateUser(id: string, dto: UpdateAdminUserDto) {
    return request<UserDto>(`/admin/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    });
  },
  listBookings(params?: PaginationParams) {
    return request<AdminBookingDto[]>('/admin/bookings', { query: params });
  },
};
