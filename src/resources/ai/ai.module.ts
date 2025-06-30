import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { MediaModule } from '../media/media.module';

@Module({
  controllers: [AiController],
  providers: [AiService],
  imports: [MediaModule],
  exports: [AiService],
})
export class AiModule {}
