import { Resend } from 'resend';
import { env } from '../../shared/config/env';

const resend = new Resend(env.RESEND_API_KEY);

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions): Promise<void> {
  const { error } = await resend.emails.send({
    from: env.EMAIL_FROM,
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
  });

  if (error) throw new Error(`Email send failed: ${error.message}`);
}
