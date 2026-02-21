import prisma from '../../infrastructure/database/prisma';
import { UpdateProfileInput } from './users.validation';

const selectFields = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
  program: true,
  birthDate: true,
  avatarUrl: true,
  createdAt: true,
};

export class UsersRepository {
  async findById(id: string) {
    return prisma.user.findUnique({ where: { id }, select: selectFields });
  }

  async update(id: string, data: UpdateProfileInput) {
    return prisma.user.update({ where: { id }, data, select: selectFields });
  }

  async updateAvatarUrl(id: string, avatarUrl: string | null) {
    return prisma.user.update({ where: { id }, data: { avatarUrl }, select: selectFields });
  }
}
