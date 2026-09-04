import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

async function check() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  const user = await prisma.user.findUnique({ where: { email: 'employee@expenseflow.com' } });
  console.log('Hash in DB:', user?.password);
  console.log('Env password:', process.env.DEMO_USER_PASSWORD);
  await prisma.$disconnect();
}
check().catch(console.error);
