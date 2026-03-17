import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEnrollmentDto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  courseId: string;

  @ApiPropertyOptional({ default: false })
  completed?: boolean;
}
