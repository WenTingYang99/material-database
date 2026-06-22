import { JsonDatabase } from "@/lib/db/json/JsonDatabase";
import type { CreateCollectTaskInput, DbCollectTask, ICollectRepository } from "@/lib/db/repositories/interfaces";

function nowText() {
  return new Date().toISOString().slice(0, 19).replace("T", " ");
}

function randomCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export class JsonCollectRepository implements ICollectRepository {
  constructor(private readonly database = new JsonDatabase()) {}

  async findTasks(): Promise<DbCollectTask[]> {
    const db = await this.database.read();
    return [...db.t_collect_task].sort((a, b) => b.create_time.localeCompare(a.create_time));
  }

  async findTaskByCode(code: string): Promise<DbCollectTask | null> {
    const db = await this.database.read();
    return db.t_collect_task.find((task) => task.access_code === code) || null;
  }

  async createTask(data: CreateCollectTaskInput): Promise<DbCollectTask> {
    const db = await this.database.read();
    const taskId = Math.max(0, ...db.t_collect_task.map((task) => task.task_id)) + 1;
    const now = nowText();
    const task: DbCollectTask = {
      task_id: taskId,
      theme: data.theme,
      description: data.description || null,
      group_id: data.group_id || null,
      status: "active",
      access_code: data.access_code || randomCode(),
      allowed_file_types: data.allowed_file_types,
      expires_at: data.expires_at || null,
      creator_id: data.creator_id || 1,
      create_time: now,
      update_time: now,
    };
    db.t_collect_task.unshift(task);
    await this.database.write(db);
    return task;
  }
}
