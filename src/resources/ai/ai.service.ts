import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ContentListUnion, GoogleGenAI } from '@google/genai';
import { ConfigService } from '@nestjs/config';
import { Configuration } from '@/types/configuration';
import { MediaService } from '../media/media.service';
import * as sharp from 'sharp';
import { Language, languageNames } from '@/types/languages';

@Injectable()
export class AiService {
  private readonly genAI: GoogleGenAI;
  private readonly GEMMA_MODEL = 'gemini-2.5-flash-preview-tts';
  private readonly GEMMA_IMAGE_MODEL = 'gemini-2.0-flash-exp-image-generation';

  constructor(
    private readonly configService: ConfigService,
    private readonly mediaService: MediaService,
  ) {
    const config = this.configService.get('config') as Configuration;
    const apiKey = config.google.googleApiKey;

    this.genAI = new GoogleGenAI({ apiKey });
  }

  async generateImage(prompt: string) {
    try {
      const filename = this.generateFilenameFromPrompt(prompt);

      const result = await this.genAI.models.generateContent({
        model: this.GEMMA_IMAGE_MODEL,
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `You are generating an illustration for a blog post. The image should be suitable as a featured 
                      thumbnail for a technical blog article. It should be visually engaging and square or rectangular 
                      for web display. Prompt: "${prompt}"`,
              },
            ],
          },
        ],
        config: {
          responseModalities: ['Text', 'Image'],
        },
      });

      const imagePart = result?.candidates?.[0]?.content?.parts?.find(
        (part) => 'inlineData' in part,
      );

      if (!imagePart?.inlineData?.data) {
        throw new Error('No se recibieron datos de imagen de la API');
      }

      const buffer = Buffer.from(imagePart.inlineData.data, 'base64');

      const webpBuffer = await sharp(buffer).toFormat('webp').toBuffer();
      const thumbBuffer = await sharp(webpBuffer)
        .resize({ width: 300 })
        .toFormat('webp')
        .toBuffer();

      const uploadResult = await this.mediaService.upload(webpBuffer, filename);
      const thumbResult = await this.mediaService.upload(
        thumbBuffer,
        `thumb-${filename}`,
      );

      return {
        id: uploadResult.id,
        filename: uploadResult.filename,
        mime_type: uploadResult.mime_type,
        filesize: uploadResult.filesize,
        width: uploadResult.width,
        height: uploadResult.height,
        thumbnail: {
          id: thumbResult.id,
          filename: thumbResult.filename,
          mime_type: thumbResult.mime_type,
          filesize: thumbResult.filesize,
          width: thumbResult.width,
          height: thumbResult.height,
        },
      };
    } catch (error) {
      console.error('Error al generar imagen con Gemma API:', error);
      throw new InternalServerErrorException(
        'Fallo al generar imagen de IA. Inténtalo de nuevo más tarde.',
      );
    }
  }

  private generateFilenameFromPrompt(prompt: string): string {
    // Limpiar el prompt
    const cleanPrompt = prompt
      .toLowerCase()
      .replace(/[^a-z0-9áéíóúüñ\s-]/g, '') // Eliminar caracteres especiales
      .replace(/\s+/g, '-') // Reemplazar espacios con guiones
      .substring(0, 40); // Limitar longitud (dejando espacio para otros componentes)

    // Timestamp con milisegundos para mayor precisión
    const now = new Date();
    const timestamp = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0'),
      String(now.getHours()).padStart(2, '0'),
      String(now.getMinutes()).padStart(2, '0'),
      String(now.getSeconds()).padStart(2, '0'),
      String(now.getMilliseconds()).padStart(3, '0'),
    ].join('');

    // Parte aleatoria de 6 caracteres (base36)
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();

    return `${cleanPrompt}-${timestamp}-${randomPart}.webp`;
  }

  /**
   * Genera una respuesta utilizando el modelo Gemma de Google.
   * @param prompt El texto de entrada para el modelo de IA.
   * @returns La respuesta generada por el modelo.
   * @throws InternalServerErrorException si hay un problema con la configuración de la API o la llamada al modelo.
   */
  async generateResponse(
    prompt: string,
    instructions?: string,
  ): Promise<{ response: string }> {
    try {
      const contents: ContentListUnion = [];
      if (instructions) {
        contents.push({
          role: 'user',
          parts: [{ text: instructions }],
        });
      }
      contents.push({
        role: 'user',
        parts: [{ text: prompt }],
      });
      const result = await this.genAI.models.generateContent({
        model: this.GEMMA_MODEL,
        contents,
      });

      const textPart = result?.candidates?.[0]?.content?.parts?.find(
        (part) => 'text' in part,
      );
      const text = typeof textPart?.text === 'string' ? textPart.text : '';

      if (!text) {
        throw new Error('La respuesta del modelo de IA no contiene texto.');
      }

      return { response: text };
    } catch (error) {
      console.error('Error al generar respuesta con Gemma API:', error);
      throw new InternalServerErrorException(
        'Fallo al generar respuesta de IA. Inténtalo de nuevo más tarde.',
      );
    }
  }

  async generateContent(title: string, excerpt?: string, content?: string) {
    const instructions = `You are a technical writer. Write a detailed, in-depth technical article in 
          Markdown format (aim for around 10000 words).
          Prioritize clarity and educational value. Use headings (#, ##), bullet points, and structured 
          sections to organize the content.
          Only include one or two short code examples if the target audience is technical and the concept 
          clearly benefits from code illustration. 
          Avoid long or repetitive code blocks.
          Do not include meta comments, placeholders, or any hyperlinks (e.g. "[link here]", "[image here]", 
          "insert CTA", or actual URLs).
          Only return the article content exactly as it should be published.`;

    const prompt = `Title: ${title}\n\nReference content: ${content}\n\nSuggested focus: "${excerpt}"`;

    const { response } = await this.generateResponse(prompt, instructions);

    return response;
  }

  async translate(text: string, targetLang: Language) {
    if (!text) return '';
    const instructions = `You are a translator. Translate everything to ${languageNames[targetLang]} with no explanations.`;

    return (await this.generateResponse(text, instructions)).response;
  }
}
