import { ITaskRepository } from "../domain/repositories/ITaskRepository";
import { Task } from "../domain/entities/Task";
import { z } from "zod";

const CreateTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  dueDate: z.string().optional(), // ISO
});

export class TaskService {
  constructor(private repo: ITaskRepository, private queueProducer: (payload:any)=>Promise<void>) {}

  async create(input: unknown) {
    const data = CreateTaskSchema.parse(input);
    const due = data.dueDate ? new Date(data.dueDate) : undefined;
    const task = new Task({ title: data.title, description: data.description, dueDate: due });
    const created = await this.repo.create(task);

    // if due within 24 hours → push to queue
    if (created.dueDate) {
      const ms = created.dueDate.getTime() - Date.now();
      const hours = ms / (1000*60*60);
      if (hours >= 0 && hours <= 24) {
        await this.queueProducer({ type: "due_soon", taskId: created.id, dueDate: created.dueDate.toISOString() });
      }
    }
    return created;
  }

  async list(status?: string) {
    return this.repo.findAll(status ? { status } : undefined);
  }

  async getById(id: string) {
    const t = await this.repo.findById(id);
    if (!t) throw new Error("TaskNotFound");
    return t;
  }

  async update(id: string, input: any) {
    const task = await this.getById(id);
    task.update({
      title: input.title,
      description: input.description,
      dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
      status: input.status,
    });
    const updated = await this.repo.update(task);

    if (updated.dueDate) {
      const hours = (updated.dueDate.getTime() - Date.now())/(1000*60*60);
      if (hours >= 0 && hours <= 24) {
        await this.queueProducer({ type: "due_soon", taskId: updated.id, dueDate: updated.dueDate.toISOString() });
      }
    }
    return updated;
  }

  async delete(id: string) {
    return this.repo.delete(id);
  }
}
