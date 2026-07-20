import type { PaginationParams } from './common';
import type { DestinationShortDto } from './destination';
import type { ExtraServiceDto } from './extra-service';
import type { ImageDto } from './image';
import type { LocationDto } from './location';

export interface TourDayLocationDto {
  id: string;
  order: number;
  location: LocationDto;
}

export interface TourDayDto {
  id: string;
  dayNumber: number;
  title: string;
  description: string;
  locations: TourDayLocationDto[];
}

export interface TourExtraServiceDto {
  id: string;
  extraService: ExtraServiceDto;
  price: number;
}

export interface TourShortDto {
  id: string;
  title: string;
  price: number;
  durationDays: number;
  coverImage: ImageDto | null;
  destination: DestinationShortDto;
}

export interface TourDto {
  id: string;
  destination: DestinationShortDto;
  title: string;
  description: string;
  price: number;
  durationDays: number;
  coverImage: ImageDto | null;
  isActive: boolean;
  days: TourDayDto[];
  extraServices: TourExtraServiceDto[];
  createdAt: string;
  updatedAt: string;
}

export interface TourFilterDto extends PaginationParams {
  destinationId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  durationDays?: number;
}

export interface CreateTourDto {
  destinationId: string;
  title: string;
  description: string;
  price: number;
  durationDays: number;
  coverImageId?: string;
}

export type UpdateTourDto = Partial<CreateTourDto>;
