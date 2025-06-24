import { IsInt, IsOptional, IsObject } from 'class-validator';

export class CreateCommentDto {
  @IsInt()
  user_id: number;

  @IsInt()
  post_id: number;

  @IsOptional()
  @IsInt()
  reply_to_id?: number;

  @IsObject()
  content: Record<string, any>;
}
