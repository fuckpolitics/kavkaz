import { request } from './client';
import type {
  CreateLocationDto,
  LocationDto,
  LocationFilterDto,
  LocationShortDto,
  UpdateLocationDto,
} from '@/types/location';

export const locationsApi = {
  list(params?: LocationFilterDto) {
    return request<LocationShortDto[]>('/locations', {
      query: params,
      auth: false,
    });
  },
  get(id: string) {
    return request<LocationDto>(`/locations/${id}`, { auth: false });
  },
  create(dto: CreateLocationDto) {
    return request<LocationDto>('/locations', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },
  update(id: string, dto: UpdateLocationDto) {
    return request<LocationDto>(`/locations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    });
  },
  remove(id: string) {
    return request<void>(`/locations/${id}`, { method: 'DELETE' });
  },
};
