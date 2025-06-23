import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Post } from './Post';
import { CategoryTranslation } from './CategoryTranslation';

@Entity({ name: 'categories' })
export class Category {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'name', type: 'varchar', nullable: false })
  name: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', nullable: false, unique: true })
  slug: string;

  @Column({ type: 'varchar', nullable: true })
  description?: string;

  @OneToMany(() => Post, (post) => post.category)
  posts: Post[];

  @Column({ type: 'int', default: 0, nullable: true })
  post_count?: number;

  @OneToMany(() => CategoryTranslation, (translation) => translation.category)
  translations?: CategoryTranslation[];

  @CreateDateColumn({ type: 'timestamptz', precision: 3 })
  @Index()
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz', precision: 3 })
  @Index()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date | null;
}
