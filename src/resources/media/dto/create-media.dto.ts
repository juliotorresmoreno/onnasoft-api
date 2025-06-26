export class CreateMediaDto {
  filename: string;
  mime_type: string;
  filesize: number;

  width?: number;
  height?: number;
}
