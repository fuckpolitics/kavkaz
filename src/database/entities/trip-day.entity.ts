import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TripDayLocation } from './trip-day-location.entity';
import { TripExtraService } from './trip-extra-service.entity';
import { Trip } from './trip.entity';

@Entity({ name: 'trip_days', comment: 'Day within a user trip draft' })
export class TripDay {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'trip_id', type: 'uuid' })
  tripId: string;

  @Column({
    name: 'day_number',
    type: 'int',
    comment: 'Sequential day number within the trip',
  })
  dayNumber: number;

  @Column({ type: 'varchar', comment: 'Trip day title' })
  title: string;

  @Column({
    type: 'text',
    nullable: true,
    comment: 'Trip day description',
  })
  description: string | null;

  @Column({
    name: 'is_rest',
    type: 'boolean',
    default: false,
    comment: 'Rest day without excursions',
  })
  isRest: boolean;

  @ManyToOne(() => Trip, (trip) => trip.days, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'trip_id' })
  trip: Trip;

  @OneToMany(
    () => TripDayLocation,
    (tripDayLocation) => tripDayLocation.tripDay,
    { cascade: true },
  )
  locations: TripDayLocation[];

  @OneToMany(
    () => TripExtraService,
    (tripExtraService) => tripExtraService.tripDay,
  )
  extraServices: TripExtraService[];
}
