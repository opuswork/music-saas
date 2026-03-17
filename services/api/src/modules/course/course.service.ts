import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { CreateLessonAssetDto } from './dto/create-lesson-asset.dto';

@Injectable()
export class CourseService {
  constructor(private prisma: PrismaService) {}

  // Courses
  async createCourse(dto: CreateCourseDto) {
    return this.prisma.course.create({
      data: {
        title: dto.title,
        description: dto.description,
        category: dto.category,
        level: dto.level,
        instructorId: dto.instructorId,
        published: dto.published ?? false,
      },
    });
  }

  async findAllCourses() {
    return this.prisma.course.findMany({
      include: { instructor: true, lessons: true },
    });
  }

  async findOneCourse(id: string) {
    return this.prisma.course.findUnique({
      where: { id },
      include: { instructor: true, lessons: { orderBy: { orderIndex: 'asc' } } },
    });
  }

  async updateCourse(id: string, dto: UpdateCourseDto) {
    return this.prisma.course.update({
      where: { id },
      data: dto as any,
    });
  }

  async removeCourse(id: string) {
    return this.prisma.course.delete({ where: { id } });
  }

  // Lessons
  async createLesson(dto: CreateLessonDto) {
    return this.prisma.lesson.create({
      data: {
        title: dto.title,
        orderIndex: dto.orderIndex,
        durationSeconds: dto.durationSeconds,
        courseId: dto.courseId,
      },
    });
  }

  async findLessonsByCourseId(courseId: string) {
    return this.prisma.lesson.findMany({
      where: { courseId },
      orderBy: { orderIndex: 'asc' },
      include: { assets: true },
    });
  }

  async findOneLesson(id: string) {
    return this.prisma.lesson.findUnique({
      where: { id },
      include: { course: true, assets: true },
    });
  }

  async updateLesson(id: string, dto: UpdateLessonDto) {
    return this.prisma.lesson.update({
      where: { id },
      data: dto as any,
    });
  }

  async removeLesson(id: string) {
    return this.prisma.lesson.delete({ where: { id } });
  }

  // Lesson assets
  async createLessonAsset(dto: CreateLessonAssetDto) {
    return this.prisma.lessonAsset.create({
      data: {
        lessonId: dto.lessonId,
        type: dto.type,
        url: dto.url,
        metadata: dto.metadata ?? undefined,
      },
    });
  }

  async findAssetsByLessonId(lessonId: string) {
    return this.prisma.lessonAsset.findMany({ where: { lessonId } });
  }

  async findOneLessonAsset(id: string) {
    return this.prisma.lessonAsset.findUnique({
      where: { id },
      include: { lesson: true },
    });
  }

  async removeLessonAsset(id: string) {
    return this.prisma.lessonAsset.delete({ where: { id } });
  }
}
