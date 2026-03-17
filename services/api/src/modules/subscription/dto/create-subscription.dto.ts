import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** Match Prisma schema enums for subscription. */
export const SubscriptionPlan = {
  FREE: 'FREE',
  BASIC: 'BASIC',
  PRO: 'PRO',
  INSTITUTION: 'INSTITUTION',
} as const;
export type SubscriptionPlan = (typeof SubscriptionPlan)[keyof typeof SubscriptionPlan];

export const SubscriptionStatus = {
  ACTIVE: 'ACTIVE',
  PAUSED: 'PAUSED',
  CANCELED: 'CANCELED',
} as const;
export type SubscriptionStatus = (typeof SubscriptionStatus)[keyof typeof SubscriptionStatus];

export class CreateSubscriptionDto {
  @ApiProperty()
  userId: string;

  @ApiPropertyOptional({ enum: SubscriptionPlan, default: 'FREE' })
  plan?: SubscriptionPlan;

  @ApiPropertyOptional({ enum: SubscriptionStatus, default: 'ACTIVE' })
  status?: SubscriptionStatus;

  @ApiPropertyOptional()
  endedAt?: Date;
}
