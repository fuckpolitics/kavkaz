import { request } from './client';
import type { UpdateUserDto, UserDto } from '@/types/user';

export const usersApi = {
  getMe() {
    return request<UserDto>('/users/me');
  },
  updateMe(dto: UpdateUserDto) {
    return request<UserDto>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(dto),
    });
  },
};
