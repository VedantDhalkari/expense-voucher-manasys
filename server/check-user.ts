import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import 'dotenv/config';

async function check() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  const user = await prisma.user.findUnique({ where: { email: 'employee@expenseflow.com' } });
  console.log('User exists:', !!user);
  if (user) {
    const isValid = await bcrypt.compare(process.env.DEMO_USER_PASSWORD!, user.password);
    console.log('Password valid:', isValid);
  }
  await prisma.$disconnect();
}
check().catch(console.error);
