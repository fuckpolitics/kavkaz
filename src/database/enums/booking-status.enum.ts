/**
 * Lifecycle status of a Booking (immutable purchase snapshot).
 */
export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}
