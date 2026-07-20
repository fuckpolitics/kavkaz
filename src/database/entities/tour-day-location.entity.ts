import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Location } from './location.entity';
import { TourDay } from './tour-day.entity';

/**
 * Location stop on a TourDay. Deleted when parent Tour/TourDay is deleted.
 * Location delete is RESTRICT while referenced.
 */
@Entity({
  name: 'tour_day_locations',
  comment: 'Ordered location stop on a tour day',
})
export class TourDayLocation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'tour_day_id', type: 'uuid' })
  tourDayId: string;

  @Index()
  @Column({ name: 'location_id', type: 'uuid' })
  locationId: string;

  @Column({
    name: 'order',
    type: 'int',
    comment: 'Order of the location within the tour day',
  })
  order: number;

  @Column({
    name: 'is_required',
    type: 'boolean',
    comment: 'Whether the location is required on this tour day',
  })
  isRequired: boolean;

  @ManyToOne(() => TourDay, (tourDay) => tourDay.locations, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'tour_day_id' })
  tourDay: TourDay;

  @ManyToOne(() => Location, (location) => location.tourDayLocations, {
    onDelete: 'RESTRICT',
    nullable: false,
  })
  @JoinColumn({ name: 'location_id' })
  location: Location;
}
