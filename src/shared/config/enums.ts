export const PROGRAMS = [
  "SOFTWARE_ENGINEERING",
  "ENVIRONMENTAL_ENGINEERING",
  "OCCUPATIONAL_HEALTH_ADMIN",
  "FOOD_ENGINEERING",
  "ELECTRICAL_ENGINEERING",
  "DIGITAL_BUSINESS_ADMIN",
] as const;

export const ROLES = ["STUDENT", "PROFESSIONAL"] as const;

export const LANGUAGES = ["ES", "EN"] as const;

export const THEMES = ["LIGHT", "DARK", "SYSTEM"] as const;
export const SEXES = ["MALE", "FEMALE", "OTHER"] as const;

export type Program = (typeof PROGRAMS)[number];
export type Role = (typeof ROLES)[number];
export type Language = (typeof LANGUAGES)[number];
export type Theme = (typeof THEMES)[number];
export type Sex = (typeof SEXES)[number];
