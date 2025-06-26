export class CreatePostDto {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  category_id?: number;
  author_id?: number;
  cover_thumbnail_id?: number;
  cover_image_id?: number;
  published?: boolean;
  published_date?: Date;
}
