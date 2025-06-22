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
import { Category } from './Category';

@Entity({ name: 'category_translations' })
export class CategoryTranslation {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'enum', enumName: 'enum_category_translations_locale' })
  locale: string;

  @Column({ type: 'varchar', nullable: false })
  translated_name: string;

  @Column({ type: 'varchar', nullable: true })
  translated_description?: string;

  @Column({ type: 'int', nullable: true })
  @Index()
  category_id: number;

  @ManyToOne(() => Category, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @CreateDateColumn({ type: 'timestamptz', precision: 3 })
  @Index()
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz', precision: 3 })
  @Index()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date | null;
}
