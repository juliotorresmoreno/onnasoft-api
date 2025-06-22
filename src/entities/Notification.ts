import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';
import { User } from './User';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ default: false })
  read: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @CreateDateColumn({ type: 'timestamptz', precision: 3 })
  @Index()
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz', precision: 3 })
  @Index()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date | null;

  constructor(partial: Partial<Notification>) {
    Object.assign(this, partial);
    this.read = this.read || false;
    this.created_at = this.created_at || new Date();
    this.updated_at = this.updated_at || new Date();
    this.deleted_at = this.deleted_at || null;
  }
}
