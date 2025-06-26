import { IsInt, IsOptional, IsObject } from 'class-validator';

export class CreateCommentDto {
  @IsInt()
  post_id: number;

  @IsOptional()
  @IsInt()
  reply_to_id?: number | null;

  @IsObject()
  value: Record<string, any>;
}
