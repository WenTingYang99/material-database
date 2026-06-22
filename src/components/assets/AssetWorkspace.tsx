"use client";

import { useMemo } from "react";
import type { Asset } from "@/lib/types/asset";
import type { MaterialGroup } from "@/lib/types/group";
import { useAppState } from "@/context/AppContext";
import { AssetToolbar } from "@/components/filters/AssetToolbar";
import { AssetCard } from "@/components/assets/AssetCard";

export function AssetWorkspace({ initialAssets, initialTotal, groups, title = "全部素材", breadcrumbPrefix = "全部" }: { initialAssets: Asset[]; initialTotal: number; groups: MaterialGroup[]; title?: string; breadcrumbPrefix?: string }) {
  const { state } = useAppState();
  const assets = useMemo(() => {
    let items = [...initialAssets];
    if (state.groupId !== "all") items = items.filter((asset) => asset.groupId === state.groupId);
    if (state.sort === "文件大小") items.sort((a, b) => b.sizeBytes - a.sizeBytes);
    if (state.sort === "素材名称") items.sort((a, b) => a.name.localeCompare(b.name, "zh-CN"));
    return items;
  }, [initialAssets, state.groupId, state.sort]);
  const groupName = state.groupId === "all" ? title : groups.find((group) => group.id === state.groupId)?.name || title;

  return (
    <main>
      <section className="bg-white px-7 py-5">
        <p className="mb-2 text-sm text-slate-500">{breadcrumbPrefix} › {groupName}</p>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{groupName}</h1>
          <div className="flex gap-2">
            <button className="rounded-ui bg-brand px-5 py-3 font-semibold text-white" type="button">↓ 上传</button>
            <button className="rounded-ui border border-slate-300 px-5 py-3" type="button">⌘ 分享</button>
            <button className="rounded-ui border border-slate-300 px-5 py-3" type="button">□ 收素材</button>
            <button className="rounded-ui border border-slate-300 px-5 py-3" type="button">＋ 新建素材组</button>
          </div>
        </div>
      </section>
      <AssetToolbar total={state.groupId === "all" ? initialTotal : assets.length} />
      <section className="p-7">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-5">
          {assets.map((asset) => <AssetCard key={asset.id} asset={asset} />)}
        </div>
        {!assets.length ? <div className="py-28 text-center text-slate-400">暂无素材</div> : null}
      </section>
    </main>
  );
}
