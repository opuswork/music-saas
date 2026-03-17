import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '@/prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

const SALT_ROUNDS = 10;

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  /** PrismaService extends PrismaClient; cast so TS sees generated schema (user.passwordHash, etc.). */
  private get db() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.prisma as any;
  }

  async create(email: string, password: string) {
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    return this.db.user.create({
      data: {
        email,
        passwordHash,
        fullName: 'John Doe',
        firstName: 'John',
        lastName: 'Doe',
        role: 'STUDENT',
        points: 0,
        createdAt: new Date(),
        lastLoginAt: new Date(),
        subscriptions: {
          create: {
            plan: 'FREE',
            status: 'ACTIVE',
          },
        },
      },
    });
  }

  async findAll() {
    return this.db.user.findMany();
  }

  async findOne(id: string) {
    return this.db.user.findUnique({
      where: { id },
    });
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.db.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    const data: Record<string, unknown> = {};
    if (dto.email !== undefined) data.email = dto.email;
    if (dto.fullName !== undefined) data.fullName = dto.fullName;
    if (dto.firstName !== undefined) data.firstName = dto.firstName;
    if (dto.lastName !== undefined) data.lastName = dto.lastName;
    if (dto.role !== undefined) data.role = dto.role;
    if (dto.points !== undefined) data.points = dto.points;
    if (dto.password !== undefined) {
      data.passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    }
    if (Object.keys(data).length === 0) {
      return user;
    }
    return this.db.user.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    const user = await this.db.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    await this.db.user.delete({ where: { id } });
    return { deleted: true, id };
  }
}