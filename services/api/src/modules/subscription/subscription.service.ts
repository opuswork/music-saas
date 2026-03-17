import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateSubscriptionDto,
  SubscriptionPlan,
  SubscriptionStatus,
} from './dto/create-subscription.dto';

@Injectable()
export class SubscriptionService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateSubscriptionDto) {
    return this.prisma.subscription.create({
      data: {
        userId: dto.userId,
        plan: dto.plan ?? 'FREE',
        status: dto.status ?? 'ACTIVE',
        endedAt: dto.endedAt,
      },
    });
  }

  async findAll() {
    return this.prisma.subscription.findMany({ include: { user: true } });
  }

  async findByUserId(userId: string) {
    return this.prisma.subscription.findMany({
      where: { userId },
      include: { user: true },
    });
  }

  async findOne(id: string) {
    return this.prisma.subscription.findUnique({
      where: { id },
      include: { user: true },
    });
  }

  async updateStatus(id: string, status: SubscriptionStatus) {
    return this.prisma.subscription.update({
      where: { id },
      data: { status },
    });
  }
}
