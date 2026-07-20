import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'otp_codes', comment: 'One-time verification codes' })
export class OtpCode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'varchar', comment: 'Email or phone contact' })
  contact: string;

  @Column({
    type: 'varchar',
    length: 16,
    comment: 'Channel: email or phone',
  })
  channel: 'email' | 'phone';

  @Column({ type: 'varchar', length: 8, comment: 'OTP code' })
  code: string;

  @Column({
    name: 'expires_at',
    type: 'timestamptz',
    comment: 'Code expiry',
  })
  expiresAt: Date;

  @Column({
    name: 'consumed_at',
    type: 'timestamptz',
    nullable: true,
  })
  consumedAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
