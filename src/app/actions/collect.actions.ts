"use server";

import { revalidatePath } from "next/cache";
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
