import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentStatus } from '@prisma/client';

@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePaymentDto) {
    return this.prisma.payment.create({
      data: {
        userId: dto.userId,
        provider: dto.provider as any,
        amount: dto.amount,
        currency: dto.currency ?? 'KRW',
        status: dto.status as any,
      },
      include: { user: true },
    });
  }

  async findAll() {
    return this.prisma.payment.findMany({ include: { user: true } });
  }

  async findByUserId(userId: string) {
    return this.prisma.payment.findMany({
      where: { userId },
      include: { user: true },
    });
  }

  async findOne(id: string) {
    return this.prisma.payment.findUnique({
      where: { id },
      include: { user: true },
    });
  }

  async updateStatus(id: string, status: PaymentStatus) {
    return this.prisma.payment.update({
      where: { id },
      data: { status },
      include: { user: true },
    });
  }
}
