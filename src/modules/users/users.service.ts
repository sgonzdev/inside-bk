import { UsersRepository } from './users.repository';
import { UpdateProfileInput } from './users.validation';
import { AppError } from '../../shared/errors/app-error';

export class UsersService {
  constructor(private readonly repo = new UsersRepository()) {}

  async getProfile(userId: string) {
    const user = await this.repo.findById(userId);
    if (!user) throw AppError.notFound('USER_NOT_FOUND');
    return user;
  }

  async updateProfile(userId: string, data: UpdateProfileInput) {
    return this.repo.update(userId, data);
  }
}
