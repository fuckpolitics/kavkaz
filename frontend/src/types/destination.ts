import type { ImageDto } from './image';

export interface DestinationShortDto {
  id: string;
  name: string;
  slug: string;
  coverImage: ImageDto | null;
  minTourPrice?: number | null;
  tourCount?: number;
}

export interface DestinationDto {
  id: string;
  name: string;
  slug: string;
  description: string;
  coverImage: ImageDto | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDestinationDto {
  name: string;
  slug: string;
  description: string;
  coverImageId?: string;
}

export type UpdateDestinationDto = Partial<CreateDestinationDto>;
