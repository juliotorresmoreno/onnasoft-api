import { Body, Controller, Post, SetMetadata } from '@nestjs/common';
import { AiService } from './ai.service';
import { Role } from '@/types/role';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @SetMetadata('roles', [Role.Admin])
  @Post('generate-image')
  async generateImagenResponse(@Body('prompt') prompt: string) {
    return this.aiService.generateImage(prompt);
  }

  @SetMetadata('roles', [Role.Admin])
  @Post('generate')
  async generateResponse(
    @Body('prompt') prompt: string,
  ): Promise<{ response: string }> {
    return this.aiService.generateResponse(prompt);
  }
}
