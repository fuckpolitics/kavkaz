import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ExtraService } from './extra-service.entity';
import { Tour } from './tour.entity';

/**
 * Extra service offered with a Tour. Deleted when parent Tour is deleted.
 */
@Entity({
  name: 'tour_extra_services',
  comment: 'Extra service linked to a catalog tour',
})
export class TourExtraService {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'tour_id', type: 'uuid' })
  tourId: string;

  @Index()
  @Column({ name: 'extra_service_id', type: 'uuid' })
  extraServiceId: string;

  @Column({
    name: 'day_number',
    type: 'int',
    nullable: true,
    comment: 'Optional day number this extra service applies to',
  })
  dayNumber: number | null;

  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
    comment: 'Price of the extra service for this tour',
  })
  price: string;

  @ManyToOne(() => Tour, (tour) => tour.extraServices, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'tour_id' })
  tour: Tour;

  @ManyToOne(
    () => ExtraService,
    (extraService) => extraService.tourExtraServices,
    { onDelete: 'RESTRICT', nullable: false },
  )
  @JoinColumn({ name: 'extra_service_id' })
  extraService: ExtraService;
}
