import { ApiProperty } from '@nestjs/swagger';

export class RegisterResponseDto {
  @ApiProperty()
  message: string;

  @ApiProperty()
  statusCode: number;
}
