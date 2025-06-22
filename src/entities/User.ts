import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Media } from './Media';

@Entity({
  name: 'users',
  synchronize: false,
})
export class User {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ length: 255, default: '' })
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({
    type: 'varchar',
    length: 255,
    select: false,
    comment: 'Hashed password for security',
    default: '',
  })
  password: string;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ nullable: true, type: 'varchar' })
  verificationToken: string | null;

  @Column({ nullable: true, type: 'timestamp' })
  verificationTokenExpiresAt: Date | null;

  @Column({ nullable: true, type: 'varchar' })
  passwordResetToken: string | null;

  @Column({ nullable: true, type: 'timestamp' })
  passwordResetTokenExpiresAt: Date | null;

  @Column({
    type: 'enum',
    enum: ['es', 'en', 'fr', 'ja', 'zh'],
    default: 'en',
  })
  language: string;

  @Column({ type: 'varchar', length: 100, default: 'UTC' })
  timezone: string;

  @Column({ default: false })
  newsletter?: boolean;

  @Column({ type: 'int', nullable: true })
  @Index()
  photo_id?: number;

  @OneToOne(() => Media, { onDelete: 'SET NULL', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'photo_id' })
  photo?: Media;

  @Column({
    type: 'enum',
    enum: ['free', 'basic', 'pro', 'premium'],
    default: 'free',
  })
  plan: string;

  @Column({ type: 'varchar', nullable: true })
  position?: string;

  @Column({ type: 'varchar', nullable: true })
  linked_in?: string;

  @Column({ type: 'varchar', nullable: true })
  github?: string;

  @Column({ type: 'varchar', nullable: true })
  website?: string;

  @Column({ type: 'varchar', nullable: true })
  bio?: string;

  @CreateDateColumn({ type: 'timestamptz', precision: 3 })
  @Index()
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz', precision: 3 })
  @Index()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date | null;
}
