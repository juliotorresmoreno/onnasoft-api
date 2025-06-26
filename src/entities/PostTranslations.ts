import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Post } from './Post';
import { Language, languages } from '@/types/languages';

@Entity({ name: 'post_translations' })
export class PostTranslation {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'int', nullable: true })
  @Index()
  post_id: number;

  @ManyToOne(() => Post, { onDelete: 'SET NULL', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post?: Post;

  @Column({
    type: 'enum',
    enum: languages,
    nullable: false,
  })
  locale: Language;

  @Column({ type: 'varchar', nullable: false })
  translated_title: string;

  @Column({ type: 'varchar', nullable: true })
  translated_excerpt?: string;

  @Column({ type: 'varchar', nullable: false })
  translated_content: string;

  @Column({ type: 'varchar', nullable: true })
  slug?: string;

  @Column({ type: 'varchar', nullable: true })
  category?: string;

  @CreateDateColumn({ type: 'timestamptz', precision: 3 })
  @Index()
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz', precision: 3 })
  @Index()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date | null;
}
