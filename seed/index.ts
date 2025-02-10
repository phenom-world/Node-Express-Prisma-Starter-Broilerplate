import { PrismaClient } from '@prisma/client';

import { seed } from './helper.ts';

export const prisma = new PrismaClient();

const isTest = process.env.NODE_ENV === 'test';
export const log = (text: string) => (!isTest ? console.log(text) : null);

async function main() {
  console.log('Seeding started');

  await seed();

  console.log('Seeding completed');

  process.exit();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
