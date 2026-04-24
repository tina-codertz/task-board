import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

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
      password: decodeURIComponent(url.password) || 'password', // decode in case of special chars
    });

    const adapter = new PrismaPg(pool); 

    super({ adapter });

    this.pool = pool;
  }


 async onModuleInit() {
  await this.$connect();
  console.log('database is connected');

  const adminExists = await this.user.findUnique({
    where: { email: 'admin@gmail.com' },
  });

  if (!adminExists) {
    await this.user.create({
      data: {
        name: "Admin",
        email: "admin@gmail.com",
        password: await bcrypt.hash("admin123", 10),
        role: "ADMIN",
      },
    });

    console.log("Admin created");
  }
}

  async onModuleDestroy() {
    await this.$disconnect();
    await this.pool.end();
  }
  
}