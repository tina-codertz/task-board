import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
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
    console.log('DATABASE_URL:', process.env.DATABASE_URL);

    await this.createAdminIfNotExists();
  }
  private async createAdminIfNotExists() {
  try {
    const email = 'admin1234@gmail.com';
    const plainPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const existingAdmin = await this.user.findUnique({ where: { email } });

    if (existingAdmin) {
      // Force-reset password to ensure hash is valid
      await this.user.update({
        where: { email },
        data: { password: hashedPassword },
      });
      console.log('Admin password reset to ensure valid hash');
      return;
    }

    const admin = await this.user.create({
      data: {
        name: 'Admin',
        email,
        password: hashedPassword,
        role: 'ADMIN',
      },
    });

    console.log('Admin created:', admin.email);
  } catch (error) {
    console.error('Error creating admin:', error);
  }
}

  async onModuleDestroy() {
    await this.$disconnect();
    await this.pool.end();
  }
}
