import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'images', comment: 'Uploaded image metadata' })
export class Image {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', comment: 'Stored filename on disk' })
  filename: string;

  @Column({
    name: 'original_name',
    type: 'varchar',
    comment: 'Original uploaded filename',
  })
  originalName: string;

  @Column({
    name: 'mime_type',
    type: 'varchar',
    comment: 'MIME type of the file',
  })
  mimeType: string;

  @Column({ type: 'int', comment: 'File size in bytes' })
  size: number;

  @Column({ type: 'int', nullable: true, comment: 'Image width in pixels' })
  width: number | null;

  @Column({ type: 'int', nullable: true, comment: 'Image height in pixels' })
  height: number | null;

  @Column({ type: 'varchar', comment: 'Public URL of the image' })
  url: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
