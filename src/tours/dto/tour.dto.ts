import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { toNumber } from '../../common/utils/money.util';
import { TourDayLocation } from '../../database/entities/tour-day-location.entity';
import { TourDay } from '../../database/entities/tour-day.entity';
import { TourExtraService } from '../../database/entities/tour-extra-service.entity';
import { Tour } from '../../database/entities/tour.entity';
import {
  DestinationShortDto,
  toDestinationShortDto,
} from '../../destinations/dto/destination-short.dto';
import {
  ExtraServiceDto,
  toExtraServiceDto,
} from '../../extra-services/dto/extra-service.dto';
import { ImageDto, toImageDto } from '../../files/dto/image.dto';
import { LocationDto, toLocationDto } from '../../locations/dto/location.dto';

export class TourDayLocationDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  order: number;

  @ApiProperty({ type: LocationDto })
  location: LocationDto;
}

export function toTourDayLocationDto(
  tourDayLocation: TourDayLocation,
): TourDayLocationDto {
  return {
    id: tourDayLocation.id,
    order: tourDayLocation.order,
    location: toLocationDto(tourDayLocation.location),
  };
}

export class TourDayDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  dayNumber: number;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ type: TourDayLocationDto, isArray: true })
  locations: TourDayLocationDto[];
}

export function toTourDayDto(tourDay: TourDay): TourDayDto {
  return {
    id: tourDay.id,
    dayNumber: tourDay.dayNumber,
    title: tourDay.title,
    description: tourDay.description,
    locations: (tourDay.locations ?? [])
      .slice()
      .sort((a, b) => a.order - b.order)
      .map(toTourDayLocationDto),
  };
}

export class TourExtraServiceDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ type: ExtraServiceDto })
  extraService: ExtraServiceDto;

  @ApiProperty()
  price: number;
}

export function toTourExtraServiceDto(
  tourExtraService: TourExtraService,
): TourExtraServiceDto {
  return {
    id: tourExtraService.id,
    extraService: toExtraServiceDto(tourExtraService.extraService),
    price: toNumber(tourExtraService.price),
  };
}

export class TourDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ type: DestinationShortDto })
  destination: DestinationShortDto;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  price: number;

  @ApiProperty()
  durationDays: number;

  @ApiPropertyOptional({ type: ImageDto, nullable: true })
  coverImage: ImageDto | null;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty({ type: TourDayDto, isArray: true })
  days: TourDayDto[];

  @ApiProperty({ type: TourExtraServiceDto, isArray: true })
  extraServices: TourExtraServiceDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export function toTourDto(tour: Tour): TourDto {
  return {
    id: tour.id,
    destination: toDestinationShortDto(tour.destination),
    title: tour.title,
    description: tour.description,
    price: toNumber(tour.price),
    durationDays: tour.durationDays,
    coverImage: toImageDto(tour.coverImage),
    isActive: tour.isActive,
    days: (tour.days ?? [])
      .slice()
      .sort((a, b) => a.dayNumber - b.dayNumber)
      .map(toTourDayDto),
    extraServices: (tour.extraServices ?? []).map(toTourExtraServiceDto),
    createdAt: tour.createdAt,
    updatedAt: tour.updatedAt,
  };
}
