import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const emotions = [
  { name: "HAPPY", color: "#FFD93D" },
  { name: "SATISFIED", color: "#7BC74D" },
  { name: "SAD", color: "#6EC6E6" },
  { name: "DEPRESSED", color: "#808080" },
  { name: "ANGRY", color: "#E84545" },
  { name: "ANXIOUS", color: "#A45EDB" },
  { name: "CONFUSED", color: "#FF8C00" },
];

async function main() {
  console.log("Seeding emotions...");

  for (const emotion of emotions) {
    await prisma.emotion.upsert({
      where: { name: emotion.name },
      update: { color: emotion.color },
      create: emotion,
    });
  }

  // Remove any emotions not in the list above
  await prisma.emotion.deleteMany({
    where: { name: { notIn: emotions.map((e) => e.name) } },
  });

  const count = await prisma.emotion.count();
  console.log(`Done! ${count} emotions in database.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
