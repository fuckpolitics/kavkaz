import { request } from './client';
import type { PaginationParams } from '@/types/common';
import type {
  CreateTripDayDto,
  CreateTripDayLocationDto,
  CreateTripExtraServiceDto,
  TripDayDto,
  TripDayLocationDto,
  TripDto,
  TripExtraServiceDto,
  TripShortDto,
  UpdateTripDayDto,
  UpdateTripDayLocationDto,
  UpdateTripDto,
} from '@/types/trip';

export interface CreateTripDto {
  title?: string;
  adults?: number;
  children?: number;
  startDate?: string | null;
  endDate?: string | null;
  notes?: string | null;
}

export interface CreateTripFromTourDto {
  adults?: number;
  children?: number;
  startDate?: string | null;
  endDate?: string | null;
  locationIds?: string[];
  extraServiceIds?: string[];
}

export interface CustomTripDayInput {
  isRest?: boolean;
  title?: string;
  locationIds?: string[];
}

export interface CreateCustomTripDto {
  title?: string;
  adults?: number;
  children?: number;
  startDate?: string | null;
  endDate?: string | null;
  notes?: string | null;
  locationIds?: string[];
  days?: CustomTripDayInput[];
  extraServiceIds?: string[];
}

export const tripsApi = {
  list(params?: PaginationParams) {
    return request<TripShortDto[]>('/trips', { query: params });
  },
  get(id: string) {
    return request<TripDto>(`/trips/${id}`);
  },
  create(dto: CreateTripDto = {}) {
    return request<TripDto>('/trips', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },
  createFromTour(tourId: string, dto: CreateTripFromTourDto = {}) {
    return request<TripDto>(`/trips/from-tour/${tourId}`, {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },
  createCustom(dto: CreateCustomTripDto) {
    return request<TripDto>('/trips/custom', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },
  update(id: string, dto: UpdateTripDto) {
    return request<TripDto>(`/trips/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    });
  },
  remove(id: string) {
    return request<void>(`/trips/${id}`, { method: 'DELETE' });
  },
  addDay(tripId: string, dto: CreateTripDayDto) {
    return request<TripDayDto>(`/trips/${tripId}/days`, {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },
  updateDay(id: string, dto: UpdateTripDayDto) {
    return request<TripDayDto>(`/trip-days/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    });
  },
  removeDay(id: string) {
    return request<void>(`/trip-days/${id}`, { method: 'DELETE' });
  },
  addLocation(dayId: string, dto: CreateTripDayLocationDto) {
    return request<TripDayLocationDto>(`/trip-days/${dayId}/locations`, {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },
  updateLocation(id: string, dto: UpdateTripDayLocationDto) {
    return request<TripDayLocationDto>(`/trip-day-locations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    });
  },
  removeLocation(id: string) {
    return request<void>(`/trip-day-locations/${id}`, { method: 'DELETE' });
  },
  addExtraService(tripId: string, dto: CreateTripExtraServiceDto) {
    return request<TripExtraServiceDto>(`/trips/${tripId}/extra-services`, {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },
  removeExtraService(id: string) {
    return request<void>(`/trip-extra-services/${id}`, { method: 'DELETE' });
  },
};
