import { PartialType } from '@nestjs/swagger';
import { CreatePostTranslationDto } from './create-post-translation.dto';

export class UpdatePostTranslationDto extends PartialType(CreatePostTranslationDto) {}
