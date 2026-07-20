import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BookingDayLocation } from './booking-day-location.entity';
import { BookingExtraService } from './booking-extra-service.entity';
import { Booking } from './booking.entity';

/**
 * Day within a Booking snapshot. Deleted when parent Booking is deleted.
 */
@Entity({
  name: 'booking_days',
  comment: 'Day within an immutable booking snapshot',
})
export class BookingDay {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'booking_id', type: 'uuid' })
  bookingId: string;

  @Column({
    name: 'day_number',
    type: 'int',
    comment: 'Sequential day number within the booking',
  })
  dayNumber: number;

  @Column({ type: 'varchar', comment: 'Booking day title' })
  title: string;

  @Column({
    name: 'is_rest',
    type: 'boolean',
    default: false,
    comment: 'Rest day without excursions',
  })
  isRest: boolean;

  @ManyToOne(() => Booking, (booking) => booking.days, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;

  @OneToMany(
    () => BookingDayLocation,
    (bookingDayLocation) => bookingDayLocation.bookingDay,
    { cascade: true },
  )
  locations: BookingDayLocation[];

  @OneToMany(
    () => BookingExtraService,
    (bookingExtraService) => bookingExtraService.bookingDay,
  )
  extraServices: BookingExtraService[];
}
