"use server";

import { revalidatePath } from "next/cache";
import { createRepositories } from "@/lib/db/repositories/factory";
import type { AssetQueryParams } from "@/lib/types/asset";

export async function getAssets(params: AssetQueryParams = {}) {
  const { assets } = createRepositories();
  return assets.findAll(params);
}

export async function softDeleteAsset(id: string) {
  const { assets } = createRepositories();
  await assets.delete(id);
  revalidatePath("/");
}

export async function restoreAsset(id: string) {
  const { assets } = createRepositories();
  await assets.restore(id);
  revalidatePath("/");
}
