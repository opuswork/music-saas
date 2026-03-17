import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateQuizDto {
  @ApiProperty()
  courseId: string;

  @ApiProperty()
  lessonId: string;

  @ApiProperty()
  title: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional({ default: 60 })
  passingScore?: number;

  @ApiPropertyOptional({ default: 100 })
  rewardPoints?: number;
}
