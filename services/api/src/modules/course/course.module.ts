import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { CourseService } from './course.service';
import { CourseController, LessonController, LessonAssetController } from './course.controller';

@Module({
  imports: [PrismaModule],
  controllers: [CourseController, LessonController, LessonAssetController],
  providers: [CourseService],
  exports: [CourseService],
})
export class CourseModule {}
