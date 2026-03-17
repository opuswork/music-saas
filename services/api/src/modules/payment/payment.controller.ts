import { Controller, Get, Post, Body, Param, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentStatus } from '@prisma/client';

@ApiTags('Payments')
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @ApiOperation({ summary: 'Create a payment record' })
  create(@Body() dto: CreatePaymentDto) {
    return this.paymentService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all payments' })
  findAll() {
    return this.paymentService.findAll();
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'List payments by user ID' })
  @ApiParam({ name: 'userId' })
  findByUser(@Param('userId') userId: string) {
    return this.paymentService.findByUserId(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiParam({ name: 'id' })
  findOne(@Param('id') id: string) {
    return this.paymentService.findOne(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update payment status' })
  @ApiParam({ name: 'id' })
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: PaymentStatus },
  ) {
    return this.paymentService.updateStatus(id, body.status);
  }
}
