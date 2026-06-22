"use server";

import { revalidatePath } from "next/cache";
import { createRepositories } from "@/lib/db/repositories/factory";

export async function createTagAction(formData: FormData) {
  const tagName = String(formData.get("tagName") || "").trim();
  const description = String(formData.get("description") || "").trim();
  if (!tagName) return;
  const { tags } = createRepositories();
  await tags.create({ tagName, description });
  revalidatePath("/tags");
}

export async function updateTagAction(formData: FormData) {
  const id = String(formData.get("tagId") || "");
  const tagName = String(formData.get("tagName") || "").trim();
  if (!id || !tagName) return;
  const { tags } = createRepositories();
  await tags.update(id, {
    tagName,
    description: String(formData.get("description") || ""),
    status: formData.get("status") === "0" ? 0 : 1,
    aiRecognitionEnabled: formData.get("aiRecognitionEnabled") === "0" ? 0 : 1,
  });
  revalidatePath("/tags");
}

export async function mergeTagAction(formData: FormData) {
  const sourceId = String(formData.get("sourceTagId") || "");
  const targetId = String(formData.get("targetTagId") || "");
  if (!sourceId || !targetId || sourceId === targetId) return;
  const { tags } = createRepositories();
  await tags.merge(sourceId, targetId);
  revalidatePath("/tags");
}
