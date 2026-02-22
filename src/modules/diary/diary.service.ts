import { DiaryRepository } from './diary.repository';
import { CreateDiaryInput, UpdateDiaryInput } from './diary.validation';
import { AppError } from '../../shared/errors/app-error';
import { parsePagination, paginate, PaginationQuery } from '../../shared/utils/pagination';
import { getPresignedUrl } from '../../infrastructure/storage/storage';

export class DiaryService {
  constructor(private readonly repo = new DiaryRepository()) {}

  private async enrichMedia<T extends { media: { storageKey: string }[] }>(entry: T) {
    return {
      ...entry,
      media: await Promise.all(
        entry.media.map(async (m) => ({ ...m, url: await getPresignedUrl(m.storageKey) })),
      ),
    };
  }

  async getAll(userId: string, query: PaginationQuery & { search?: string }) {
    const { page, limit, skip } = parsePagination(query);
    const { data, total } = await this.repo.findAllByUser(userId, skip, limit, query.search);
    const enriched = await Promise.all(data.map((e) => this.enrichMedia(e)));
    return paginate(enriched, total, page, limit);
  }

  async getAllForProfessional(query: PaginationQuery & { search?: string }) {
    const { page, limit, skip } = parsePagination(query);
    const { data, total } = await this.repo.findAll(skip, limit, query.search);
    const enriched = await Promise.all(data.map((e) => this.enrichMedia(e)));
    return paginate(enriched, total, page, limit);
  }

  async getById(id: string, userId: string) {
    const entry = await this.repo.findById(id, userId);
    if (!entry) throw AppError.notFound('DIARY_NOT_FOUND');
    return this.enrichMedia(entry);
  }

  async create(userId: string, data: CreateDiaryInput) {
    return this.repo.create(userId, data);
  }

  async update(id: string, userId: string, data: UpdateDiaryInput) {
    const result = await this.repo.update(id, userId, data);
    if (result.count === 0) throw AppError.notFound('DIARY_NOT_FOUND');
    return this.enrichMedia((await this.repo.findById(id, userId))!);
  }

  async delete(id: string, userId: string) {
    const result = await this.repo.delete(id, userId);
    if (result.count === 0) throw AppError.notFound('DIARY_NOT_FOUND');
  }
}
