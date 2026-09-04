import { PrismaClient, Role } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL;
const demoPassword = process.env.DEMO_USER_PASSWORD as string;

if (!demoPassword) {
  console.error("Error: DEMO_USER_PASSWORD is not set in the environment.");
  process.exit(1);
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash(demoPassword, 10);

  const employee = await prisma.user.upsert({
    where: { email: 'employee@expenseflow.com' },
    update: { password: passwordHash },
    create: {
      email: 'employee@expenseflow.com',
      password: passwordHash,
      role: Role.EMPLOYEE,
    },
  });

  const director = await prisma.user.upsert({
    where: { email: 'director@expenseflow.com' },
    update: { password: passwordHash },
    create: {
      email: 'director@expenseflow.com',
      password: passwordHash,
      role: Role.DIRECTOR,
    },
  });

  const accounts = await prisma.user.upsert({
    where: { email: 'accounts@expenseflow.com' },
    update: { password: passwordHash },
    create: {
      email: 'accounts@expenseflow.com',
      password: passwordHash,
      role: Role.ACCOUNTS,
    },
  });

  console.log('Seed successful for roles: EMPLOYEE, DIRECTOR, ACCOUNTS.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
