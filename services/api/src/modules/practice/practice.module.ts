import { Module } from '@nestjs/common';
import { PracticeService } from './practice.service';
import { PracticeController } from './practice.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule], // 👈 반드시 추가
  controllers: [PracticeController],
  providers: [PracticeService],
})
export class PracticeModule {}