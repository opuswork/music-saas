import { Controller, Get, Param } from '@nestjs/common';
import { LessonsService } from './lessons.service';

@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  /** GET /api/lessons — Lesson list */
  @Get()
  async getLessons() {
    return this.lessonsService.getLessons();
  }

  /** GET /api/lessons/:id — Prisma 레슨 + 블록(+ asset) JSON */
  @Get(':id')
  async getLesson(@Param('id') id: string) {
    return this.lessonsService.getLessonDetail(id);
  }
}