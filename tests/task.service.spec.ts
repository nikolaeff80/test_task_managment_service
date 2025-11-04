import { describe, it, expect, vi } from "vitest";
import { TaskService } from "../src/application/TaskService";

it("pushes notification for due soon", async () => {
  const repo = {
    create: vi.fn(async (t) => t),
    // ... other methods
  };
  const pushed = vi.fn(async () => {});
  const svc = new TaskService(repo, pushed);
  const dueDate = new Date(Date.now() + 2*60*60*1000).toISOString(); // 2 hours
  await svc.create({ title: "test", dueDate });
  expect(pushed).toHaveBeenCalled();
});
