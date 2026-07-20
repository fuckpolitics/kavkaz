import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { toNumber } from '../../common/utils/money.util';
import { TripDayLocation } from '../../database/entities/trip-day-location.entity';
import { TripDay } from '../../database/entities/trip-day.entity';
import { TripExtraService } from '../../database/entities/trip-extra-service.entity';
import { Trip } from '../../database/entities/trip.entity';
import { TripStatus } from '../../database/enums/trip-status.enum';
import {
  ExtraServiceDto,
  toExtraServiceDto,
} from '../../extra-services/dto/extra-service.dto';
import {
  LocationShortDto,
  toLocationShortDto,
} from '../../locations/dto/location-short.dto';

export class TripDayLocationDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  order: number;

  @ApiPropertyOptional({ nullable: true })
  visitTime: string | null;

  @ApiProperty({ type: LocationShortDto })
  location: LocationShortDto;
}

export function toTripDayLocationDto(
  item: TripDayLocation,
): TripDayLocationDto {
  return {
    id: item.id,
    order: item.order,
    visitTime: item.visitTime,
    location: toLocationShortDto(item.location),
  };
}

export class TripDayDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  dayNumber: number;

  @ApiProperty()
  title: string;

  @ApiPropertyOptional({ nullable: true })
  description: string | null;

  @ApiProperty()
  isRest: boolean;

  @ApiProperty({ type: TripDayLocationDto, isArray: true })
  locations: TripDayLocationDto[];
}

export function toTripDayDto(day: TripDay): TripDayDto {
  return {
    id: day.id,
    dayNumber: day.dayNumber,
    title: day.title,
    description: day.description,
    isRest: Boolean(day.isRest),
    locations: (day.locations ?? [])
      .slice()
      .sort((a, b) => a.order - b.order)
      .map(toTripDayLocationDto),
  };
}

export class TripExtraServiceDto {
  @ApiProperty()
  id: string;

  @ApiPropertyOptional({ nullable: true })
  tripDayId: string | null;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  price: number;

  @ApiProperty({ type: ExtraServiceDto })
  extraService: ExtraServiceDto;
}

export function toTripExtraServiceDto(
  item: TripExtraService,
): TripExtraServiceDto {
  return {
    id: item.id,
    tripDayId: item.tripDayId,
    quantity: item.quantity,
    price: toNumber(item.price),
    extraService: toExtraServiceDto(item.extraService),
  };
}

export class TripDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiPropertyOptional({ nullable: true })
  sourceTourId: string | null;

  @ApiProperty()
  title: string;

  @ApiProperty({ enum: TripStatus })
  status: TripStatus;

  @ApiProperty()
  adults: number;

  @ApiProperty()
  children: number;

  @ApiProperty()
  estimatedPrice: number;

  @ApiPropertyOptional({ nullable: true })
  startDate: string | null;

  @ApiPropertyOptional({ nullable: true })
  endDate: string | null;

  @ApiPropertyOptional({ nullable: true })
  notes: string | null;

  @ApiProperty({ type: TripDayDto, isArray: true })
  days: TripDayDto[];

  @ApiProperty({ type: TripExtraServiceDto, isArray: true })
  extraServices: TripExtraServiceDto[];

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}

function dateToIsoDate(value: Date | string | null | undefined): string | null {
  if (!value) {
    return null;
  }
  if (typeof value === 'string') {
    return value.slice(0, 10);
  }
  return value.toISOString().slice(0, 10);
}

export function toTripDto(trip: Trip): TripDto {
  return {
    id: trip.id,
    userId: trip.userId,
    sourceTourId: trip.sourceTourId,
    title: trip.title,
    status: trip.status,
    adults: trip.adults,
    children: trip.children,
    estimatedPrice: toNumber(trip.estimatedPrice),
    startDate: dateToIsoDate(trip.startDate),
    endDate: dateToIsoDate(trip.endDate),
    notes: trip.notes,
    days: (trip.days ?? [])
      .slice()
      .sort((a, b) => a.dayNumber - b.dayNumber)
      .map(toTripDayDto),
    extraServices: (trip.extraServices ?? []).map(toTripExtraServiceDto),
    createdAt: trip.createdAt.toISOString(),
    updatedAt: trip.updatedAt.toISOString(),
  };
}

export class TripShortDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty({ enum: TripStatus })
  status: TripStatus;

  @ApiProperty()
  estimatedPrice: number;

  @ApiPropertyOptional({ nullable: true })
  startDate: string | null;

  @ApiPropertyOptional({ nullable: true })
  endDate: string | null;

  @ApiProperty()
  createdAt: string;
}

export function toTripShortDto(trip: Trip): TripShortDto {
  return {
    id: trip.id,
    title: trip.title,
    status: trip.status,
    estimatedPrice: toNumber(trip.estimatedPrice),
    startDate: dateToIsoDate(trip.startDate),
    endDate: dateToIsoDate(trip.endDate),
    createdAt: trip.createdAt.toISOString(),
  };
}
