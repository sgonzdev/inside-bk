import { DiaryRepository } from './diary.repository';
import { CreateDiaryInput, UpdateDiaryInput } from './diary.validation';
import { AppError } from '../../shared/errors/app-error';

export class DiaryService {
  constructor(private readonly repo = new DiaryRepository()) {}

  async getAll(userId: string) {
    return this.repo.findAllByUser(userId);
  }

  async getById(id: string, userId: string) {
    const entry = await this.repo.findById(id, userId);
    if (!entry) throw AppError.notFound('DIARY_NOT_FOUND');
    return entry;
  }

  async create(userId: string, data: CreateDiaryInput) {
    return this.repo.create(userId, data);
  }

  async update(id: string, userId: string, data: UpdateDiaryInput) {
    const result = await this.repo.update(id, userId, data);
    if (result.count === 0) throw AppError.notFound('DIARY_NOT_FOUND');
    return this.repo.findById(id, userId);
  }

  async delete(id: string, userId: string) {
    const result = await this.repo.delete(id, userId);
    if (result.count === 0) throw AppError.notFound('DIARY_NOT_FOUND');
  }
}
