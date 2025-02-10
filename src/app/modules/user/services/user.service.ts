import { Prisma, Role, UserStatus } from '@prisma/client';

import prisma from '../../../../../prisma';
import { Repository } from '../../../../shared/utils/data-repo.util';
import { Paginate } from '../../../../types';
import { GetAllUsersQuery } from '../interfaces/user.interface';

class UserService {
  private readonly repo: Repository<typeof Prisma.ModelName.User>;

  constructor() {
    this.repo = new Repository(prisma, 'user');
  }

  async getAllUsers(paginate: Paginate, query: GetAllUsersQuery) {
    const { limit, offset } = paginate;
    const { search, status } = query;

    return await this.repo.findAndCountAll({
      where: {
        role: Role.USER,
        status: status ?? UserStatus.ACTIVE,
        ...(search && { OR: [{ firstName: { search: `${search}:*` } }, { lastName: { search: `${search}:*` } }] }),
      },
      skip: offset,
      take: limit,
    });
  }

  async getUser(userId: string) {
    const user = await this.repo.findOneOrThrow({ where: { id: userId } });
    return user;
  }
}

export default UserService;
