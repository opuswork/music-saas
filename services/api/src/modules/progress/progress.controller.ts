import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { ProgressService } from './progress.service';
import { CreateProgressSnapshotDto } from './dto/create-progress-snapshot.dto';

@ApiTags('Progress')
@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Post('snapshot')
  @ApiOperation({ summary: 'Create or update progress snapshot (user + lesson)' })
  createSnapshot(@Body() dto: CreateProgressSnapshotDto) {
    return this.progressService.createSnapshot(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all progress snapshots' })
  findAll() {
    return this.progressService.findAll();
  }

  @Get('user/:userId/lesson/:lessonId')
  @ApiOperation({ summary: 'Get progress for user and lesson' })
  @ApiParam({ name: 'userId' })
  @ApiParam({ name: 'lessonId' })
  findOne(
    @Param('userId') userId: string,
    @Param('lessonId') lessonId: string,
  ) {
    return this.progressService.findOne(userId, lessonId);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'List progress by user ID' })
  @ApiParam({ name: 'userId' })
  findByUser(@Param('userId') userId: string) {
    return this.progressService.findByUserId(userId);
  }

  @Get('lesson/:lessonId')
  @ApiOperation({ summary: 'List progress by lesson ID' })
  @ApiParam({ name: 'lessonId' })
  findByLesson(@Param('lessonId') lessonId: string) {
    return this.progressService.findByLessonId(lessonId);
  }
}
