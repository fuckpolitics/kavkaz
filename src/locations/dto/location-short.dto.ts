import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Location } from '../../database/entities/location.entity';
import { ImageDto, toImageDto } from '../../files/dto/image.dto';

export class LocationShortDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  destinationId: string;

  @ApiPropertyOptional({ nullable: true })
  parentId: string | null;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional({ nullable: true })
  latitude: number | null;

  @ApiPropertyOptional({ nullable: true })
  longitude: number | null;

  @ApiPropertyOptional({ nullable: true })
  visitDurationMinutes: number | null;

  @ApiPropertyOptional({ nullable: true })
  travelFromBaseMinutes: number | null;

  @ApiPropertyOptional({
    nullable: true,
    description: 'Day-trip seat price ₽ / место (group ≤8)',
  })
  price: number | null;

  @ApiPropertyOptional({ type: ImageDto, nullable: true })
  coverImage: ImageDto | null;
}

export function toLocationShortDto(location: Location): LocationShortDto {
  return {
    id: location.id,
    name: location.name,
    destinationId: location.destinationId,
    parentId: location.parentId ?? null,
    description: location.description,
    latitude: location.latitude,
    longitude: location.longitude,
    visitDurationMinutes: location.visitDurationMinutes,
    travelFromBaseMinutes: location.travelFromBaseMinutes,
    price: location.price != null ? Number(location.price) : null,
    coverImage: toImageDto(location.images?.[0]),
  };
}
