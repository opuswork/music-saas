import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { CreateLessonAssetDto } from './dto/create-lesson-asset.dto';

@ApiTags('Courses')
@Controller('courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post()
  @ApiOperation({ summary: 'Create a course' })
  createCourse(@Body() dto: CreateCourseDto) {
    return this.courseService.createCourse(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all courses' })
  findAllCourses() {
    return this.courseService.findAllCourses();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get course by ID' })
  @ApiParam({ name: 'id' })
  findOneCourse(@Param('id') id: string) {
    return this.courseService.findOneCourse(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a course' })
  @ApiParam({ name: 'id' })
  updateCourse(@Param('id') id: string, @Body() dto: UpdateCourseDto) {
    return this.courseService.updateCourse(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a course' })
  @ApiParam({ name: 'id' })
  removeCourse(@Param('id') id: string) {
    return this.courseService.removeCourse(id);
  }
}

@ApiTags('Lessons')
@Controller('lessons')
export class LessonController {
  constructor(private readonly courseService: CourseService) {}

  @Post()
  @ApiOperation({ summary: 'Create a lesson' })
  create(@Body() dto: CreateLessonDto) {
    return this.courseService.createLesson(dto);
  }

  @Get('course/:courseId')
  @ApiOperation({ summary: 'List lessons by course ID' })
  @ApiParam({ name: 'courseId' })
  findByCourse(@Param('courseId') courseId: string) {
    return this.courseService.findLessonsByCourseId(courseId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get lesson by ID' })
  @ApiParam({ name: 'id' })
  findOne(@Param('id') id: string) {
    return this.courseService.findOneLesson(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a lesson' })
  @ApiParam({ name: 'id' })
  update(@Param('id') id: string, @Body() dto: UpdateLessonDto) {
    return this.courseService.updateLesson(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a lesson' })
  @ApiParam({ name: 'id' })
  remove(@Param('id') id: string) {
    return this.courseService.removeLesson(id);
  }
}

@ApiTags('Lesson Assets')
@Controller('lesson-assets')
export class LessonAssetController {
  constructor(private readonly courseService: CourseService) {}

  @Post()
  @ApiOperation({ summary: 'Create a lesson asset' })
  create(@Body() dto: CreateLessonAssetDto) {
    return this.courseService.createLessonAsset(dto);
  }

  @Get('lesson/:lessonId')
  @ApiOperation({ summary: 'List assets by lesson ID' })
  @ApiParam({ name: 'lessonId' })
  findByLesson(@Param('lessonId') lessonId: string) {
    return this.courseService.findAssetsByLessonId(lessonId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get lesson asset by ID' })
  @ApiParam({ name: 'id' })
  findOne(@Param('id') id: string) {
    return this.courseService.findOneLessonAsset(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a lesson asset' })
  @ApiParam({ name: 'id' })
  remove(@Param('id') id: string) {
    return this.courseService.removeLessonAsset(id);
  }
}
