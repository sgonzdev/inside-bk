/**
 * Script one-time: crea 2 profesionales en la BD y les crea salas
 * con todos los estudiantes existentes.
 *
 * Ejecutar con: npx tsx prisma/seed-professionals.ts
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const professionals = [
  {
    email: "maria_lopezca@fet.edu.co",
    firstName: "María",
    lastName: "López Castillo",
    idDocument: "1234567890",
    phone: "3001234567",
    birthDate: new Date("1985-06-15"),
    sex: "FEMALE" as const,
    program: "OCCUPATIONAL_HEALTH_ADMIN" as const,
  },
  {
    email: "carlos_ramirezmo@fet.edu.co",
    firstName: "Carlos",
    lastName: "Ramírez Mora",
    idDocument: "9876543210",
    phone: "3109876543",
    birthDate: new Date("1980-03-22"),
    sex: "MALE" as const,
    program: "OCCUPATIONAL_HEALTH_ADMIN" as const,
  },
  {
    email: "carolina@fet.edu.co",
    firstName: "Carolina",
    lastName: "Trujillo",
    idDocument: "1021392690",
    phone: "3133189871",
    birthDate: new Date("1998-09-04"),
    sex: "FEMALE" as const,
    program: "OCCUPATIONAL_HEALTH_ADMIN" as const,
  },
];

async function main() {
  const password = await bcrypt.hash("Psico123!", 10);

  const createdIds: string[] = [];

  for (const prof of professionals) {
    const existing = await prisma.user.findUnique({ where: { email: prof.email } });
    if (existing) {
      console.log(`Ya existe: ${prof.email}`);
      createdIds.push(existing.id);
      continue;
    }

    const user = await prisma.user.create({
      data: {
        ...prof,
        password,
        role: "PROFESSIONAL",
        emailVerified: true,
        consentGiven: true,
        preferences: { create: { language: "ES" } },
      },
    });
    console.log(`Creado: ${user.firstName} ${user.lastName} (${user.email})`);
    createdIds.push(user.id);
  }

  // Crear salas con todos los estudiantes existentes
  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    select: { id: true, email: true },
  });

  console.log(`\nCreando salas con ${students.length} estudiantes...`);

  let created = 0;
  let skipped = 0;

  for (const profId of createdIds) {
    for (const student of students) {
      const existing = await prisma.chatRoom.findFirst({
        where: {
          name: null,
          AND: [
            { participants: { some: { userId: profId } } },
            { participants: { some: { userId: student.id } } },
          ],
          participants: { every: { userId: { in: [profId, student.id] } } },
        },
        include: { _count: { select: { participants: true } } },
      });

      if (existing && existing._count.participants === 2) {
        skipped++;
        continue;
      }

      await prisma.chatRoom.create({
        data: {
          participants: {
            create: [{ userId: student.id }, { userId: profId }],
          },
        },
      });
      created++;
      console.log(`  Sala creada: ${student.email} ↔ profId:${profId.slice(0, 8)}`);
    }
  }

  console.log(`\nListo. Salas creadas: ${created} | Omitidas: ${skipped}`);
  console.log("\nCredenciales de acceso:");
  professionals.forEach((p) => console.log(`  ${p.email} / Psico123!`));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
