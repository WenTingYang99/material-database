"use server";

import { revalidatePath } from "next/cache";
import { createRepositories } from "@/lib/db/repositories/factory";

export async function createShareAction(formData: FormData) {
  const { shares } = createRepositories();
  const targetType = String(formData.get("target_type") || "asset") as "asset" | "group" | "basket";
  const targetIds = String(formData.get("target_ids") || "")
    .split(",")
    .map((item) => Number(item.trim()))
    .filter(Boolean);
  await shares.create({
    share_name: String(formData.get("share_name") || "未命名分享"),
    target_type: targetType,
    target_ids: targetIds.length ? targetIds : [1],
    access_level: String(formData.get("access_level") || "internal") as "internal" | "public" | "specified",
    allow_download: formData.get("allow_download") === "on",
    include_attachment: formData.get("include_attachment") === "on",
    password: String(formData.get("password") || ""),
    expires_at: String(formData.get("expires_at") || ""),
    creator_id: 1,
  });
  revalidatePath("/shares");
}
