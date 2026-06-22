"use server";

import { mkdir, writeFile } from "fs/promises";
import { revalidatePath } from "next/cache";
import path from "path";
import { createRepositories } from "@/lib/db/repositories/factory";

export async function createCollectTaskAction(formData: FormData) {
  const { collect } = createRepositories();
  const allowedFileTypes = formData.getAll("allowed_file_types").map(String);
  await collect.createTask({
    theme: String(formData.get("theme") || "未命名收集任务"),
    description: String(formData.get("description") || ""),
    group_id: formData.get("group_id") ? Number(formData.get("group_id")) : null,
    access_code: String(formData.get("access_code") || ""),
    allowed_file_types: allowedFileTypes.length ? allowedFileTypes : ["图片", "视频", "文档"],
    expires_at: String(formData.get("expires_at") || ""),
    creator_id: 1,
  });
  revalidatePath("/collect-tasks");
}

export async function submitCollectTaskAction(formData: FormData) {
  const taskId = Number(formData.get("task_id"));
  if (!taskId) return;
  const { collect } = createRepositories();
  const submission = await collect.createSubmission({
    task_id: taskId,
    uploader_name: String(formData.get("uploader_name") || ""),
    contact: String(formData.get("contact") || ""),
    remark: String(formData.get("remark") || ""),
  });
  const files = formData.getAll("files").filter((file): file is File => file instanceof File && file.size > 0);
  if (files.length) {
    const uploadDir = path.join(process.cwd(), "public", "uploads", "collect");
    await mkdir(uploadDir, { recursive: true });
    for (const file of files) {
      const storedName = `${Date.now()}-${Math.random().toString(16).slice(2)}-${file.name.replace(/[^\w.-]+/g, "_")}`;
      await writeFile(path.join(uploadDir, storedName), Buffer.from(await file.arrayBuffer()));
      await collect.addUploadFile({
        submission_id: submission.submission_id,
        file_name: file.name,
        file_path: `uploads/collect/${storedName}`,
        format: file.name.split(".").pop()?.toUpperCase() || "FILE",
        file_size: file.size,
      });
    }
  }
  revalidatePath("/collect-tasks");
}
