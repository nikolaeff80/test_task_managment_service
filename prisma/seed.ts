import { prisma } from "../src/infrastructure/db/prismaClient";
import { v4 as uuid } from "uuid";

async function main() {
  console.log("Starting database seeding...");

  // Очистка таблицы
  await prisma.task.deleteMany();

  // Добавляем тестовые задачи
  await prisma.task.createMany({
    data: [
      {
        id: uuid(),
        title: "Finish backend architecture",
        description: "Complete the DDD + Clean Architecture setup",
        status: "pending",
        dueDate: new Date(Date.now() + 6 * 3600 * 1000), // 6 часов вперёд
      },
      {
        id: uuid(),
        title: "Write project README",
        description: "Document API endpoints and architectural decisions",
        status: "completed",
        dueDate: new Date(Date.now() - 24 * 3600 * 1000), // в прошлом
      },
    ],
  });

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
