import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { toNumber } from '../../common/utils/money.util';
import { Tour } from '../../database/entities/tour.entity';
import {
  DestinationShortDto,
  toDestinationShortDto,
} from '../../destinations/dto/destination-short.dto';
import { ImageDto, toImageDto } from '../../files/dto/image.dto';

export class TourShortDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  price: number;

  @ApiProperty()
  durationDays: number;

  @ApiPropertyOptional({ type: ImageDto, nullable: true })
  coverImage: ImageDto | null;

  @ApiProperty({ type: DestinationShortDto })
  destination: DestinationShortDto;
}

export function toTourShortDto(tour: Tour): TourShortDto {
  return {
    id: tour.id,
    title: tour.title,
    price: toNumber(tour.price),
    durationDays: tour.durationDays,
    coverImage: toImageDto(tour.coverImage),
    destination: toDestinationShortDto(tour.destination),
  };
}
