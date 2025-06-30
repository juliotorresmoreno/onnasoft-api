import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Unique,
} from 'typeorm';

@Entity({ name: 'post_translation_vectors', synchronize: false })
@Unique(['post_translation_id', 'locale'])
export class PostTranslationVector {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: false })
  post_translation_id: number;

  @Column({ type: 'varchar', length: 8, nullable: false })
  @Index()
  locale: string;

  @Column({ type: 'vector' as any, nullable: false, select: false })
  embedding: number[];

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
