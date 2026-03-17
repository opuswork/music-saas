import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProgressSnapshotDto } from './dto/create-progress-snapshot.dto';

@Injectable()
export class ProgressService {
  constructor(private prisma: PrismaService) {}

  async createSnapshot(dto: CreateProgressSnapshotDto) {
    return this.prisma.progressSnapshot.upsert({
      where: {
        userId_lessonId: { userId: dto.userId, lessonId: dto.lessonId },
      },
      create: {
        userId: dto.userId,
        lessonId: dto.lessonId,
        avgAccuracy: dto.avgAccuracy,
        totalPracticeSeconds: dto.totalPracticeSeconds,
      },
      update: {
        avgAccuracy: dto.avgAccuracy,
        totalPracticeSeconds: dto.totalPracticeSeconds,
        lastPracticedAt: new Date(),
      },
      include: { user: true, lesson: true },
    });
  }

  async findAll() {
    return this.prisma.progressSnapshot.findMany({
      include: { user: true, lesson: true },
    });
  }

  async findByUserId(userId: string) {
    return this.prisma.progressSnapshot.findMany({
      where: { userId },
      include: { lesson: true },
    });
  }

  async findByLessonId(lessonId: string) {
    return this.prisma.progressSnapshot.findMany({
      where: { lessonId },
      include: { user: true },
    });
  }

  async findOne(userId: string, lessonId: string) {
    return this.prisma.progressSnapshot.findUnique({
      where: {
        userId_lessonId: { userId, lessonId },
      },
      include: { user: true, lesson: true },
    });
  }
}
