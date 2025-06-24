import { Injectable, HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class EmbeddingService {
  private readonly endpoint = 'http://localhost:8001/embed';

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const res = await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
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
