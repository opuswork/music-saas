import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BlockType, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

const INT32_MIN = -0x8000_0000;
const INT32_MAX = 0x7fff_ffff;

function assertOrderIndexInteger(orderIndex: number) {
  if (!Number.isInteger(orderIndex)) {
    throw new BadRequestException('orderIndex must be an integer.');
  }
  if (orderIndex < INT32_MIN || orderIndex > INT32_MAX) {
    throw new BadRequestException('orderIndex is out of allowed range for storage.');
  }
}

@Injectable()
export class LessonBlocksService {
  constructor(private prisma: PrismaService) {}

  async listByLesson(lessonId: string) {
    await this.ensureLesson(lessonId);
    return this.prisma.lessonBlock.findMany({
      where: { lessonId },
      orderBy: { orderIndex: 'asc' },
      include: { asset: true },
    });
  }

  async getOne(id: string) {
    const block = await this.prisma.lessonBlock.findUnique({
      where: { id },
      include: { asset: true },
    });
    if (!block) {
      throw new NotFoundException(`LessonBlock ${id} not found`);
    }
    return block;
  }

  async create(data: {
    lessonId: string;
    type: BlockType;
    orderIndex: number;
    content?: string | null;
    assetId?: string | null;
    practiceId?: string | null;
  }) {
    assertOrderIndexInteger(data.orderIndex);
    await this.ensureLesson(data.lessonId);
    await this.assertOrderIndexFreeInLesson(
      data.lessonId,
      data.orderIndex,
      undefined,
    );
    if (data.assetId) {
      await this.ensureAssetForLesson(data.assetId, data.lessonId);
    }
    return this.prisma.lessonBlock.create({
      data: {
        lessonId: data.lessonId,
        type: data.type,
        orderIndex: data.orderIndex,
        content: data.content ?? null,
        assetId: data.assetId ?? null,
        practiceId: data.practiceId?.trim() || null,
      },
      include: { asset: true },
    });
  }

  async update(
    id: string,
    data: {
      type?: BlockType;
      orderIndex?: number;
      content?: string | null;
      assetId?: string | null;
      practiceId?: string | null;
    },
  ) {
    const existing = await this.prisma.lessonBlock.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`LessonBlock ${id} not found`);
    }
    if (data.orderIndex !== undefined) {
      assertOrderIndexInteger(data.orderIndex);
      if (data.orderIndex !== existing.orderIndex) {
        await this.assertOrderIndexFreeInLesson(
          existing.lessonId,
          data.orderIndex,
          id,
        );
      }
    }
    if (data.assetId) {
      await this.ensureAssetForLesson(data.assetId, existing.lessonId);
    }
    const updateData: Prisma.LessonBlockUpdateInput = {};
    if (data.type !== undefined) updateData.type = data.type;
    if (data.orderIndex !== undefined) updateData.orderIndex = data.orderIndex;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.assetId !== undefined) {
      updateData.asset = data.assetId?.trim()
        ? { connect: { id: data.assetId.trim() } }
        : { disconnect: true };
    }
    if (data.practiceId !== undefined) {
      updateData.practiceId = data.practiceId?.trim() || null;
    }
    return this.prisma.lessonBlock.update({
      where: { id },
      data: updateData,
      include: { asset: true },
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.lessonBlock.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`LessonBlock ${id} not found`);
    }
    await this.prisma.lessonBlock.delete({ where: { id } });
    return { ok: true, id };
  }

  private async assertOrderIndexFreeInLesson(
    lessonId: string,
    orderIndex: number,
    excludeBlockId: string | undefined,
  ) {
    const clash = await this.prisma.lessonBlock.findFirst({
      where: {
        lessonId,
        orderIndex,
        ...(excludeBlockId ? { id: { not: excludeBlockId } } : {}),
      },
      select: { id: true },
    });
    if (clash) {
      throw new BadRequestException(
        'This order index is already used by another block in this lesson.',
      );
    }
  }

  private async ensureLesson(lessonId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { id: true },
    });
    if (!lesson) {
      throw new NotFoundException(`Lesson ${lessonId} not found`);
    }
  }

  private async ensureAssetForLesson(assetId: string, lessonId: string) {
    const asset = await this.prisma.lessonAsset.findFirst({
      where: { id: assetId, lessonId },
    });
    if (!asset) {
      throw new BadRequestException(
        `LessonAsset ${assetId} not found for this lesson`,
      );
    }
  }
}
