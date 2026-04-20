import { Language } from "../../../shared/config/enums";

const translations = {
  ES: {
    subject: "Alerta de riesgo detectada - InsideOut Expressions",
    badge: "Alerta de riesgo",
    greeting: (name: string) => `Hola, ${name}`,
    lead: "Se ha detectado un posible indicador de riesgo en una entrada reciente de diario.",
    studentLabel: "Estudiante",
    dateLabel: "Fecha",
    previewLabel: "Vista previa del contenido",
    callToAction:
      "Por favor ingresa a la plataforma para revisar la notificación completa y dar seguimiento.",
    button: "Ir a notificaciones",
    footer:
      "Esta alerta se genera de forma automática a partir del análisis del contenido. Trátala con la confidencialidad habitual.",
    institution: "Fundación Escuela Tecnológica de Neiva",
  },
  EN: {
    subject: "Risk alert detected - InsideOut Expressions",
    badge: "Risk alert",
    greeting: (name: string) => `Hi, ${name}`,
    lead: "A possible risk indicator has been detected in a recent diary entry.",
    studentLabel: "Student",
    dateLabel: "Date",
    previewLabel: "Content preview",
    callToAction:
      "Please sign in to the platform to review the full notification and follow up.",
    button: "Go to notifications",
    footer:
      "This alert is generated automatically from content analysis. Handle it with the usual confidentiality.",
    institution: "Fundación Escuela Tecnológica de Neiva",
  },
};

export function diaryRiskAlertSubject(language: Language): string {
  return translations[language].subject;
}

export function diaryRiskAlertTemplate(
  professionalFirstName: string,
  studentName: string,
  preview: string,
  detectedAt: Date,
  notificationsUrl: string,
  language: Language,
): string {
  const t = translations[language];
  const locale = language === "EN" ? "en-US" : "es-CO";
  const formattedDate = detectedAt.toLocaleString(locale, {
    timeZone: "America/Bogota",
  });
  const escapedPreview = preview
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return `
<!DOCTYPE html>
<html lang="${language.toLowerCase()}">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background-color:#eef3ee;font-family:Arial,Helvetica,sans-serif;color:#1f2a25;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#eef3ee;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background-color:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #dde4de;box-shadow:0 1px 3px rgba(31,42,37,0.04);">
        <tr>
          <td style="padding:32px 32px 20px;text-align:center;border-bottom:1px solid #eef1ee;">
            <div style="font-size:22px;font-weight:bold;letter-spacing:-0.3px;">
              <span style="color:#2e5440;">InsideOut</span><span style="color:#5a6861;font-weight:normal;"> Expressions</span>
            </div>
            <p style="margin:6px 0 0;font-size:11px;color:#8a968e;letter-spacing:1.5px;text-transform:uppercase;">${t.institution}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 32px 8px;">
            <span style="display:inline-block;padding:4px 12px;background-color:#fbeae6;color:#b8412d;font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;border-radius:999px;">${t.badge}</span>
            <h2 style="margin:18px 0 10px;font-size:20px;color:#1f2a25;font-weight:bold;">${t.greeting(professionalFirstName)}</h2>
            <p style="margin:0 0 24px;font-size:15px;color:#4a5651;line-height:1.65;">${t.lead}</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;background-color:#f6f9f7;border:1px solid #e5ebe7;border-radius:10px;">
              <tr>
                <td style="padding:12px 16px;font-size:13px;color:#6b766f;width:110px;border-bottom:1px solid #e9efea;">${t.studentLabel}</td>
                <td style="padding:12px 16px;font-size:14px;color:#1f2a25;font-weight:bold;border-bottom:1px solid #e9efea;">${studentName}</td>
              </tr>
              <tr>
                <td style="padding:12px 16px;font-size:13px;color:#6b766f;">${t.dateLabel}</td>
                <td style="padding:12px 16px;font-size:14px;color:#1f2a25;">${formattedDate}</td>
              </tr>
            </table>
            <p style="margin:0 0 8px;font-size:13px;color:#6b766f;">${t.previewLabel}</p>
            <blockquote style="margin:0 0 24px;padding:14px 16px;background-color:#ffffff;border:1px solid #e5ebe7;border-left:3px solid #b8412d;border-radius:8px;font-size:14px;color:#3a4540;line-height:1.6;font-style:italic;">
              ${escapedPreview}
            </blockquote>
            <p style="margin:0 0 24px;font-size:14px;color:#4a5651;line-height:1.65;">${t.callToAction}</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td align="center">
                <a href="${notificationsUrl}" style="display:inline-block;padding:13px 32px;background-color:#3e7a5a;color:#ffffff;font-size:14px;font-weight:bold;text-decoration:none;border-radius:8px;letter-spacing:0.3px;">
                  ${t.button}
                </a>
              </td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:22px 32px 28px;border-top:1px solid #eef1ee;">
            <p style="margin:0;font-size:12px;color:#8a968e;line-height:1.7;text-align:center;">${t.footer}</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
