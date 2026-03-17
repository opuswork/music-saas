import { ApiProperty } from '@nestjs/swagger';

export class SubmitGradeDto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  quizId: string;

  @ApiProperty()
  score: number;

  @ApiProperty()
  totalPoints: number;

  @ApiProperty()
  passed: boolean;
}
