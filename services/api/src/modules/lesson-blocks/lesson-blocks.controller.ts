import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { BlockType } from '@prisma/client';
import { LessonBlocksService } from './lesson-blocks.service';

@Controller('lesson-blocks')
export class LessonBlocksController {
  constructor(private readonly service: LessonBlocksService) {}

  /** GET /api/lesson-blocks?lessonId=... */
  @Get()
  async list(@Query('lessonId') lessonId: string) {
    if (!lessonId?.trim()) {
      return [];
    }
    return this.service.listByLesson(lessonId.trim());
  }

  /** GET /api/lesson-blocks/:id */
  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.service.getOne(id);
  }

  /** POST /api/lesson-blocks */
  @Post()
  async create(
    @Body()
    body: {
      lessonId: string;
      type: string;
      orderIndex: number;
      content?: string | null;
      assetId?: string | null;
      practiceId?: string | null;
    },
  ) {
    const type = body.type as BlockType;
    if (!Object.values(BlockType).includes(type)) {
      throw new BadRequestException(`Invalid BlockType: ${body.type}`);
    }
    return this.service.create({
      lessonId: body.lessonId,
      type,
      orderIndex: Number(body.orderIndex),
      content: body.content,
      assetId: body.assetId,
      practiceId: body.practiceId,
    });
  }

  /** PATCH /api/lesson-blocks/:id */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body()
    body: {
      type?: string;
      orderIndex?: number;
      content?: string | null;
      assetId?: string | null;
      practiceId?: string | null;
    },
  ) {
    const payload: Parameters<LessonBlocksService['update']>[1] = {};
    if (body.type !== undefined) {
      const t = body.type as BlockType;
      if (!Object.values(BlockType).includes(t)) {
        throw new BadRequestException(`Invalid BlockType: ${body.type}`);
      }
      payload.type = t;
    }
    if (body.orderIndex !== undefined) {
      payload.orderIndex = Number(body.orderIndex);
    }
    if (body.content !== undefined) payload.content = body.content;
    if (body.assetId !== undefined) payload.assetId = body.assetId;
    if (body.practiceId !== undefined) payload.practiceId = body.practiceId;
    return this.service.update(id, payload);
  }

  /** DELETE /api/lesson-blocks/:id */
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
