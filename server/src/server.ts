import { app } from './app';
import { env } from './config/env';
import { prisma } from './lib/prisma';

async function start() {
  try {
    await prisma.$connect();
    console.log('Connected to database');

    app.listen(env.PORT, () => {
      console.log(`Server listening on port ${env.PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
