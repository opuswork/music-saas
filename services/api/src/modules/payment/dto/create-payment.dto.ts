import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentProvider, PaymentStatus } from '@prisma/client';

export class CreatePaymentDto {
  @ApiProperty()
  userId: string;

  @ApiProperty({ enum: PaymentProvider })
  provider: PaymentProvider;

  @ApiProperty()
  amount: number;

  @ApiPropertyOptional({ default: 'KRW' })
  currency?: string;

  @ApiProperty({ enum: PaymentStatus })
  status: PaymentStatus;
}
