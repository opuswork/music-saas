import { ApiProperty } from '@nestjs/swagger';

export class CreateProgressSnapshotDto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  lessonId: string;

  @ApiProperty()
  avgAccuracy: number;

  @ApiProperty()
  totalPracticeSeconds: number;
}
