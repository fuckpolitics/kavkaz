import { request } from './client';
import type { PaginationParams } from '@/types/common';
import type {
  CreateDestinationDto,
  DestinationDto,
  DestinationShortDto,
  UpdateDestinationDto,
} from '@/types/destination';

export const destinationsApi = {
  list(params?: PaginationParams) {
    return request<DestinationShortDto[]>('/destinations', {
      query: params,
      auth: false,
    });
  },
  get(id: string) {
    return request<DestinationDto>(`/destinations/${id}`, { auth: false });
  },
  create(dto: CreateDestinationDto) {
    return request<DestinationDto>('/destinations', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },
  update(id: string, dto: UpdateDestinationDto) {
    return request<DestinationDto>(`/destinations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    });
  },
  remove(id: string) {
    return request<void>(`/destinations/${id}`, { method: 'DELETE' });
  },
};
