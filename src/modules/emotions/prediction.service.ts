import prisma from "../../infrastructure/database/prisma";
import { createAIProvider } from "../../infrastructure/ai";
import { PreferencesService } from "../preferences/preferences.service";

const LANG_LABEL: Record<string, string> = { ES: "Spanish", EN: "English" };

function todayMidnight(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

const prefs = new PreferencesService();

export async function getPrediction(userId: string): Promise<string> {
  const today = todayMidnight();

  const existing = await prisma.emotionalPrediction.findUnique({
    where: { userId_date: { userId, date: today } },
  });
  if (existing) return existing.prediction;

  const [emotionLogs, diaryEntries, userPrefs] = await Promise.all([
    prisma.emotionLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { emotion: { select: { name: true } } },
    }),
    prisma.diaryEntry.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { title: true, mood: true },
    }),
    prefs.get(userId),
  ]);

  const lang = LANG_LABEL[userPrefs.language] ?? "Spanish";

  const emotionSummary = emotionLogs.length
    ? emotionLogs.map((l) => l.emotion.name).join(", ")
    : "no emotion records";

  const diarySummary = diaryEntries.length
    ? diaryEntries
        .map((d) => `"${d.title}"${d.mood ? ` (${d.mood})` : ""}`)
        .join(", ")
    : "no diary entries";

  const ai = createAIProvider();
  const { content } = await ai.chat(
    `You are an emotional wellness assistant. Based on the user's recent data, give a brief empathetic emotional prediction for today (2-3 sentences max). Always respond in ${lang}.`,
    [
      {
        role: "user",
        content: `Recent emotions: ${emotionSummary}. Recent diary: ${diarySummary}.`,
      },
    ],
    { temperature: 0.7, maxTokens: 100 },
  );

  await prisma.emotionalPrediction.create({
    data: { userId, prediction: content, date: today },
  });

  return content;
}
