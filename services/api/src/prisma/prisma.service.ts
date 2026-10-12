import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit
{
  constructor(private readonly config: ConfigService) {
    const connectionString =
      config.get<string>('DATABASE_URL') ??
      config.get<string>('DATABASE_URL_LOCAL');
    if (!connectionString) {
      throw new Error(
        'DATABASE_URL is not set. Add it to services/api/.env or set DATABASE_URL / DATABASE_URL_LOCAL.',
      );
    }
    super({
      adapter: new PrismaPg({ connectionString }),
      // Never return password hashes from queries. A login check can opt in per query
      // with `omit: { passwordHash: false }`.
      omit: { user: { passwordHash: true } },
    });
  }

  async onModuleInit() {
    await this.$connect();
  }
}
