import { Controller, Get, Post, Body } from '@nestjs/common';
import { PracticeService } from './practice.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Practice')
@Controller('practice')
export class PracticeController {
  constructor(private readonly practiceService: PracticeService) {}

  @Get()
  @ApiOperation({ summary: 'Test practice endpoint' })
  findAll() {
    return this.practiceService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Create practice session (temporary)' })
  create(@Body() body: any) {
    return this.practiceService.create(body);
  }
}