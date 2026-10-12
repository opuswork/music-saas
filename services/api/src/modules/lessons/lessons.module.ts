// services/api/src/modules/lessons/lessons.module.ts
import { Module } from '@nestjs/common';
import { LessonsController } from './lessons.controller';
import { LessonsService } from './lessons.service';
import { PrismaModule } from '../../prisma/prisma.module'; // 👈 PrismaModule 경로를 확인하세요!

@Module({
  // 🌟 이 'imports' 부분이 누락되어서 에러가 났던 것입니다.
  imports: [PrismaModule], 
  controllers: [LessonsController],
  providers: [LessonsService],
})
export class LessonsModule {}