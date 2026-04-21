import { createAIProvider } from "../../infrastructure/ai";
import { NotificationsService } from "../notifications/notifications.service";
import { NOTIF_DIARY_RISK_ALERT } from "../../shared/errors/error-codes";
import prisma from "../../infrastructure/database/prisma";
import { sendEmail } from "../../infrastructure/email/email.service";
import {
  diaryRiskAlertSubject,
  diaryRiskAlertTemplate,
} from "../../infrastructure/email/templates/diary-risk-alert.template";
import { env } from "../../shared/config/env";
import { Language } from "../../shared/config/enums";

const SYSTEM_PROMPT =
  "You are a mental health risk detector. Read the text and reply ONLY with YES if it contains indicators of risk to physical or mental health (suicidal thoughts, self-harm, violence, severe depression, substance abuse, eating disorders) or NO otherwise. No explanations.";

const ANALYSIS_MAX_CHARS = 4000;

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
      [{ role: "user", content: content.slice(0, ANALYSIS_MAX_CHARS) }],
      { temperature: 0, maxTokens: 5 },
    );

    console.log(
      `[risk-analysis] entry=${entryId} reply=${JSON.stringify(reply)}`,
    );

    if (!/\byes\b/i.test(reply)) return;

    const [author, professionals] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { firstName: true, lastName: true },
      }),
      prisma.user.findMany({
        where: { role: "PROFESSIONAL" },
        select: {
          id: true,
          email: true,
          firstName: true,
          preferences: { select: { language: true } },
        },
      }),
    ]);

    const userName = author ? `${author.firstName} ${author.lastName}` : userId;
    const preview =
      content.length > 200 ? `${content.slice(0, 200)}…` : content;
    const message = JSON.stringify({ userId, userName, entryId, preview });
    const detectedAt = new Date();
    const notificationsUrl = `${env.FRONTEND_URL}/notifications`;

    await Promise.allSettled(
      professionals.flatMap((pro) => {
        const lang = (pro.preferences?.language ?? "ES") as Language;
        return [
          notificationsService.create(
            {
              userId: pro.id,
              title: NOTIF_DIARY_RISK_ALERT,
              message,
            },
            { bypassPrefs: true },
          ),
          sendEmail({
            to: pro.email,
            subject: diaryRiskAlertSubject(lang),
            html: diaryRiskAlertTemplate(
              pro.firstName,
              userName,
              preview,
              detectedAt,
              notificationsUrl,
              lang,
            ),
          }),
        ];
      }),
    );
  } catch (err) {
    console.error("Risk analysis failed for diary entry", entryId, err);
  }
}
