import { ApiProperty } from '@nestjs/swagger';

export class CreateLessonDto {
  @ApiProperty()
  title: string;

  @ApiProperty()
  orderIndex: number;

  @ApiProperty()
  durationSeconds: number;

  @ApiProperty()
  courseId: string;
}
