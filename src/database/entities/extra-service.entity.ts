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
import { Location } from './location.entity';
import { TourExtraService } from './tour-extra-service.entity';
import { TripExtraService } from './trip-extra-service.entity';

@Entity({ name: 'extra_services', comment: 'Catalog extra service' })
export class ExtraService {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', comment: 'Extra service name' })
  name: string;

  @Column({ type: 'text', comment: 'Extra service description' })
  description: string;

  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
    comment: 'Price of the extra service',
  })
  price: string;

  @Index()
  @Column({
    name: 'location_id',
    type: 'uuid',
    nullable: true,
    comment: 'Optional link to a location or sublocation; null = global',
  })
  locationId: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date | null;

  @ManyToOne(() => Location, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'location_id' })
  location: Location | null;

  @OneToMany(
    () => TourExtraService,
    (tourExtraService) => tourExtraService.extraService,
  )
  tourExtraServices: TourExtraService[];

  @OneToMany(
    () => TripExtraService,
    (tripExtraService) => tripExtraService.extraService,
  )
  tripExtraServices: TripExtraService[];
}
