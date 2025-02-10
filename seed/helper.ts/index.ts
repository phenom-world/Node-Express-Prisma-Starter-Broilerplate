import { faker } from '@faker-js/faker';
import { Role, User, UserStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

import { log, prisma } from '..';

const asyncForEach = async <T>(array: T[], callback: (item: T, index: number, array: T[]) => Promise<void>): Promise<void> => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};
let createdUsers: User[] = [];

export async function seed() {
  const hashedPassword = await bcrypt.hash('password', 10);
  await asyncForEach(['admin', 'user'], async (role) => {
    const user = await prisma.user.create({
      data: {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        password: hashedPassword,
        emailVerifiedAt: new Date(),
        role: role.toUpperCase() as Role,
        status: UserStatus.ACTIVE,
        phone: faker.number.int().toString(),
        email: faker.internet.email().toLowerCase(),
      },
    });
    createdUsers.push(user);
  });
  log(`User created: \u001b[1m\u001b[33m${createdUsers.map((user) => user.email).join(', ')}\u001b[0m`);
}
