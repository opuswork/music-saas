import { CreateSubscriptionDto } from '@/modules/subscription/dto/create-subscription.dto';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty()
  email: string;

  @ApiProperty()
  password: string;

  @ApiProperty({ required: false })
  fullName?: string;

  @ApiProperty({ required: false })
  firstName?: string;

  @ApiProperty({ required: false })
  lastName?: string;

  @ApiProperty({ enum: UserRole, default: 'STUDENT' })
  role: UserRole;

  @ApiProperty()
  points: number;

  @ApiProperty()
  subscriptions: CreateSubscriptionDto[];
}
