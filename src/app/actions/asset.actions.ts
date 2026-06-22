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
  revalidateAssetPages();
}

export async function batchSoftDeleteAssets(ids: string[]) {
  const { assets } = createRepositories();
  await Promise.all(ids.map((id) => assets.delete(id)));
  revalidateAssetPages();
}

export async function restoreAsset(id: string) {
  const { assets } = createRepositories();
  await assets.restore(id);
  revalidateAssetPages();
}

export async function batchRestoreAssets(ids: string[]) {
  const { assets } = createRepositories();
  await Promise.all(ids.map((id) => assets.restore(id)));
  revalidateAssetPages();
}

export async function hardDeleteAsset(id: string) {
  const { assets } = createRepositories();
  await assets.hardDelete(id);
  revalidateAssetPages();
}

export async function batchHardDeleteAssets(ids: string[]) {
  const { assets } = createRepositories();
  await Promise.all(ids.map((id) => assets.hardDelete(id)));
  revalidateAssetPages();
}

export async function updateAssetValidity(ids: string[], validUntil: string) {
  if (!ids.length || !validUntil) return;
  const { assets } = createRepositories();
  await assets.batchUpdateValidity(ids, validUntil);
  revalidateAssetPages();
}

export async function createMaterialGroup(input: { name: string; parentId?: string | null }) {
  const name = input.name.trim();
  if (!name) return;
  const { groups } = createRepositories();
  await groups.create({ name, parentId: input.parentId || null });
  revalidateAssetPages();
}

function revalidateAssetPages() {
  ["/", "/pending", "/created", "/recycle", "/validity", "/activity"].forEach((path) => revalidatePath(path));
}
