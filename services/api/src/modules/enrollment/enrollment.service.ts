import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';

@Injectable()
export class EnrollmentService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateEnrollmentDto) {
    return this.prisma.enrollment.create({
      data: {
        userId: dto.userId,
        courseId: dto.courseId,
        completed: dto.completed ?? false,
      },
      include: { user: true, course: true },
    });
  }

  async findAll() {
    return this.prisma.enrollment.findMany({
      include: { user: true, course: true },
    });
  }

  async findByUserId(userId: string) {
    return this.prisma.enrollment.findMany({
      where: { userId },
      include: { course: true },
    });
  }

  async findByCourseId(courseId: string) {
    return this.prisma.enrollment.findMany({
      where: { courseId },
      include: { user: true },
    });
  }

  async findOne(id: string) {
    return this.prisma.enrollment.findUnique({
      where: { id },
      include: { user: true, course: true },
    });
  }

  async updateCompleted(id: string, completed: boolean) {
    return this.prisma.enrollment.update({
      where: { id },
      data: { completed },
      include: { user: true, course: true },
    });
  }

  async remove(id: string) {
    return this.prisma.enrollment.delete({ where: { id } });
  }
}
