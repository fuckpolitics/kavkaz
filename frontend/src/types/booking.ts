import type { BookingStatus } from './common';

export interface BookingDayLocationDto {
  id: string;
  locationName: string;
  order: number;
}

export interface BookingDayDto {
  id: string;
  dayNumber: number;
  title: string;
  isRest: boolean;
  locations: BookingDayLocationDto[];
}

export interface BookingExtraServiceDto {
  id: string;
  bookingDayId: string | null;
  serviceName: string;
  quantity: number;
  price: number;
}

export interface BookingDto {
  id: string;
  userId: string;
  tripId: string | null;
  tourId: string | null;
  adults: number;
  children: number;
  totalPrice: number;
  status: BookingStatus;
  comment: string | null;
  tripTitle: string;
  days: BookingDayDto[];
  extraServices: BookingExtraServiceDto[];
  createdAt: string;
  updatedAt: string;
}

export interface BookingShortDto {
  id: string;
  tripTitle: string;
  status: BookingStatus;
  totalPrice: number;
  createdAt: string;
}

export interface AdminBookingCustomerDto {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string | null;
  phone: string | null;
}

export interface AdminBookingDto extends BookingDto {
  customer: AdminBookingCustomerDto;
  startDate: string | null;
  endDate: string | null;
}

export interface CreateBookingDto {
  tripId: string;
  comment?: string;
}

export interface UpdateBookingStatusDto {
  status: BookingStatus;
}
