import { Controller, Get, Post, Body, Param, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { SubscriptionService } from './subscription.service';
import {
  CreateSubscriptionDto,
  SubscriptionStatus,
} from './dto/create-subscription.dto';

@ApiTags('Subscriptions')
@Controller('subscriptions')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post()
  @ApiOperation({ summary: 'Create a subscription' })
  create(@Body() dto: CreateSubscriptionDto) {
    return this.subscriptionService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all subscriptions' })
  findAll() {
    return this.subscriptionService.findAll();
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'List subscriptions by user ID' })
  @ApiParam({ name: 'userId' })
  findByUser(@Param('userId') userId: string) {
    return this.subscriptionService.findByUserId(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get subscription by ID' })
  @ApiParam({ name: 'id' })
  findOne(@Param('id') id: string) {
    return this.subscriptionService.findOne(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update subscription status' })
  @ApiParam({ name: 'id' })
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: SubscriptionStatus },
  ) {
    return this.subscriptionService.updateStatus(id, body.status);
  }
}
