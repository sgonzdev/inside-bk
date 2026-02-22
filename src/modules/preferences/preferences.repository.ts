import prisma from "../../infrastructure/database/prisma";
import { UpdatePreferencesInput } from "./preferences.validation";

export class PreferencesRepository {
  async findByUserId(userId: string) {
    return prisma.userPreferences.findUnique({ where: { userId } });
  }

  async upsert(userId: string, data: UpdatePreferencesInput) {
    return prisma.userPreferences.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    });
  }
}
