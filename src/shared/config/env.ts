import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  APP_URL: z.string().url().default("http://localhost:3000"),
  FRONTEND_URL: z.string().url().default("http://localhost:5173"),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(10),
  JWT_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_SECRET: z.string().min(10),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  AI_PROVIDER: z.enum(["openai", "anthropic", "deepseek"]).default("openai"),
  AI_MODEL: z.string().optional(),
  AI_MAX_TOKENS: z.coerce.number().default(1024),
  AI_TEMPERATURE: z.coerce.number().min(0).max(2).default(0.7),
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  DEEPSEEK_API_KEY: z.string().optional(),
  BCRYPT_ROUNDS: z.coerce.number().default(12),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
  RATE_LIMIT_GENERAL_WINDOW_MS: z.coerce.number().default(60_000),
  RATE_LIMIT_GENERAL_MAX: z.coerce.number().default(100),
  RATE_LIMIT_AUTH_WINDOW_MS: z.coerce.number().default(60_000),
  RATE_LIMIT_AUTH_MAX: z.coerce.number().default(10),
  S3_ENDPOINT: z.string().url(),
  S3_ACCESS_KEY: z.string().min(1),
  S3_SECRET_KEY: z.string().min(1),
  S3_BUCKET: z.string().default("insideout"),
  S3_REGION: z.string().default("us-east-1"),
  S3_PUBLIC_URL: z.string().url(),
  LOGIN_MAX_ATTEMPTS: z.coerce.number().default(5),
  LOGIN_LOCK_MINUTES: z.coerce.number().default(15),
  EMAIL_VERIFICATION_EXPIRES_H: z.coerce.number().default(24),
  RESEND_API_KEY: z.string().min(1),
  EMAIL_FROM: z
    .string()
    .default("InsideOut <noreply@insideoutexpressions.com>"),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error(
      "Invalid environment variables:",
      result.error.flatten().fieldErrors,
    );
    process.exit(1);
  }
  return result.data;
}

export const env = validateEnv();
