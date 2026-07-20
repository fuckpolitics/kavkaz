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
import { Image } from './image.entity';
import { Location } from './location.entity';
import { Tour } from './tour.entity';

@Entity({ name: 'destinations', comment: 'Catalog destination' })
export class Destination {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', comment: 'Destination display name' })
  name: string;

  @Index({ unique: true })
  @Column({
    type: 'varchar',
    unique: true,
    comment: 'Unique URL-friendly slug',
  })
  slug: string;

  @Column({ type: 'text', comment: 'Destination description' })
  description: string;

  @Index()
  @Column({ name: 'cover_image_id', type: 'uuid', nullable: true })
  coverImageId: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date | null;

  @ManyToOne(() => Image, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'cover_image_id' })
  coverImage: Image | null;

  @OneToMany(() => Location, (location) => location.destination)
  locations: Location[];

  @OneToMany(() => Tour, (tour) => tour.destination)
  tours: Tour[];
}
