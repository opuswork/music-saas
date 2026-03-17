import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** Must match schema.prisma enum Category */
export const CategoryEnum = ['PIANO', 'VOCAL', 'THEORY', 'COMPOSITION'] as const;
export type Category = (typeof CategoryEnum)[number];

/** Must match schema.prisma enum Level */
export const LevelEnum = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as const;
export type Level = (typeof LevelEnum)[number];

export class CreateCourseDto {
  @ApiProperty()
  title: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty({ enum: CategoryEnum, description: 'Course category' })
  category: Category;

  @ApiProperty({ enum: LevelEnum, description: 'Difficulty level' })
  level: Level;

  @ApiProperty({ description: 'Instructor user ID' })
  instructorId: string;

  @ApiPropertyOptional({ default: false })
  published?: boolean;
}
