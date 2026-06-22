import { JsonDatabase } from "@/lib/db/json/JsonDatabase";
import type { CreateCollectSubmissionInput, CreateCollectTaskInput, CreateCollectUploadFileInput, DbCollectSubmission, DbCollectTask, DbCollectUploadFile, ICollectRepository } from "@/lib/db/repositories/interfaces";

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

  async createSubmission(data: CreateCollectSubmissionInput): Promise<DbCollectSubmission> {
    const db = await this.database.read();
    const submissionId = Math.max(0, ...db.t_collect_submission.map((item) => item.submission_id)) + 1;
    const now = nowText();
    const submission: DbCollectSubmission = {
      submission_id: submissionId,
      task_id: data.task_id,
      uploader_name: data.uploader_name || null,
      contact: data.contact || null,
      remark: data.remark || null,
      status: "submitted",
      create_time: now,
    };
    db.t_collect_submission.unshift(submission);
    await this.database.write(db);
    return submission;
  }

  async addUploadFile(data: CreateCollectUploadFileInput): Promise<DbCollectUploadFile> {
    const db = await this.database.read();
    const fileId = Math.max(0, ...db.t_collect_upload_file.map((item) => item.file_id)) + 1;
    const file: DbCollectUploadFile = {
      file_id: fileId,
      submission_id: data.submission_id,
      asset_id: null,
      file_name: data.file_name,
      file_path: data.file_path,
      format: data.format,
      file_size: data.file_size,
      upload_status: "uploaded",
      create_time: nowText(),
    };
    db.t_collect_upload_file.unshift(file);
    await this.database.write(db);
    return file;
  }

  async findSubmissions(taskId: number): Promise<DbCollectSubmission[]> {
    const db = await this.database.read();
    return db.t_collect_submission.filter((item) => item.task_id === taskId).sort((a, b) => b.create_time.localeCompare(a.create_time));
  }
}
