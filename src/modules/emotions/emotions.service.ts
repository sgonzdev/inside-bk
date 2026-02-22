import { EmotionsRepository } from './emotions.repository';
import { LogEmotionInput, StatsQuery } from './emotions.validation';
import { AppError } from '../../shared/errors/app-error';
import { createAIProvider } from '../../infrastructure/ai';
import { PreferencesService } from '../preferences/preferences.service';
import { parsePagination, paginate, PaginationQuery } from '../../shared/utils/pagination';

const LANG_LABEL: Record<string, string> = { ES: 'Spanish', EN: 'English' };

export class EmotionsService {
  constructor(
    private readonly repo = new EmotionsRepository(),
    private readonly prefs = new PreferencesService(),
  ) {}

  async getWheel() {
    return this.repo.findAllEmotions();
  }

  async logEmotion(userId: string, data: LogEmotionInput) {
    const emotion = await this.repo.findEmotionById(data.emotionId);
    if (!emotion) throw AppError.notFound('EMOTION_NOT_FOUND');

    let aiFeedback: string | undefined;
    try {
      const userPrefs = await this.prefs.get(userId);
      const lang = LANG_LABEL[userPrefs.language] ?? 'Spanish';

      const ai = createAIProvider();
      const response = await ai.chat(
        `You are a supportive emotional wellness assistant for students. Give a brief, empathetic response (2-3 sentences) based on the emotion logged. Always respond in ${lang}.`,
        [
          {
            role: 'user',
            content: `I'm feeling ${emotion.name} with intensity ${data.intensity}/10.${data.note ? ` Note: ${data.note}` : ''}`,
          },
        ],
        { temperature: 0.8, maxTokens: 256 },
      );
      aiFeedback = response.content;
    } catch {
      // AI feedback is optional - continue without it
    }

    return this.repo.createLog(userId, { ...data, aiFeedback });
  }

  async getHistory(userId: string, query: PaginationQuery) {
    const { page, limit, skip } = parsePagination(query);
    const { data, total } = await this.repo.findLogsByUser(userId, skip, limit);
    return paginate(data, total, page, limit);
  }

  async getStats(query: StatsQuery) {
    return this.repo.getStats(query);
  }
}
