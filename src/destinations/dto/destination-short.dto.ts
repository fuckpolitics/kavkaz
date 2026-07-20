import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Destination } from '../../database/entities/destination.entity';
import { ImageDto, toImageDto } from '../../files/dto/image.dto';

export class DestinationShortDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  slug: string;

  @ApiPropertyOptional({ type: ImageDto, nullable: true })
  coverImage: ImageDto | null;

  @ApiPropertyOptional({ nullable: true })
  minTourPrice?: number | null;

  @ApiPropertyOptional()
  tourCount?: number;
}

export function toDestinationShortDto(
  destination: Destination,
  extras?: { minTourPrice?: number | null; tourCount?: number },
): DestinationShortDto {
  return {
    id: destination.id,
    name: destination.name,
    slug: destination.slug,
    coverImage: toImageDto(destination.coverImage),
    ...(extras
      ? {
          minTourPrice: extras.minTourPrice ?? null,
          tourCount: extras.tourCount ?? 0,
        }
      : {}),
  };
}
