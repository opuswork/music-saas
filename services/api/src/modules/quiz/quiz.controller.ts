import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { QuizService } from './quiz.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { SubmitGradeDto } from './dto/submit-grade.dto';

@ApiTags('Quizzes')
@Controller('quizzes')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post()
  @ApiOperation({ summary: 'Create a quiz' })
  create(@Body() dto: CreateQuizDto) {
    return this.quizService.createQuiz(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all quizzes' })
  findAll() {
    return this.quizService.findAllQuizzes();
  }

  @Get('course/:courseId')
  @ApiOperation({ summary: 'List quizzes by course ID' })
  @ApiParam({ name: 'courseId' })
  findByCourse(@Param('courseId') courseId: string) {
    return this.quizService.findQuizzesByCourseId(courseId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get quiz by ID' })
  @ApiParam({ name: 'id' })
  findOne(@Param('id') id: string) {
    return this.quizService.findOneQuiz(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a quiz' })
  @ApiParam({ name: 'id' })
  remove(@Param('id') id: string) {
    return this.quizService.removeQuiz(id);
  }
}

@ApiTags('Quiz Questions')
@Controller('questions')
export class QuestionController {
  constructor(private readonly quizService: QuizService) {}

  @Post()
  @ApiOperation({ summary: 'Create a question' })
  create(@Body() dto: CreateQuestionDto) {
    return this.quizService.createQuestion(dto);
  }

  @Get('quiz/:quizId')
  @ApiOperation({ summary: 'List questions by quiz ID' })
  @ApiParam({ name: 'quizId' })
  findByQuiz(@Param('quizId') quizId: string) {
    return this.quizService.findQuestionsByQuizId(quizId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a question' })
  @ApiParam({ name: 'id' })
  remove(@Param('id') id: string) {
    return this.quizService.removeQuestion(id);
  }
}

@ApiTags('Grades')
@Controller('grades')
export class GradeController {
  constructor(private readonly quizService: QuizService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a grade (quiz result)' })
  submit(@Body() dto: SubmitGradeDto) {
    return this.quizService.submitGrade(dto);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'List grades by user ID' })
  @ApiParam({ name: 'userId' })
  findByUser(@Param('userId') userId: string) {
    return this.quizService.findGradesByUser(userId);
  }

  @Get('quiz/:quizId')
  @ApiOperation({ summary: 'List grades by quiz ID' })
  @ApiParam({ name: 'quizId' })
  findByQuiz(@Param('quizId') quizId: string) {
    return this.quizService.findGradesByQuiz(quizId);
  }
}
