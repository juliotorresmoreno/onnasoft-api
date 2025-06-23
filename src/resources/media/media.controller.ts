import { Controller, Get, Param, Res, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import * as mime from 'mime-types';
import { Public } from '@/utils/secure';

@Controller('media')
export class MediaController {
  @Public()
  @Get('file/:filename')
  async findOne(@Param('filename') filename: string, @Res() res: Response) {
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
}
