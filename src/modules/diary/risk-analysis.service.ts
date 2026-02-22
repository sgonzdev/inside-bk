import { createAIProvider } from "../../infrastructure/ai";
import { NotificationsService } from "../notifications/notifications.service";
import { NOTIF_DIARY_RISK_ALERT } from "../../shared/errors/error-codes";
import prisma from "../../infrastructure/database/prisma";

const SYSTEM_PROMPT =
  "You are a mental health risk detector. Read the text and reply ONLY with YES if it contains indicators of risk to physical or mental health (suicidal thoughts, self-harm, violence, severe depression, substance abuse, eating disorders) or NO otherwise. No explanations.";

const notificationsService = new NotificationsService();

export async function analyzeAndAlert(
  userId: string,
  entryId: string,
  content: string,
): Promise<void> {
  try {
    const ai = createAIProvider();
    const { content: reply } = await ai.chat(
      SYSTEM_PROMPT,
      [{ role: "user", content: content.slice(0, 500) }],
      { temperature: 0, maxTokens: 5 },
    );

    if (reply.trim().toUpperCase() !== "YES") return;

    const [author, professionals] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { firstName: true, lastName: true },
      }),
      prisma.user.findMany({
        where: { role: "PROFESSIONAL" },
        select: { id: true },
      }),
    ]);

    const userName = author ? `${author.firstName} ${author.lastName}` : userId;
    const preview =
      content.length > 200 ? `${content.slice(0, 200)}…` : content;
    const message = JSON.stringify({ userId, userName, entryId, preview });

    await Promise.allSettled(
      professionals.map(({ id }) =>
        notificationsService.create({
          userId: id,
          title: NOTIF_DIARY_RISK_ALERT,
          message,
        }),
      ),
    );
  } catch (err) {
    console.error("Risk analysis failed for diary entry", entryId, err);
  }
}
