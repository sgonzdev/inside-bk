import { EmotionsRepository } from "./emotions.repository";
import { LogEmotionInput, StatsQuery } from "./emotions.validation";
import { AppError } from "../../shared/errors/app-error";
import {
  EMOTION_NOT_FOUND,
  EMOTION_COOLDOWN,
  EMOTION_DAILY_LIMIT,
} from "../../shared/errors/error-codes";
import { createAIProvider } from "../../infrastructure/ai";
import { PreferencesService } from "../preferences/preferences.service";
import {
  parsePagination,
  paginate,
  PaginationQuery,
} from "../../shared/utils/pagination";

const LANG_LABEL: Record<string, string> = { ES: "Spanish", EN: "English" };

const COOLDOWN_SECONDS = 60;
const DAILY_LIMIT = 10;
const SAME_EMOTION_WINDOW_MS = 60 * 60 * 1000;

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
    if (!emotion) throw AppError.notFound(EMOTION_NOT_FOUND);

    const lastLog = await this.repo.findLastLog(userId);
    if (lastLog) {
      const elapsed = Date.now() - lastLog.createdAt.getTime();
      if (elapsed < COOLDOWN_SECONDS * 1000) {
        throw AppError.badRequest(EMOTION_COOLDOWN);
      }
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const todayCount = await this.repo.countLogsSince(userId, startOfDay);
    if (todayCount >= DAILY_LIMIT) {
      throw AppError.badRequest(EMOTION_DAILY_LIMIT);
    }

    const lastSame = await this.repo.findLastLog(userId, data.emotionId);
    if (
      lastSame &&
      lastSame.aiFeedback &&
      Date.now() - lastSame.createdAt.getTime() < SAME_EMOTION_WINDOW_MS
    ) {
      return this.repo.createLog(userId, {
        ...data,
        aiFeedback: lastSame.aiFeedback,
      });
    }

    let aiFeedback: string | undefined;
    try {
      const userPrefs = await this.prefs.get(userId);
      const lang = LANG_LABEL[userPrefs.language] ?? "Spanish";

      const ai = createAIProvider();
      const response = await ai.chat(
        `You are a supportive emotional wellness assistant for students. Give a brief, empathetic response (2-3 sentences) based on the emotion logged. Always respond in ${lang}.`,
        [
          {
            role: "user",
            content: `I'm feeling ${emotion.name}.`,
          },
        ],
        { temperature: 0.8, maxTokens: 256 },
      );
      aiFeedback = response.content;
    } catch {
      console.error("AI feedback generation failed, proceeding without it.");
    }

    return this.repo.createLog(userId, { ...data, aiFeedback });
  }

  async getHistory(userId: string, query: PaginationQuery) {
    const { page, limit, skip } = parsePagination(query);
    const { data, total } = await this.repo.findLogsByUser(userId, skip, limit);
    return paginate(data, total, page, limit);
  }

  async getStats(userId: string, query: StatsQuery) {
    const raw = await this.repo.getStats(query);

    const sorted = [...raw].sort((a, b) => b.count - a.count);
    const total = sorted.reduce((sum, r) => sum + r.count, 0);

    const userPrefs = await this.prefs.get(userId);
    const isEN = userPrefs.language === "EN";
    const datasetLabel = isEN ? "Records by emotion" : "Registros por emoción";

    const labels = sorted.map((r) => r.emotionName);
    const data = sorted.map((r) => r.count);

    return {
      total,
      charts: {
        bar: {
          type: "bar",
          data: {
            labels,
            datasets: [{ label: datasetLabel, data }],
          },
        },
        doughnut: {
          type: "doughnut",
          data: {
            labels,
            datasets: [{ label: datasetLabel, data }],
          },
        },
        line: {
          type: "line",
          data: {
            labels,
            datasets: [
              { label: datasetLabel, data, fill: false, tension: 0.3 },
            ],
          },
        },
      },
      breakdown: sorted.map((r) => ({
        emotionId: r.emotionId,
        emotionName: r.emotionName,
        count: r.count,
        percentage: total > 0 ? Math.round((r.count / total) * 100) : 0,
      })),
    };
  }
}
