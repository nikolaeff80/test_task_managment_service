import { ITaskRepository } from "../../domain/repositories/ITaskRepository";
import { Task } from "../../domain/entities/Task";
import { prisma } from "../db/prismaClient";
import { PrismaClient } from "@prisma/client";

const tmpClient = new PrismaClient();
type TaskRecord = Awaited<ReturnType<typeof tmpClient.task.findFirst>>;

export class PrismaTaskRepository implements ITaskRepository {
  async create(task: Task) {
    const rec = await prisma.task.create({
      data: {
        id: task.id,
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        status: task.status,
      },
    });
    return new Task({ ...rec });
  }

  async findById(id: string) {
    const rec = await prisma.task.findUnique({ where: { id } });
    return rec ? new Task({ ...rec }) : null;
  }

  async findAll(filter?: { status?: string }) {
    const recs = await prisma.task.findMany({
      where: filter?.status ? { status: filter.status } : undefined,
    });
    return recs.map((r: TaskRecord) => new Task({ ...r }));
  }

  async update(task: Task) {
    const rec = await prisma.task.update({
      where: { id: task.id },
      data: {
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        status: task.status,
      },
    });
    return new Task({ ...rec });
  }

  async delete(id: string) {
    await prisma.task.delete({ where: { id } });
  }

  async findDueWithin(hours: number) {
    const upper = new Date(Date.now() + hours * 3600 * 1000);
    const recs = await prisma.task.findMany({
      where: { dueDate: { lte: upper }, status: "pending" },
    });
    return recs.map((r: TaskRecord) => new Task({ ...r }));
  }
}
