export type UserRole = 'USER' | 'ADMIN';

export type TripStatus =
  | 'DRAFT'
  | 'READY_FOR_BOOKING'
  | 'BOOKED'
  | 'ARCHIVED';

export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PAID'
  | 'CANCELLED'
  | 'COMPLETED';

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'ASC' | 'DESC';
}
