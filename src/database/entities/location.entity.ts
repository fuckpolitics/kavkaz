import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Destination } from './destination.entity';
import { Image } from './image.entity';
import { TourDayLocation } from './tour-day-location.entity';
import { TripDayLocation } from './trip-day-location.entity';

@Entity({
  name: 'locations',
  comment: 'Location within a destination; may nest under a parent location',
})
export class Location {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'destination_id', type: 'uuid' })
  destinationId: string;

  @Index()
  @Column({ name: 'parent_id', type: 'uuid', nullable: true })
  parentId: string | null;

  @Column({ type: 'varchar', comment: 'Location display name' })
  name: string;

  @Column({ type: 'text', comment: 'Location description' })
  description: string;

  @Column({
    type: 'double precision',
    nullable: true,
    comment: 'Geographic latitude',
  })
  latitude: number | null;

  @Column({
    type: 'double precision',
    nullable: true,
    comment: 'Geographic longitude',
  })
  longitude: number | null;

  @Column({
    type: 'varchar',
    nullable: true,
    comment: 'Human-readable address',
  })
  address: string | null;

  @Column({
    name: 'visit_duration_minutes',
    type: 'int',
    nullable: true,
    comment: 'Suggested visit duration in minutes',
  })
  visitDurationMinutes: number | null;

  @Column({
    name: 'travel_from_base_minutes',
    type: 'int',
    nullable: true,
    comment: 'One-way travel time from base city to this location (minutes)',
  })
  travelFromBaseMinutes: number | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date | null;

  @ManyToOne(() => Destination, (destination) => destination.locations, {
    onDelete: 'RESTRICT',
    nullable: false,
  })
  @JoinColumn({ name: 'destination_id' })
  destination: Destination;

  @ManyToOne(() => Location, (location) => location.children, {
    onDelete: 'RESTRICT',
    nullable: true,
  })
  @JoinColumn({ name: 'parent_id' })
  parent: Location | null;

  @OneToMany(() => Location, (location) => location.parent)
  children: Location[];

  @ManyToMany(() => Image)
  @JoinTable({
    name: 'location_images',
    joinColumn: { name: 'location_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'image_id', referencedColumnName: 'id' },
  })
  images: Image[];

  @OneToMany(
    () => TourDayLocation,
    (tourDayLocation) => tourDayLocation.location,
  )
  tourDayLocations: TourDayLocation[];

  @OneToMany(
    () => TripDayLocation,
    (tripDayLocation) => tripDayLocation.location,
  )
  tripDayLocations: TripDayLocation[];
}
