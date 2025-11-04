import { Elysia } from "elysia";
import { PrismaTaskRepository } from "../infrastructure/repositories/PrismaTaskRepository";
import { TaskService } from "../application/TaskService";
import { pushNotification } from "../infrastructure/queue/redisClient";

const repo = new PrismaTaskRepository();
const service = new TaskService(repo, pushNotification);

const app = new Elysia();

app.post("/tasks", async ({ body, set }) => {
  const created = await service.create(await body);
  set.status = 201;
  return created;
});

app.get("/tasks", async ({ query }) => {
  const status = query.status as string | undefined;
  const tasks = await service.list(status);
  return tasks;
});

app.get("/tasks/:id", async ({ params, set }) => {
  const task = await service.getById(params.id);
  if (!task) {
    set.status = 404;
    return { error: "Task not found" };
  }
  return task;
});

app.put("/tasks/:id", async ({ params, body, set }) => {
  const updated = await service.update(params.id, await body);
  return updated;
});

app.delete("/tasks/:id", async ({ params, set }) => {
  await service.delete(params.id);
  set.status = 204;
  return null;
});

app.listen(3000);
console.log("🚀 Server running on http://localhost:3000");
