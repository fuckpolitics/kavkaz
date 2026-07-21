import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Location } from '../../database/entities/location.entity';
import { ImageDto, toImageDto } from '../../files/dto/image.dto';

export class LocationDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  destinationId: string;

  @ApiPropertyOptional({ nullable: true })
  parentId: string | null;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiPropertyOptional({ nullable: true })
  latitude: number | null;

  @ApiPropertyOptional({ nullable: true })
  longitude: number | null;

  @ApiPropertyOptional({ nullable: true })
  address: string | null;

  @ApiPropertyOptional({ nullable: true })
  visitDurationMinutes: number | null;

  @ApiPropertyOptional({ nullable: true })
  travelFromBaseMinutes: number | null;

  @ApiPropertyOptional({
    nullable: true,
    description: 'Day-trip seat price ₽ / место (group ≤8)',
  })
  price: number | null;

  @ApiProperty({ type: ImageDto, isArray: true })
  images: ImageDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export function toLocationDto(location: Location): LocationDto {
  return {
    id: location.id,
    destinationId: location.destinationId,
    parentId: location.parentId ?? null,
    name: location.name,
    description: location.description,
    latitude: location.latitude,
    longitude: location.longitude,
    address: location.address,
    visitDurationMinutes: location.visitDurationMinutes,
    travelFromBaseMinutes: location.travelFromBaseMinutes,
    price: location.price != null ? Number(location.price) : null,
    images: (location.images ?? [])
      .map((image) => toImageDto(image))
      .filter((image): image is ImageDto => image !== null),
    createdAt: location.createdAt,
    updatedAt: location.updatedAt,
  };
}
