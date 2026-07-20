import type { TripStatus } from './common';
import type { ExtraServiceDto } from './extra-service';
import type { LocationShortDto } from './location';

export interface TripDayLocationDto {
  id: string;
  order: number;
  visitTime: string | null;
  location: LocationShortDto;
}

export interface TripDayDto {
  id: string;
  dayNumber: number;
  title: string;
  description: string | null;
  isRest: boolean;
  locations: TripDayLocationDto[];
}

export interface TripExtraServiceDto {
  id: string;
  tripDayId: string | null;
  quantity: number;
  price: number;
  extraService: ExtraServiceDto;
}

export interface TripDto {
  id: string;
  userId: string;
  sourceTourId: string | null;
  title: string;
  status: TripStatus;
  adults: number;
  children: number;
  estimatedPrice: number;
  startDate: string | null;
  endDate: string | null;
  notes: string | null;
  days: TripDayDto[];
  extraServices: TripExtraServiceDto[];
  createdAt: string;
  updatedAt: string;
}

export interface TripShortDto {
  id: string;
  title: string;
  status: TripStatus;
  estimatedPrice: number;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
}

export interface UpdateTripDto {
  title?: string;
  adults?: number;
  children?: number;
  startDate?: string | null;
  endDate?: string | null;
  notes?: string | null;
}

export interface CreateTripDayDto {
  title: string;
  description?: string | null;
  dayNumber?: number;
}

export interface UpdateTripDayDto {
  title?: string;
  description?: string | null;
  dayNumber?: number;
}

export interface CreateTripDayLocationDto {
  locationId: string;
  order?: number;
  visitTime?: string | null;
}

export interface UpdateTripDayLocationDto {
  order?: number;
  visitTime?: string | null;
}

export interface CreateTripExtraServiceDto {
  extraServiceId: string;
  quantity?: number;
  tripDayId?: string | null;
}
