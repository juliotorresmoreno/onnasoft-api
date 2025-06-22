import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'media', synchronize: false })
export class Media {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', nullable: false })
  alt: string;

  @Column({ type: 'varchar', nullable: true })
  url?: string;

  @Column({ type: 'varchar', nullable: true })
  thumbnail_u_r_l?: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', nullable: true })
  filename?: string;

  @Column({ type: 'varchar', nullable: true })
  mime_type?: string;

  @Column({ type: 'numeric', nullable: true })
  filesize?: number;

  @Column({ type: 'numeric', nullable: true })
  width?: number;

  @Column({ type: 'numeric', nullable: true })
  height?: number;

  @Column({ type: 'numeric', nullable: true })
  focal_x?: number;

  @Column({ type: 'numeric', nullable: true })
  focal_y?: number;

  @CreateDateColumn({ type: 'timestamptz', precision: 3 })
  @Index()
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz', precision: 3 })
  @Index()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date | null;
}
