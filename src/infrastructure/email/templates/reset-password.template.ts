import { Language } from '../../../shared/config/enums';

const translations = {
  ES: {
    greeting: (name: string) => `Hola, ${name}`,
    body: 'Recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong>InsideOut Expressions</strong>.<br/>Si fuiste tú, haz clic en el botón para crear una nueva contraseña.',
    button: 'Restablecer contraseña',
    footer: (min: number) => `Este enlace expira en ${min} minuto${min !== 1 ? 's' : ''}.<br/>Si no solicitaste esto, ignora este mensaje — tu contraseña no cambiará.`,
  },
  EN: {
    greeting: (name: string) => `Hi, ${name}`,
    body: 'We received a request to reset the password for your <strong>InsideOut Expressions</strong> account.<br/>If this was you, click the button below to create a new password.',
    button: 'Reset password',
    footer: (min: number) => `This link expires in ${min} minute${min !== 1 ? 's' : ''}.<br/>If you didn't request this, ignore this email — your password won't change.`,
  },
};

export function resetPasswordTemplate(
  firstName: string,
  resetUrl: string,
  language: Language,
  expiresInMinutes: number,
): string {
  const t = translations[language];
  return `
<!DOCTYPE html>
<html lang="${language.toLowerCase()}">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background-color:#0f1117;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f1117;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background-color:#1a1d27;border-radius:12px;overflow:hidden;border:1px solid #2a2d3a;">
        <tr>
          <td style="background-color:#12151f;padding:28px 32px;border-bottom:3px solid #e7dd1e;text-align:center;">
            <span style="font-size:22px;font-weight:bold;color:#e7dd1e;letter-spacing:1px;">InsideOut</span>
            <span style="font-size:22px;font-weight:bold;color:#ffffff;"> Expressions</span>
            <p style="margin:6px 0 0;font-size:12px;color:#9ca3af;letter-spacing:2px;text-transform:uppercase;">Fundación Escuela Tecnológica de Neiva</p>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 32px 24px;">
            <h2 style="margin:0 0 12px;font-size:20px;color:#ffffff;">${t.greeting(firstName)}</h2>
            <p style="margin:0 0 28px;font-size:15px;color:#9ca3af;line-height:1.7;">${t.body}</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td align="center">
                <a href="${resetUrl}" style="display:inline-block;padding:14px 36px;background-color:#e7dd1e;color:#0f1117;font-size:15px;font-weight:bold;text-decoration:none;border-radius:8px;letter-spacing:0.5px;">
                  ${t.button}
                </a>
              </td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 32px 32px;border-top:1px solid #2a2d3a;">
            <p style="margin:0;font-size:12px;color:#6b7280;line-height:1.7;text-align:center;">${t.footer(expiresInMinutes)}</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
