import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Destination } from '../../database/entities/destination.entity';
import { ImageDto, toImageDto } from '../../files/dto/image.dto';

export class DestinationDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  description: string;

  @ApiPropertyOptional({ type: ImageDto, nullable: true })
  coverImage: ImageDto | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export function toDestinationDto(destination: Destination): DestinationDto {
  return {
    id: destination.id,
    name: destination.name,
    slug: destination.slug,
    description: destination.description,
    coverImage: toImageDto(destination.coverImage),
    createdAt: destination.createdAt,
    updatedAt: destination.updatedAt,
  };
}
