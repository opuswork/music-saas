/**
 * PracticeService
 * @description PracticeService is a service for the practice module
 * @author Taeyoung Seon
 * @date 2026-03-01
 * services/api/src/modules/practice/practice.service.ts
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PracticeService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.practiceSession.findMany({
      include: {
        events: true,
      },
    });
  }

  async create(body: { userId: string; lessonId: string }) {
    const session = await this.prisma.practiceSession.create({
      data: {
        userId: body.userId,
        lessonId: body.lessonId,
      } as Parameters<PrismaService['practiceSession']['create']>[0]['data'],
    });

    return session;
  }
}