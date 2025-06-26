import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  Index,
} from 'typeorm';
import { Post } from './Post';
import { User } from './User';

@Entity({ name: 'post_likes' })
@Unique(['post_id', 'user_id'])
export class PostLike {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'int' })
  @Index()
  post_id: number;

  @ManyToOne(() => Post, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post: Post;

  @Column({ type: 'int' })
  @Index()
  user_id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn({ type: 'timestamptz', precision: 3 })
  created_at: Date;
}
