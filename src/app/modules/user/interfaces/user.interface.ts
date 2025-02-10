import { InferSchema } from '../../../../types';
import { getAllUsersQuerySchema } from '../validations/user.validation';

export type GetAllUsersQuery = InferSchema<typeof getAllUsersQuerySchema>;
