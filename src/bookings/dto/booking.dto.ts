import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { toNumber } from '../../common/utils/money.util';
import { BookingDayLocation } from '../../database/entities/booking-day-location.entity';
import { BookingDay } from '../../database/entities/booking-day.entity';
import { BookingExtraService } from '../../database/entities/booking-extra-service.entity';
import { Booking } from '../../database/entities/booking.entity';
import { BookingStatus } from '../../database/enums/booking-status.enum';

export class BookingDayLocationDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  locationName: string;

  @ApiProperty()
  order: number;
}

export function toBookingDayLocationDto(
  item: BookingDayLocation,
): BookingDayLocationDto {
  return {
    id: item.id,
    locationName: item.locationName,
    order: item.order,
  };
}

export class BookingDayDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  dayNumber: number;

  @ApiProperty()
  title: string;

  @ApiProperty()
  isRest: boolean;

  @ApiProperty({ type: BookingDayLocationDto, isArray: true })
  locations: BookingDayLocationDto[];
}

export function toBookingDayDto(day: BookingDay): BookingDayDto {
  return {
    id: day.id,
    dayNumber: day.dayNumber,
    title: day.title,
    isRest: Boolean(day.isRest),
    locations: (day.locations ?? [])
      .slice()
      .sort((a, b) => a.order - b.order)
      .map(toBookingDayLocationDto),
  };
}

export class BookingExtraServiceDto {
  @ApiProperty()
  id: string;

  @ApiPropertyOptional({ nullable: true })
  bookingDayId: string | null;

  @ApiProperty()
  serviceName: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  price: number;
}

export function toBookingExtraServiceDto(
  item: BookingExtraService,
): BookingExtraServiceDto {
  return {
    id: item.id,
    bookingDayId: item.bookingDayId,
    serviceName: item.serviceName,
    quantity: item.quantity,
    price: toNumber(item.price),
  };
}

export class BookingDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiPropertyOptional({ nullable: true })
  tripId: string | null;

  @ApiPropertyOptional({ nullable: true })
  tourId: string | null;

  @ApiProperty()
  adults: number;

  @ApiProperty()
  children: number;

  @ApiProperty()
  totalPrice: number;

  @ApiProperty({ enum: BookingStatus })
  status: BookingStatus;

  @ApiPropertyOptional({ nullable: true })
  comment: string | null;

  @ApiProperty()
  tripTitle: string;

  @ApiProperty({ type: BookingDayDto, isArray: true })
  days: BookingDayDto[];

  @ApiProperty({ type: BookingExtraServiceDto, isArray: true })
  extraServices: BookingExtraServiceDto[];

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}

export function toBookingDto(booking: Booking): BookingDto {
  return {
    id: booking.id,
    userId: booking.userId,
    tripId: booking.tripId,
    tourId: booking.tourId,
    adults: booking.adults,
    children: booking.children,
    totalPrice: toNumber(booking.totalPrice),
    status: booking.status,
    comment: booking.comment,
    tripTitle: booking.tripTitle,
    days: (booking.days ?? [])
      .slice()
      .sort((a, b) => a.dayNumber - b.dayNumber)
      .map(toBookingDayDto),
    extraServices: (booking.extraServices ?? []).map(toBookingExtraServiceDto),
    createdAt: booking.createdAt.toISOString(),
    updatedAt: booking.updatedAt.toISOString(),
  };
}

export class BookingShortDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  tripTitle: string;

  @ApiProperty({ enum: BookingStatus })
  status: BookingStatus;

  @ApiProperty()
  totalPrice: number;

  @ApiProperty()
  createdAt: string;
}

export function toBookingShortDto(booking: Booking): BookingShortDto {
  return {
    id: booking.id,
    tripTitle: booking.tripTitle,
    status: booking.status,
    totalPrice: toNumber(booking.totalPrice),
    createdAt: booking.createdAt.toISOString(),
  };
}

export class AdminBookingCustomerDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  firstName: string;

  @ApiPropertyOptional({ nullable: true })
  lastName: string | null;

  @ApiPropertyOptional({ nullable: true })
  email: string | null;

  @ApiPropertyOptional({ nullable: true })
  phone: string | null;
}

export class AdminBookingDto extends BookingDto {
  @ApiProperty({ type: AdminBookingCustomerDto })
  customer: AdminBookingCustomerDto;

  @ApiPropertyOptional({ nullable: true })
  startDate: string | null;

  @ApiPropertyOptional({ nullable: true })
  endDate: string | null;
}

function toIsoDate(value: Date | string | null | undefined): string | null {
  if (!value) {
    return null;
  }
  if (typeof value === 'string') {
    return value.slice(0, 10);
  }
  return value.toISOString().slice(0, 10);
}

export function toAdminBookingDto(booking: Booking): AdminBookingDto {
  const base = toBookingDto(booking);
  const user = booking.user;
  return {
    ...base,
    customer: {
      id: user?.id ?? booking.userId,
      firstName: user?.firstName ?? '—',
      lastName: user?.lastName ?? null,
      email: user?.email ?? null,
      phone: user?.phone ?? null,
    },
    startDate: toIsoDate(booking.trip?.startDate),
    endDate: toIsoDate(booking.trip?.endDate),
  };
}
