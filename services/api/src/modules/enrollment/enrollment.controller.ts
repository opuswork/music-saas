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
import { EnrollmentService } from './enrollment.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';

@ApiTags('Enrollments')
@Controller('enrollments')
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  @Post()
  @ApiOperation({ summary: 'Enroll a user in a course' })
  create(@Body() dto: CreateEnrollmentDto) {
    return this.enrollmentService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all enrollments' })
  findAll() {
    return this.enrollmentService.findAll();
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'List enrollments by user ID' })
  @ApiParam({ name: 'userId' })
  findByUser(@Param('userId') userId: string) {
    return this.enrollmentService.findByUserId(userId);
  }

  @Get('course/:courseId')
  @ApiOperation({ summary: 'List enrollments by course ID' })
  @ApiParam({ name: 'courseId' })
  findByCourse(@Param('courseId') courseId: string) {
    return this.enrollmentService.findByCourseId(courseId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get enrollment by ID' })
  @ApiParam({ name: 'id' })
  findOne(@Param('id') id: string) {
    return this.enrollmentService.findOne(id);
  }

  @Patch(':id/completed')
  @ApiOperation({ summary: 'Update enrollment completed status' })
  @ApiParam({ name: 'id' })
  updateCompleted(
    @Param('id') id: string,
    @Body() body: { completed: boolean },
  ) {
    return this.enrollmentService.updateCompleted(id, body.completed);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove enrollment' })
  @ApiParam({ name: 'id' })
  remove(@Param('id') id: string) {
    return this.enrollmentService.remove(id);
  }
}
