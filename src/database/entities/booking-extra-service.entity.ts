import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BookingDay } from './booking-day.entity';
import { Booking } from './booking.entity';

@Entity({
  name: 'booking_extra_services',
  comment: 'Immutable extra service snapshot on a booking',
})
export class BookingExtraService {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'booking_id', type: 'uuid' })
  bookingId: string;

  @Index()
  @Column({ name: 'booking_day_id', type: 'uuid', nullable: true })
  bookingDayId: string | null;

  @Column({
    name: 'service_name',
    type: 'varchar',
    comment: 'Snapshot of the service name at booking time',
  })
  serviceName: string;

  @Column({
    type: 'int',
    default: 1,
    comment: 'Quantity snapshot',
  })
  quantity: number;

  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
    comment: 'Snapshot unit price of the extra service',
  })
  price: string;

  @ManyToOne(() => Booking, (booking) => booking.extraServices, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;

  @ManyToOne(() => BookingDay, (bookingDay) => bookingDay.extraServices, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'booking_day_id' })
  bookingDay: BookingDay | null;
}
