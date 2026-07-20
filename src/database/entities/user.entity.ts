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
import { UserRole } from '../enums/user-role.enum';
import { Booking } from './booking.entity';
import { Image } from './image.entity';
import { RefreshToken } from './refresh-token.entity';
import { Trip } from './trip.entity';

@Entity({ name: 'users', comment: 'Application user account' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({
    type: 'varchar',
    unique: true,
    nullable: true,
    comment: 'Unique user email',
  })
  email: string | null;

  @Column({
    name: 'password_hash',
    type: 'varchar',
    nullable: true,
    comment: 'Legacy password hash; unused in OTP auth',
  })
  passwordHash: string | null;

  @Column({ name: 'first_name', type: 'varchar', comment: 'User first name' })
  firstName: string;

  @Column({
    name: 'last_name',
    type: 'varchar',
    nullable: true,
    comment: 'User last name',
  })
  lastName: string | null;

  @Index({ unique: true })
  @Column({
    type: 'varchar',
    unique: true,
    nullable: true,
    comment: 'User phone number',
  })
  phone: string | null;

  @Column({
    type: 'enum',
    enum: UserRole,
    enumName: 'user_role',
    default: UserRole.USER,
    comment: 'User role',
  })
  role: UserRole;

  @Index()
  @Column({ name: 'avatar_id', type: 'uuid', nullable: true })
  avatarId: string | null;

  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
    comment: 'Whether the user account is active',
  })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date | null;

  @ManyToOne(() => Image, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'avatar_id' })
  avatar: Image | null;

  @OneToMany(() => Trip, (trip) => trip.user)
  trips: Trip[];

  @OneToMany(() => Booking, (booking) => booking.user)
  bookings: Booking[];

  @OneToMany(() => RefreshToken, (token) => token.user)
  refreshTokens: RefreshToken[];
}
