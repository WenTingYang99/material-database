"use server";

import { revalidatePath } from "next/cache";
import { createRepositories } from "@/lib/db/repositories/factory";

export async function createTagAction(formData: FormData) {
  const tagName = String(formData.get("tagName") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const tagType = String(formData.get("tagType") || "1") === "2" ? 2 : 1;
  if (!tagName) return;
  const { tags } = createRepositories();
  await tags.create({
    tagName,
    description,
    tagType,
    parentId: String(formData.get("parentId") || ""),
    aiRecognitionEnabled: formData.get("aiRecognitionEnabled") ? 1 : 0,
  });
  revalidatePath("/tags");
}

export async function updateTagAction(formData: FormData) {
  const id = String(formData.get("tagId") || "");
  const tagName = String(formData.get("tagName") || "").trim();
  if (!id || !tagName) return;
  const { tags } = createRepositories();
  const tagType = String(formData.get("tagType") || "") === "2" ? 2 : String(formData.get("tagType") || "") === "1" ? 1 : undefined;
  await tags.update(id, {
    tagName,
    description: String(formData.get("description") || ""),
    tagType,
    parentId: String(formData.get("parentId") || ""),
    status: formData.get("status") === "0" ? 0 : 1,
    aiRecognitionEnabled: formData.get("aiRecognitionEnabled") ? 1 : 0,
  });
  revalidatePath("/tags");
}

export async function mergeTagAction(formData: FormData) {
  const sourceIds = formData.getAll("sourceTagId").map((value) => String(value || "")).filter(Boolean);
  const targetId = String(formData.get("targetTagId") || "");
  if (!sourceIds.length || !targetId) return;
  const { tags } = createRepositories();
  for (const sourceId of sourceIds) {
    if (sourceId !== targetId) await tags.merge(sourceId, targetId);
  }
  revalidatePath("/tags");
}
