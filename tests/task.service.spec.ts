import { describe, it, expect, vi, beforeEach } from "vitest";
import { TaskService } from "../src/application/TaskService";
import { Task } from "../src/domain/entities/Task";
import { ValidationError, NotFoundError } from "../src/utils/errors";

function makeRepoMock() {
  const db = new Map<string, Task>();
  return {
    create: vi.fn(async (t: Task) => {
      const id = Math.random().toString(36).slice(2);
      const newTask = new Task({
        id,
        title: t.title,
        description: t.description,
        status: t.status,
        dueDate: t.dueDate,
      });
      db.set(id, newTask);
      return newTask;
    }),

    findById: vi.fn(async (id: string) => db.get(id)),

    update: vi.fn(async (t: Task) => {
      db.set(t.id, t);
      return t;
    }),

    delete: vi.fn(async (id: string) => {
      const has = db.has(id);
      db.delete(id);
      return has;
    }),

    findAll: vi.fn(async (filter?: { status?: string }) => {
      const items = Array.from(db.values());
      return filter?.status
        ? items.filter((t) => t.status === filter.status)
        : items;
    }),

    __db: db,
  };
}

describe("TaskService CRUD operations", () => {
  let repo: ReturnType<typeof makeRepoMock>;
  let pushMock: ReturnType<typeof vi.fn>;
  let svc: TaskService;
  const now = Date.now();

  beforeEach(() => {
    repo = makeRepoMock();
    pushMock = vi.fn(async () => {});
    svc = new TaskService(repo as any, pushMock);
  });

  it("creates a task without dueDate", async () => {
    const task = await svc.create({ title: "Test task" });
    expect(task.id).toBeDefined();
    expect(task.title).toBe("Test task");
    expect(task.dueDate).toBeNull();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("creates a task with dueDate within 24h and pushes notification", async () => {
    const dueDate = new Date(now + 2 * 60 * 60 * 1000).toISOString();
    const task = await svc.create({ title: "Soon due", dueDate });
    expect(pushMock).toHaveBeenCalledTimes(1);
    expect(pushMock).toHaveBeenCalledWith(
      expect.objectContaining({ type: "due_soon", taskId: task.id })
    );
  });

  it("creates a task with dueDate far in future and does NOT push notification", async () => {
    const dueDate = new Date(now + 48 * 60 * 60 * 1000).toISOString();
    const task = await svc.create({ title: "Far task", dueDate });
    expect(pushMock).not.toHaveBeenCalled();
    expect(task.dueDate).toBeInstanceOf(Date);
  });

  it("throws ValidationError on invalid dueDate format", async () => {
    await expect(
      svc.create({ title: "Bad date", dueDate: "2025-11-06 12:00" })
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it("updates an existing task", async () => {
    const created = await svc.create({ title: "Initial" });
    const updated = await svc.update(created.id, {
      title: "Updated title",
      description: "New desc",
    });
    expect(updated.title).toBe("Updated title");
    expect(repo.update).toHaveBeenCalled();
  });

  it("throws NotFoundError on updating missing task", async () => {
    await expect(
      svc.update("non-existent-id", { title: "New" })
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("deletes a task", async () => {
    const created = await svc.create({ title: "Delete me" });
    const id = created.id;
    const before = await repo.findById(id);
    expect(before).toBeTruthy();

    await svc.delete(id);

    const after = await repo.findById(id);
    expect(after).toBeUndefined();
  });

  it("lists all tasks", async () => {
    await svc.create({ title: "T1" });
    await svc.create({ title: "T2" });
    const tasks = await svc.list();
    expect(tasks.length).toBe(2);
  });

  it("filters tasks by status", async () => {
    const t1 = await svc.create({ title: "Done" });
    const t2 = await svc.create({ title: "Pending" });
    t1.status = "completed";
    await repo.update(t1);

    const filtered = await svc.list("completed");
    expect(filtered).toHaveLength(1);
    expect(filtered[0].status).toBe("completed");
  });

  it("getById returns correct task", async () => {
    const t = await svc.create({ title: "Unique" });
    const found = await svc.getById(t.id);
    expect(found?.title).toBe("Unique");
  });
});
