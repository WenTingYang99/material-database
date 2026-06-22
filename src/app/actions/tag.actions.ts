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
