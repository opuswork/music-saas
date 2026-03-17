import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { QuizService } from './quiz.service';
import { QuizController, QuestionController, GradeController } from './quiz.controller';

@Module({
  imports: [PrismaModule],
  controllers: [QuizController, QuestionController, GradeController],
  providers: [QuizService],
  exports: [QuizService],
})
export class QuizModule {}
