import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreatePostDto {
  @IsString()
  title: string;

  @IsOptional()
  @Type(() => String)
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  excerpt?: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  image_prompt?: string;

  @Type(() => Number)
  @IsNumber()
  category_id: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  cover_thumbnail_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  cover_image_id?: number;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  published?: boolean;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  published_date?: Date;
}
