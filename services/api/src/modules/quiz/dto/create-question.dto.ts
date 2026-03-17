import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateQuestionDto {
  @ApiProperty()
  quizId: string;

  @ApiProperty({ description: 'Question text' })
  content: string;

  @ApiProperty({ description: 'Array of options', example: ['C Major', 'G Major', 'D Minor'] })
  options: string[];

  @ApiProperty({ description: 'Correct option value' })
  answer: string;

  @ApiPropertyOptional({ default: 10 })
  points?: number;
}
