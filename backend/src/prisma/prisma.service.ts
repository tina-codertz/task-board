
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';


@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private pool: Pool;

  constructor() {
    const databaseUrl = process.env.DATABASE_URL || '';
    
    // Parse the connection string manually to ensure proper types
    const url = new URL(databaseUrl);
    
    const pool = new Pool({
      host: url.hostname || 'localhost',
      port: url.port ? parseInt(url.port) : 5432,
      database: url.pathname?.slice(1) || '',
      user: url.username || 'postgres',
      password: url.password || '',
    });

    super({
      adapter: new PrismaPg({ pool } as any),
    });

    this.pool = pool;
  }

  async onModuleInit() {
    await this.$connect();
    console.log("database is connected")
  }

  async onModuleDestroy() {
    await this.$disconnect();
    await this.pool.end();
  }
}