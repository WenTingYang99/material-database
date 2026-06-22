import { NextResponse } from "next/server";
import { createRepositories } from "@/lib/db/repositories/factory";
import type { AssetStatus } from "@/lib/types/asset";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const { assets } = createRepositories();
  const result = await assets.findAll({
    keyword: url.searchParams.get("keyword") || undefined,
    groupId: url.searchParams.get("groupId") || "all",
    status: (url.searchParams.get("status") as AssetStatus | null) || "active",
    sortBy: url.searchParams.get("sortBy") || "素材热度",
    sortOrder: url.searchParams.get("sortOrder") === "asc" ? "asc" : "desc",
    page: Number(url.searchParams.get("page") || 1),
    size: Number(url.searchParams.get("size") || 60),
  });
  return NextResponse.json(result);
}
