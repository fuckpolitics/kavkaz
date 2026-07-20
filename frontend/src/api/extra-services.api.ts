import { request } from './client';
import type { PaginationParams } from '@/types/common';
import type {
  CreateExtraServiceDto,
  ExtraServiceDto,
  UpdateExtraServiceDto,
} from '@/types/extra-service';

export const extraServicesApi = {
  list(params?: PaginationParams) {
    return request<ExtraServiceDto[]>('/extra-services', {
      query: params,
      auth: false,
    });
  },
  get(id: string) {
    return request<ExtraServiceDto>(`/extra-services/${id}`, { auth: false });
  },
  create(dto: CreateExtraServiceDto) {
    return request<ExtraServiceDto>('/extra-services', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },
  update(id: string, dto: UpdateExtraServiceDto) {
    return request<ExtraServiceDto>(`/extra-services/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    });
  },
  remove(id: string) {
    return request<void>(`/extra-services/${id}`, { method: 'DELETE' });
  },
};
