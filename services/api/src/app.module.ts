import { join } from 'path';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PracticeModule } from './modules/practice/practice.module';
import { UserModule } from './modules/user/user.module';
import { CourseModule } from './modules/course/course.module';
import { QuizModule } from './modules/quiz/quiz.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';
import { EnrollmentModule } from './modules/enrollment/enrollment.module';
import { PaymentModule } from './modules/payment/payment.module';
import { ProgressModule } from './modules/progress/progress.module';
import { LessonsModule } from './modules/lessons/lessons.module';
import { LessonBlocksModule } from './modules/lesson-blocks/lesson-blocks.module';

/** Matches docker-compose `db` service mapped to host port 5433 for local dev. */
const DEFAULT_LOCAL_DATABASE_URL =
  'postgresql://music:music123@localhost:5433/music_saas?schema=public';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        join(__dirname, '..', '.env'),
        join(process.cwd(), '.env'),
        join(process.cwd(), 'services', 'api', '.env'),
      ],
      load: [
        () => ({
          DATABASE_URL:
            process.env.DATABASE_URL?.trim() ||
            process.env.DATABASE_URL_LOCAL?.trim() ||
            DEFAULT_LOCAL_DATABASE_URL,
        }),
      ],
    }),
    PracticeModule,
    UserModule,
    CourseModule,
    QuizModule,
    SubscriptionModule,
    EnrollmentModule,
    PaymentModule,
    ProgressModule,
    LessonsModule,
    LessonBlocksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
