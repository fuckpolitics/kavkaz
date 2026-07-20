import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BookingStatus } from '../enums/booking-status.enum';
import { BookingDay } from './booking-day.entity';
import { BookingExtraService } from './booking-extra-service.entity';
import { Tour } from './tour.entity';
import { Trip } from './trip.entity';
import { User } from './user.entity';

@Entity({
  name: 'bookings',
  comment: 'Immutable booking snapshot created from a Trip',
})
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Index()
  @Column({ name: 'trip_id', type: 'uuid', nullable: true })
  tripId: string | null;

  @Index()
  @Column({ name: 'tour_id', type: 'uuid', nullable: true })
  tourId: string | null;

  @Column({ type: 'int', default: 1, comment: 'Number of adults' })
  adults: number;

  @Column({ type: 'int', default: 0, comment: 'Number of children' })
  children: number;

  @Column({
    name: 'total_price',
    type: 'numeric',
    precision: 12,
    scale: 2,
    comment: 'Total booking price',
  })
  totalPrice: string;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    enumName: 'booking_status',
    comment: 'Booking lifecycle status',
  })
  status: BookingStatus;

  @Column({
    type: 'text',
    nullable: true,
    comment: 'Optional booking comment',
  })
  comment: string | null;

  @Column({
    name: 'trip_title',
    type: 'varchar',
    comment: 'Snapshot of trip title at booking time',
  })
  tripTitle: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.bookings, {
    onDelete: 'RESTRICT',
    nullable: false,
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Trip, (trip) => trip.bookings, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'trip_id' })
  trip: Trip | null;

  @ManyToOne(() => Tour, (tour) => tour.bookings, {
    onDelete: 'RESTRICT',
    nullable: true,
  })
  @JoinColumn({ name: 'tour_id' })
  tour: Tour | null;

  @OneToMany(() => BookingDay, (bookingDay) => bookingDay.booking, {
    cascade: true,
  })
  days: BookingDay[];

  @OneToMany(
    () => BookingExtraService,
    (bookingExtraService) => bookingExtraService.booking,
    { cascade: true },
  )
  extraServices: BookingExtraService[];
}
