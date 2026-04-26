import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  await prisma.user.create({
    data: {
      name: "Admin",
      email: "admin@gmail.com",
      password: await bcrypt.hash("admin123", 10),
      role: "ADMIN",
    },
  });
  console.log("Admin created");

  await prisma.user.create({
    data: {
      name: "Manager",
      email: "manager@gmail.com",
      password: await bcrypt.hash("manager123", 10),
      role: "MANAGER",
    },
  });
  console.log("Manager created");

  await prisma.user.create({
    data: {
      name: "User",
      email: "user@gmail.com",
      password: await bcrypt.hash("user123", 10),
      role: "USER",
    },
  });
  console.log("User created");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());