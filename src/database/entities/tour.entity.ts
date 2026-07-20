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
import { Booking } from './booking.entity';
import { Destination } from './destination.entity';
import { Image } from './image.entity';
import { TourDay } from './tour-day.entity';
import { TourExtraService } from './tour-extra-service.entity';
import { Trip } from './trip.entity';

@Entity({
  name: 'tours',
  comment: 'Catalog tour template managed by administrators',
})
export class Tour {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'destination_id', type: 'uuid' })
  destinationId: string;

  @Column({ type: 'varchar', comment: 'Tour title' })
  title: string;

  @Column({ type: 'text', comment: 'Tour description' })
  description: string;

  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
    comment: 'Tour base price',
  })
  price: string;

  @Column({
    name: 'duration_days',
    type: 'int',
    comment: 'Tour duration in days',
  })
  durationDays: number;

  @Index()
  @Column({ name: 'cover_image_id', type: 'uuid', nullable: true })
  coverImageId: string | null;

  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
    comment: 'Whether the tour is active in the catalog',
  })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date | null;

  @ManyToOne(() => Destination, (destination) => destination.tours, {
    onDelete: 'RESTRICT',
    nullable: false,
  })
  @JoinColumn({ name: 'destination_id' })
  destination: Destination;

  @ManyToOne(() => Image, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'cover_image_id' })
  coverImage: Image | null;

  @OneToMany(() => TourDay, (tourDay) => tourDay.tour, {
    cascade: true,
  })
  days: TourDay[];

  @OneToMany(
    () => TourExtraService,
    (tourExtraService) => tourExtraService.tour,
    { cascade: true },
  )
  extraServices: TourExtraService[];

  @OneToMany(() => Trip, (trip) => trip.sourceTour)
  trips: Trip[];

  @OneToMany(() => Booking, (booking) => booking.tour)
  bookings: Booking[];
}
