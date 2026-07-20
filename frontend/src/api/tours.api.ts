import { request } from './client';
import type {
  CreateTourDto,
  TourDto,
  TourFilterDto,
  TourShortDto,
  UpdateTourDto,
} from '@/types/tour';

export const toursApi = {
  list(params?: TourFilterDto) {
    return request<TourShortDto[]>('/tours', {
      query: params,
      auth: false,
    });
  },
  get(id: string) {
    return request<TourDto>(`/tours/${id}`, { auth: false });
  },
  create(dto: CreateTourDto) {
    return request<TourDto>('/tours', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },
  update(id: string, dto: UpdateTourDto) {
    return request<TourDto>(`/tours/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    });
  },
  remove(id: string) {
    return request<void>(`/tours/${id}`, { method: 'DELETE' });
  },
};
