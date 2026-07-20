import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BookingDay } from './booking-day.entity';

/**
 * Location snapshot on a BookingDay. Stores location_name (immutable copy).
 * Deleted when parent Booking/BookingDay is deleted.
 */
@Entity({
  name: 'booking_day_locations',
  comment: 'Immutable location name snapshot on a booking day',
})
export class BookingDayLocation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'booking_day_id', type: 'uuid' })
  bookingDayId: string;

  @Column({
    name: 'location_name',
    type: 'varchar',
    comment: 'Snapshot of the location name at booking time',
  })
  locationName: string;

  @Column({
    name: 'order',
    type: 'int',
    comment: 'Order of the location within the booking day',
  })
  order: number;

  @ManyToOne(() => BookingDay, (bookingDay) => bookingDay.locations, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'booking_day_id' })
  bookingDay: BookingDay;
}
