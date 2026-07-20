import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TripStatus } from '../enums/trip-status.enum';
import { Booking } from './booking.entity';
import { Tour } from './tour.entity';
import { TripDay } from './trip-day.entity';
import { TripExtraService } from './trip-extra-service.entity';
import { User } from './user.entity';

@Entity({
  name: 'trips',
  comment: 'Personal editable trip draft for a user',
})
export class Trip {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Index()
  @Column({ name: 'source_tour_id', type: 'uuid', nullable: true })
  sourceTourId: string | null;

  @Column({ type: 'varchar', comment: 'Trip title' })
  title: string;

  @Column({
    type: 'enum',
    enum: TripStatus,
    enumName: 'trip_status',
    default: TripStatus.DRAFT,
    comment: 'Trip lifecycle status',
  })
  status: TripStatus;

  @Column({ type: 'int', default: 1, comment: 'Number of adults' })
  adults: number;

  @Column({ type: 'int', default: 0, comment: 'Number of children' })
  children: number;

  @Column({
    name: 'estimated_price',
    type: 'numeric',
    precision: 12,
    scale: 2,
    default: 0,
    comment: 'Estimated trip price',
  })
  estimatedPrice: string;

  @Column({
    name: 'start_date',
    type: 'date',
    nullable: true,
    comment: 'Trip start date',
  })
  startDate: Date | null;

  @Column({
    name: 'end_date',
    type: 'date',
    nullable: true,
    comment: 'Trip end date',
  })
  endDate: Date | null;

  @Column({
    type: 'text',
    nullable: true,
    comment: 'User notes for the trip',
  })
  notes: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date | null;

  @ManyToOne(() => User, (user) => user.trips, {
    onDelete: 'RESTRICT',
    nullable: false,
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Tour, (tour) => tour.trips, {
    onDelete: 'RESTRICT',
    nullable: true,
  })
  @JoinColumn({ name: 'source_tour_id' })
  sourceTour: Tour | null;

  @OneToMany(() => TripDay, (tripDay) => tripDay.trip, {
    cascade: true,
  })
  days: TripDay[];

  @OneToMany(
    () => TripExtraService,
    (tripExtraService) => tripExtraService.trip,
    { cascade: true },
  )
  extraServices: TripExtraService[];

  @OneToMany(() => Booking, (booking) => booking.trip)
  bookings: Booking[];
}
