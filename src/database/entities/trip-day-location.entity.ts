import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Location } from './location.entity';
import { TripDay } from './trip-day.entity';

@Entity({
  name: 'trip_day_locations',
  comment: 'Ordered location stop on a trip day',
})
export class TripDayLocation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'trip_day_id', type: 'uuid' })
  tripDayId: string;

  @Index()
  @Column({ name: 'location_id', type: 'uuid' })
  locationId: string;

  @Column({
    name: 'order',
    type: 'int',
    comment: 'Order of the location within the trip day',
  })
  order: number;

  @Column({
    name: 'visit_time',
    type: 'varchar',
    nullable: true,
    comment: 'Planned visit time',
  })
  visitTime: string | null;

  @ManyToOne(() => TripDay, (tripDay) => tripDay.locations, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'trip_day_id' })
  tripDay: TripDay;

  @ManyToOne(() => Location, (location) => location.tripDayLocations, {
    onDelete: 'RESTRICT',
    nullable: false,
  })
  @JoinColumn({ name: 'location_id' })
  location: Location;
}
