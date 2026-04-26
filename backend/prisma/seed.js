import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const users = [
    {
      name: "Admin",
      email: "admin@taskboard.com",
      password: await bcrypt.hash("admin123", 10),
      role: "ADMIN",
    },
    {
      name: "Manager",
      email: "manager@taskboard.com",
      password: await bcrypt.hash("manager123", 10),
      role: "MANAGER",
    },
    {
      name: "Member",
      email: "member@taskboard.com",
      password: await bcrypt.hash("member123", 10),
      role: "USER",
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    });
    console.log(`${user.role} seeded: ${user.email}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());