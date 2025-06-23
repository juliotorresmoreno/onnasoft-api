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
import { Category } from './Category';
import { User } from './User';
import { Media } from './Media';
import { PostTranslation } from './PostTranslations';

@Entity({ name: 'posts' })
export class Post {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', nullable: false, default: '' })
  title: string;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  @Index({ unique: true })
  slug: string;

  @Column({ type: 'varchar', default: '', nullable: true })
  excerpt?: string;

  @Column({ type: 'varchar', nullable: false })
  content: string;

  @Column({ type: 'int', nullable: true })
  @Index()
  category_id: number;

  @ManyToOne(() => Category, { onDelete: 'SET NULL', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ type: 'int', nullable: true })
  @Index()
  author_id: number;

  @ManyToOne(() => User, { onDelete: 'SET NULL', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'author_id' })
  author: User;

  @Column({ type: 'int', nullable: true })
  @Index()
  cover_thumbnail_id?: number;

  @ManyToOne(() => Media, { onDelete: 'SET NULL', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'cover_thumbnail_id' })
  cover_thumbnail?: Media;

  @Column({ type: 'int', nullable: true })
  @Index()
  cover_image_id?: number;

  @ManyToOne(() => Media, { onDelete: 'SET NULL', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'cover_image_id' })
  cover_image?: Media;

  @OneToMany(() => PostTranslation, (translation) => translation.post)
  translations: PostTranslation[];

  @Column({ type: 'boolean', default: true, nullable: true })
  published?: boolean;

  @Column({ type: 'timestamptz', precision: 3, nullable: true })
  published_date?: Date;

  @Column({ type: 'int', default: 0, nullable: true })
  views?: number;

  @Column({ type: 'int', default: 0, nullable: true })
  likes?: number;

  @CreateDateColumn({ type: 'timestamptz', precision: 3 })
  @Index()
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz', precision: 3 })
  @Index()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date | null;
}
