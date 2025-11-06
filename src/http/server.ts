import { Elysia } from "elysia";
import { PrismaTaskRepository } from "../infrastructure/repositories/PrismaTaskRepository";
import { TaskService } from "../application/TaskService";
import { pushNotification } from "../infrastructure/queue/redisClient";
import { AppError } from "../utils/errors";
import { ZodError } from "zod";

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

app.get("/tasks/:id", async ({ params }) => {
  const task = await service.getById(params.id);
  return task;
});

app.put("/tasks/:id", async ({ params, body }) => {
  const updated = await service.update(params.id, await body);
  return updated;
});

app.delete("/tasks/:id", async ({ params, set }) => {
  await service.delete(params.id);
  set.status = 204;
  return null;
});

app.onError(({ code, error, set }) => {
  if (error instanceof AppError) {
    set.status = error.status;
    return { error: error.message, details: error.details ?? null };
  }

  if (error instanceof ZodError) {
    set.status = 400;
    return {
      error: "Validation failed",
      details: error.errors.map((e) => ({ path: e.path, message: e.message })),
    };
  }

  if (code === "VALIDATION") {
    set.status = 400;
    return {
      error: "Validation failed",
      details: (error && (error.all ?? error.message)) || null,
    };
  }

  console.error("Unexpected error:", error);
  set.status = 500;
  return { error: "Internal Server Error" };
});

app.listen(3000);
console.log("Server running on http://localhost:3000");
