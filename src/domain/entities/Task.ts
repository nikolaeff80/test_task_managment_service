// domain/entities/Task.ts

export type TaskStatus = "pending" | "completed";

export interface TaskProps {
  id?: string;
  title: string;
  description?: string | null;
  dueDate?: Date | null;
  status?: TaskStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Task {
  public readonly id?: string;
  public readonly createdAt?: Date;
  public readonly updatedAt?: Date;
  public title: string;
  public description?: string | null;
  public dueDate?: Date | null;
  public status: TaskStatus;

  constructor(props: TaskProps) {
    this.id = props.id;
    this.title = props.title.trim();
    this.description = props.description || null;
    this.dueDate = props.dueDate ? new Date(props.dueDate) : null;
    this.status = props.status || "pending";
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;

    this.validate(); // автоматическая валидация при создании
  }

  /**
   * Проверка инвариантов доменной модели (DDD)
   */
  private validate() {
    // Заголовок
    if (!this.title || this.title.length === 0) {
      throw new Error("Task title is required.");
    }

    // Дата дедлайна не в прошлом
    if (this.dueDate && this.dueDate.getTime() < Date.now()) {
      throw new Error("Due date cannot be in the past.");
    }

    // Допустимый статус
    const validStatuses: TaskStatus[] = ["pending", "completed"];
    if (!validStatuses.includes(this.status)) {
      throw new Error(`Invalid task status: ${this.status}`);
    }
  }

  /**
   * Изменение данных задачи с повторной проверкой инвариантов
   */
  update(fields: Partial<Omit<TaskProps, "id" | "createdAt" | "updatedAt">>) {
    if (fields.title !== undefined) this.title = fields.title.trim();
    if (fields.description !== undefined) this.description = fields.description;
    if (fields.dueDate !== undefined)
      this.dueDate = fields.dueDate ? new Date(fields.dueDate) : null;
    if (fields.status !== undefined) this.status = fields.status;
    this.validate();
  }
}
