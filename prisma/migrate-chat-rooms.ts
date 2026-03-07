/**
 * Script one-time: crea salas de chat entre todos los STUDENTs
 * y todos los PROFESSIONALs existentes que aún no tengan sala directa.
 *
 * Ejecutar con: npx tsx prisma/migrate-chat-rooms.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    select: { id: true, email: true },
  });

  const professionals = await prisma.user.findMany({
    where: { role: "PROFESSIONAL" },
    select: { id: true, email: true },
  });

  console.log(`Estudiantes: ${students.length}`);
  console.log(`Profesionales: ${professionals.length}`);

  if (!students.length || !professionals.length) {
    console.log("No hay suficientes usuarios. Nada que hacer.");
    return;
  }

  let created = 0;
  let skipped = 0;

  for (const student of students) {
    for (const prof of professionals) {
      // Verificar si ya existe una sala directa entre este par
      const existing = await prisma.chatRoom.findFirst({
        where: {
          name: null,
          AND: [
            { participants: { some: { userId: student.id } } },
            { participants: { some: { userId: prof.id } } },
          ],
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
            create: [{ userId: student.id }, { userId: prof.id }],
          },
        },
      });
      created++;
      console.log(`  Sala creada: ${student.email} ↔ ${prof.email}`);
    }
  }

  console.log(`\nListo. Salas creadas: ${created} | Omitidas (ya existían): ${skipped}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
