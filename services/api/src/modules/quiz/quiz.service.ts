import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateQuizDto } from '@/modules/quiz/dto/create-quiz.dto';
import { CreateQuestionDto } from '@/modules/quiz/dto/create-question.dto';
import { SubmitGradeDto } from '@/modules/quiz/dto/submit-grade.dto';

@Injectable()
export class QuizService {
  constructor(private prisma: PrismaService) {}

  /** PrismaService extends PrismaClient; typed as PrismaClient so generated delegates (quiz, question, grade) are recognized. */
  private get db() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.prisma as any;
  }

  async createQuiz(dto: CreateQuizDto) {
    return this.db.quiz.create({
      data: {
        courseId: dto.courseId,
        lessonId: dto.lessonId,
        title: dto.title,
        description: dto.description,
        passingScore: dto.passingScore ?? 60,
        rewardPoints: dto.rewardPoints ?? 100,
      },
    });
  }

  async findAllQuizzes() {
    return this.db.quiz.findMany({
      include: { course: true, lesson: true, questions: true },
    });
  }

  async findQuizzesByCourseId(courseId: string) {
    return this.db.quiz.findMany({
      where: { courseId },
      include: { lesson: true, questions: true },
    });
  }

  async findOneQuiz(id: string) {
    return this.db.quiz.findUnique({
      where: { id },
      include: { course: true, lesson: true, questions: true },
    });
  }

  async removeQuiz(id: string) {
    return this.db.quiz.delete({ where: { id } });
  }

  async createQuestion(dto: CreateQuestionDto) {
    return this.db.question.create({
      data: {
        quizId: dto.quizId,
        content: dto.content,
        options: dto.options as any,
        answer: dto.answer,
        points: dto.points ?? 10,
      },
    });
  }

  async findQuestionsByQuizId(quizId: string) {
    return this.db.question.findMany({ where: { quizId } });
  }

  async removeQuestion(id: string) {
    return this.db.question.delete({ where: { id } });
  }

  async submitGrade(dto: SubmitGradeDto) {
    return this.db.grade.create({
      data: {
        userId: dto.userId,
        quizId: dto.quizId,
        score: dto.score,
        totalPoints: dto.totalPoints,
        passed: dto.passed,
      },
    });
  }

  async findGradesByUser(userId: string) {
    return this.db.grade.findMany({
      where: { userId },
      include: { quiz: true },
    });
  }

  async findGradesByQuiz(quizId: string) {
    return this.db.grade.findMany({
      where: { quizId },
      include: { user: true },
    });
  }
}
