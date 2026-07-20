import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ExtraService } from './extra-service.entity';
import { TripDay } from './trip-day.entity';
import { Trip } from './trip.entity';

@Entity({
  name: 'trip_extra_services',
  comment: 'Extra service linked to a user trip draft',
})
export class TripExtraService {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'trip_id', type: 'uuid' })
  tripId: string;

  @Index()
  @Column({ name: 'trip_day_id', type: 'uuid', nullable: true })
  tripDayId: string | null;

  @Index()
  @Column({ name: 'extra_service_id', type: 'uuid' })
  extraServiceId: string;

  @Column({
    type: 'int',
    default: 1,
    comment: 'Quantity of the extra service',
  })
  quantity: number;

  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
    comment: 'Unit price of the extra service for this trip',
  })
  price: string;

  @ManyToOne(() => Trip, (trip) => trip.extraServices, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'trip_id' })
  trip: Trip;

  @ManyToOne(() => TripDay, (tripDay) => tripDay.extraServices, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'trip_day_id' })
  tripDay: TripDay | null;

  @ManyToOne(
    () => ExtraService,
    (extraService) => extraService.tripExtraServices,
    { onDelete: 'RESTRICT', nullable: false },
  )
  @JoinColumn({ name: 'extra_service_id' })
  extraService: ExtraService;
}
