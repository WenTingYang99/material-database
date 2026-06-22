"use server";

import { mkdir, writeFile } from "fs/promises";
import { revalidatePath } from "next/cache";
import path from "path";
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

export async function uploadAssetsAction(formData: FormData) {
  const files = formData.getAll("files").filter((file): file is File => file instanceof File && file.size > 0);
  if (!files.length) return;
  const groupId = String(formData.get("groupId") || "") || null;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  const { assets } = createRepositories();
  for (const file of files) {
    const format = getFormat(file.name);
    if (!isAllowedUploadFormat(format)) continue;
    const storedName = `${Date.now()}-${Math.random().toString(16).slice(2)}-${sanitizeFileName(file.name)}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const recognized = recognizeUploadMetadata(file.name, file.type, format);
    await writeFile(path.join(uploadDir, storedName), buffer);
    await assets.create({
      name: file.name.replace(/\.[^.]+$/, ""),
      src: `uploads/${storedName}`,
      format,
      mime: file.type || "application/octet-stream",
      type: getMediaType(file.type, format),
      sizeBytes: file.size,
      desc: "",
      brand: recognized.brand,
      model: recognized.model,
      customTags: [],
      aiTags: recognized.aiTags,
      color: recognized.color,
      groupId,
      owner: "Kerry",
      permission: "企业内部 - 可下载",
      validStart: formatDateTime(new Date()),
      validUntil: formatDateTime(addYears(new Date(), 100)),
      validUntilDate: formatDateTime(addYears(new Date(), 100)),
      status: "active",
      share: 0,
      download: 0,
      view: 0,
      logs: [],
    });
  }
  revalidateAssetPages();
}

export async function updateAssetAction(formData: FormData) {
  const id = String(formData.get("assetId") || "");
  const name = String(formData.get("name") || "").trim();
  if (!id || !name) return;
  const { assets } = createRepositories();
  await assets.update(id, {
    name,
    desc: String(formData.get("desc") || "").trim(),
    brand: String(formData.get("brand") || "").trim(),
    model: String(formData.get("model") || "").trim(),
    customTags: splitTags(String(formData.get("customTags") || "")),
    permission: String(formData.get("permission") || "").trim(),
    groupId: String(formData.get("groupId") || "") || null,
    validStart: normalizeDateTime(String(formData.get("validStart") || "")),
    validUntil: normalizeDateTime(String(formData.get("validUntil") || "")),
    validUntilDate: normalizeDateTime(String(formData.get("validUntil") || "")),
  });
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

export async function updateMaterialGroup(input: { id: string; name: string; parentId?: string | null }) {
  if (!input.id || !input.name.trim()) return;
  const { groups } = createRepositories();
  await groups.update(input.id, { name: input.name.trim(), parentId: input.parentId || null });
  revalidateAssetPages();
}

export async function deleteMaterialGroup(id: string) {
  if (!id) return;
  const { groups } = createRepositories();
  await groups.delete(id);
  revalidateAssetPages();
}

export async function shareAssetsAction(ids: string[]) {
  if (!ids.length) return;
  const { shares } = createRepositories();
  await shares.create({
    share_name: `素材分享 ${formatDateTime(new Date())}`,
    target_type: "basket",
    target_ids: ids.map(Number).filter(Boolean),
    access_level: "internal",
    allow_download: true,
    include_attachment: false,
    creator_id: 1,
  });
  revalidatePath("/shares");
}

function revalidateAssetPages() {
  ["/", "/pending", "/created", "/recycle", "/validity", "/activity"].forEach((path) => revalidatePath(path));
}

const allowedUploadFormats = new Set([
  "JPG", "JPEG", "PNG", "GIF", "WEBP", "SVG",
  "MP4", "MOV", "AVI", "WMV", "MPEG",
  "PDF", "DOC", "DOCX", "PPT", "PPTX", "XLS", "XLSX", "TXT",
  "PSD", "AI", "SKETCH", "FIG", "ZIP", "RAR", "7Z",
]);

function getFormat(fileName: string) {
  const ext = fileName.split(".").pop()?.trim().toUpperCase();
  return ext || "FILE";
}

function isAllowedUploadFormat(format: string) {
  return allowedUploadFormats.has(format);
}

function getMediaType(mime: string, format: string) {
  if (mime.startsWith("image/")) return "图片";
  if (mime.startsWith("video/")) return "视频";
  if (["PDF", "DOC", "DOCX", "PPT", "PPTX", "XLS", "XLSX", "TXT"].includes(format)) return "文档";
  return "文件";
}

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^\w.-]+/g, "_");
}

function addYears(date: Date, years: number) {
  const next = new Date(date);
  next.setFullYear(next.getFullYear() + years);
  return next;
}

function formatDateTime(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function normalizeDateTime(value: string) {
  return value ? value.replace("T", " ") : undefined;
}

function splitTags(value: string) {
  return value
    .split(/[,，、\n]/)
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function recognizeUploadMetadata(fileName: string, mime: string, format: string) {
  const text = fileName.toLowerCase();
  const aiTags = new Set<string>();
  if (mime.startsWith("image/")) aiTags.add("图片");
  if (mime.startsWith("video/")) aiTags.add("视频");
  if (["PDF", "DOC", "DOCX", "PPT", "PPTX", "XLS", "XLSX", "TXT"].includes(format)) aiTags.add("文档");
  if (/车|auto|car|c5|c6|c3|408|508|4008|5008/.test(text)) aiTags.add("汽车");
  if (/活动|event|车展|show/.test(text)) aiTags.add("活动");
  if (/促销|618|双11|promo|sale/.test(text)) aiTags.add("促销");
  const brand = /peugeot|标致/.test(text) ? "东风标致" : /citroen|雪铁龙/.test(text) ? "东风雪铁龙" : "";
  const model = ["C5X", "C6", "C3-XR", "408", "508L", "4008", "5008"].find((item) => text.includes(item.toLowerCase())) || "";
  return { aiTags: [...aiTags], brand, model, color: "" };
}
