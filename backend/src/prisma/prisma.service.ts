import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private pool: Pool;

  constructor() {
    const databaseUrl = process.env.DATABASE_URL || '';
    const url = new URL(databaseUrl);

    const pool = new Pool({
      host: url.hostname || 'localhost',
      port: url.port ? parseInt(url.port) : 5432,
      database: url.pathname?.slice(1) || '',
      user: url.username || 'postgres',
      password: decodeURIComponent(url.password) || 'password', // 👈 decode in case of special chars
    });

    const adapter = new PrismaPg(pool); // 👈 pass pool directly, not { pool }

    super({ adapter });

    this.pool = pool;
  }

  async onModuleInit() {
    await this.$connect();
    console.log('database is connected');
    console.log('DATABASE_URL:', process.env.DATABASE_URL);
  }

  async onModuleDestroy() {
    await this.$disconnect();
    await this.pool.end();
  }
}