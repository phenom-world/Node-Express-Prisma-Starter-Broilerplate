import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { paginateResponse } from '../../../../shared/helpers/paginate-response.helper';
import { ApiResponse } from '../../../../shared/utils';
import { asyncHandler } from '../../../middlewares';
import UserService from '../services/user.service';

class UserController {
  private readonly userService: UserService;
  constructor() {
    this.userService = new UserService();
  }

  getMe = asyncHandler(async (req: Request, res: Response) => {
    const user = await this.userService.getUser(req.user.id);
    return ApiResponse(res, StatusCodes.OK, user);
  });

  getAllUsers = asyncHandler(async (req: Request, res: Response) => {
    const { paginate } = res.locals;
    const users = await this.userService.getAllUsers(paginate, req.query);
    return ApiResponse(res, StatusCodes.OK, paginateResponse({ rows: users.records, paginate, count: users.count }));
  });
}

export default UserController;
