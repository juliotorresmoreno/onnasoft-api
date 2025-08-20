import { Configuration } from '@/types/configuration';
import { Injectable, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmbeddingService {
  private readonly endpoint: string = 'http://localhost:8001/embed';

  constructor(@Inject() private readonly configService: ConfigService) {
    const config = this.configService.get('config') as Configuration;

    this.endpoint = config.embedding.endpoint || this.endpoint;
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const res = await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        console.log(res.status, res.statusText, await res.text());
        throw new Error(`HTTP error: ${res.status}`);
      }

      const data = await res.json();

      if (!data.embedding || !Array.isArray(data.embedding)) {
        throw new Error('Invalid response format');
      }

      return data.embedding;
    } catch (error) {
      throw new HttpException(
        'Error al obtener embedding desde el servicio Python: ' + error.message,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }
}
