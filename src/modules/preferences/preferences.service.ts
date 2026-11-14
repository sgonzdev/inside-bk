import { PreferencesRepository } from "./preferences.repository";
import { UpdatePreferencesInput } from "./preferences.validation";

const DEFAULTS = {
  language: "ES" as const,
  theme: "LIGHT" as const,
  notificationsEnabled: true,
};

export class PreferencesService {
  constructor(private readonly repo = new PreferencesRepository()) {}

  async get(userId: string) {
    return (await this.repo.findByUserId(userId)) ?? DEFAULTS;
  }

  async update(userId: string, data: UpdatePreferencesInput) {
    return this.repo.upsert(userId, data);
  }
}
