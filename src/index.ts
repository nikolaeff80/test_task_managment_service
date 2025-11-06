import { Elysia } from "elysia";
import { PrismaTaskRepository } from "./infrastructure/repositories/PrismaTaskRepository";

const app = new Elysia();
const repo = new PrismaTaskRepository();

app.get("/tasks", async () => {
  const tasks = await repo.findAll();
  return tasks;
});

app.listen(3000);
console.log("Server running at http://localhost:3000");
