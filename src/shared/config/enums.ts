export const PROGRAMS = [
  'ENGINEERING',
  'MEDICINE',
  'LAW',
  'PSYCHOLOGY',
  'BUSINESS',
  'ARTS',
  'SCIENCES',
  'EDUCATION',
  'ARCHITECTURE',
  'COMMUNICATIONS',
] as const;

export const ROLES = ['STUDENT', 'PROFESSIONAL'] as const;

export const LANGUAGES = ['ES', 'EN'] as const;

export const THEMES = ['LIGHT', 'DARK', 'SYSTEM'] as const;
export const SEXES = ['MALE', 'FEMALE', 'OTHER'] as const;

export type Program = (typeof PROGRAMS)[number];
export type Role = (typeof ROLES)[number];
export type Language = (typeof LANGUAGES)[number];
export type Theme = (typeof THEMES)[number];
export type Sex = (typeof SEXES)[number];
