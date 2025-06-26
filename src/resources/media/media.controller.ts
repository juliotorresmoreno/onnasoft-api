import {
  Controller,
  Get,
  Param,
  Res,
  NotFoundException,
  Post,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import * as mime from 'mime-types';
import { Public } from '@/utils/secure';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Public()
  @Get('file/:filename')
  async view(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = path.join(process.cwd(), 'media', filename);

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('File not found');
    }

    const mimeType = mime.lookup(filePath) || 'application/octet-stream';

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    return this.mediaService.upload(file.buffer, file.originalname);
  }
}
