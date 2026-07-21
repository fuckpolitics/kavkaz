import type { PaginationParams } from './common';
import type { ImageDto } from './image';

export interface LocationShortDto {
  id: string;
  name: string;
  destinationId?: string;
  parentId?: string | null;
  description?: string;
  latitude?: number | null;
  longitude?: number | null;
  visitDurationMinutes?: number | null;
  travelFromBaseMinutes?: number | null;
  /** Day-trip seat price ₽ / место (null = по запросу) */
  price?: number | null;
  coverImage: ImageDto | null;
}

export interface LocationDto {
  id: string;
  destinationId: string;
  parentId: string | null;
  name: string;
  description: string;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  visitDurationMinutes: number | null;
  travelFromBaseMinutes: number | null;
  price: number | null;
  images: ImageDto[];
  createdAt: string;
  updatedAt: string;
}

export interface LocationFilterDto extends PaginationParams {
  destinationId?: string;
  search?: string;
}

export interface CreateLocationDto {
  destinationId: string;
  parentId?: string | null;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  address?: string;
  visitDurationMinutes?: number | null;
  travelFromBaseMinutes?: number | null;
  price?: number | null;
  imageIds?: string[];
}

export type UpdateLocationDto = Partial<CreateLocationDto>;
