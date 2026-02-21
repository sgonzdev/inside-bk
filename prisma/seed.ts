import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const emotions = [
  {
    name: 'Joy',
    color: '#FFD93D',
    children: ['Gratitude', 'Excitement', 'Pride', 'Serenity', 'Hope'],
  },
  {
    name: 'Sadness',
    color: '#6EC6E6',
    children: ['Loneliness', 'Grief', 'Disappointment', 'Melancholy', 'Helplessness'],
  },
  {
    name: 'Anger',
    color: '#E84545',
    children: ['Frustration', 'Resentment', 'Irritation', 'Rage', 'Jealousy'],
  },
  {
    name: 'Fear',
    color: '#A45EDB',
    children: ['Anxiety', 'Insecurity', 'Panic', 'Worry', 'Shame'],
  },
  {
    name: 'Disgust',
    color: '#7BC74D',
    children: ['Contempt', 'Rejection', 'Aversion', 'Distrust', 'Boredom'],
  },
];

async function main() {
  console.log('Seeding emotions...');

  for (const emotion of emotions) {
    const parent = await prisma.emotion.upsert({
      where: { name: emotion.name },
      update: { color: emotion.color },
      create: { name: emotion.name, color: emotion.color },
    });

    for (const childName of emotion.children) {
      await prisma.emotion.upsert({
        where: { name: childName },
        update: { parentId: parent.id },
        create: { name: childName, parentId: parent.id },
      });
    }
  }

  const count = await prisma.emotion.count();
  console.log(`Done! ${count} emotions in database.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
