import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TourDayLocation } from './tour-day-location.entity';
import { Tour } from './tour.entity';

@Entity({ name: 'tour_days', comment: 'Day within a catalog tour template' })
export class TourDay {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'tour_id', type: 'uuid' })
  tourId: string;

  @Column({
    name: 'day_number',
    type: 'int',
    comment: 'Sequential day number within the tour',
  })
  dayNumber: number;

  @Column({ type: 'varchar', comment: 'Tour day title' })
  title: string;

  @Column({
    type: 'text',
    default: '',
    comment: 'Tour day description',
  })
  description: string;

  @ManyToOne(() => Tour, (tour) => tour.days, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'tour_id' })
  tour: Tour;

  @OneToMany(
    () => TourDayLocation,
    (tourDayLocation) => tourDayLocation.tourDay,
    { cascade: true },
  )
  locations: TourDayLocation[];
}
