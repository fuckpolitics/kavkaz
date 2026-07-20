export interface ExtraServiceDto {
  id: string;
  name: string;
  description: string;
  price: number;
  locationId: string | null;
  locationName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExtraServiceDto {
  name: string;
  description: string;
  price: number;
  locationId?: string | null;
}

export type UpdateExtraServiceDto = Partial<CreateExtraServiceDto>;
