import { Injectable, NotFoundException } from '@nestjs/common';
import { BlockType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

/** Row shape for `findMany` with `include.blocks` (all Lesson scalars + relation). */
type LessonListRow = {
  id: string;
  title: string;
  description: string | null;
  orderIndex: number;
  courseId: string;
  createdAt: Date;
  blocks: { content: string | null }[];
};

@Injectable()
export class LessonsService {
  constructor(private prisma: PrismaService) {}

  async getLessons() {
    const lessons = (await this.prisma.lesson.findMany({
      orderBy: [{ orderIndex: 'asc' }, { createdAt: 'asc' }],
      include: {
        blocks: {
          where: { type: BlockType.TEXT },
          orderBy: { orderIndex: 'asc' },
          take: 1,
          select: { content: true },
        },
      },
    })) as LessonListRow[];

    return lessons.map((lesson) => {
      const fromColumn = lesson.description?.trim();
      if (fromColumn) {
        return {
          id: lesson.id,
          title: lesson.title,
          orderIndex: lesson.orderIndex,
          description: fromColumn,
        };
      }

      const rawDescription = lesson.blocks[0]?.content ?? '';
      const derived = rawDescription
        .replace(/[#>*_`~-]/g, ' ')
        .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 180);

      return {
        id: lesson.id,
        title: lesson.title,
        orderIndex: lesson.orderIndex,
        description: derived || 'Start this lesson to view details.',
      };
    });
  }

  async getLessonDetail(id: string) {
    console.log('--- [DEBUG] Start ID:', id);

    try {
      // 1. Prisma query execution
      const lesson = await this.prisma.lesson.findUnique({
        where: { id },
        include: {
          blocks: {
            orderBy: { orderIndex: 'asc' },
            include: {
              asset: true,
            },
          },
        },
      });

      // 2. Log the result value
      console.log(
        '--- [DEBUG] Prisma Result:',
        lesson ? 'Data found' : 'Data not found',
      );

      if (!lesson) {
        throw new NotFoundException(`Lesson with ID ${id} not found`);
      }

      // 3. Return the result
      return lesson;
    } catch (error) {
      console.error('--- [DEBUG] Error:', error);
      throw error;
    }
  }
}
