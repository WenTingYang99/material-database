"use client";

import { FormEvent, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Asset, AssetStatus } from "@/lib/types/asset";
import type { MaterialGroup } from "@/lib/types/group";
import { useAppState } from "@/context/AppContext";
import { AssetToolbar } from "@/components/filters/AssetToolbar";
import { AssetCard } from "@/components/assets/AssetCard";
import { batchHardDeleteAssets, batchRestoreAssets, batchSoftDeleteAssets, createMaterialGroup, updateAssetValidity } from "@/app/actions/asset.actions";

type WorkspaceMode = "normal" | "recycle";

export function AssetWorkspace({ initialAssets, initialTotal, groups, title = "全部素材", breadcrumbPrefix = "全部", mode = "normal" }: { initialAssets: Asset[]; initialTotal: number; groups: MaterialGroup[]; title?: string; breadcrumbPrefix?: string; status?: AssetStatus; mode?: WorkspaceMode }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [newGroupName, setNewGroupName] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const { state, dispatch } = useAppState();
  const assets = useMemo(() => {
    let items = [...initialAssets];
    if (state.groupId !== "all") items = items.filter((asset) => asset.groupId === state.groupId);
    if (state.sort === "文件大小") items.sort((a, b) => b.sizeBytes - a.sizeBytes);
    if (state.sort === "素材名称") items.sort((a, b) => a.name.localeCompare(b.name, "zh-CN"));
    if (state.sort === "上传日期" || state.sort === "创建时间") items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return items;
  }, [initialAssets, state.groupId, state.sort]);
  const groupName = state.groupId === "all" ? title : groups.find((group) => group.id === state.groupId)?.name || title;
  const selectedCount = state.selectedIds.length;

  const runSelectedAction = (action: (ids: string[]) => Promise<void>) => {
    const ids = [...state.selectedIds];
    if (!ids.length) return;
    startTransition(async () => {
      await action(ids);
      dispatch({ type: "clearSelected" });
      router.refresh();
    });
  };

  const handleCreateGroup = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = newGroupName.trim();
    if (!name) return;
    startTransition(async () => {
      await createMaterialGroup({ name, parentId: state.groupId === "all" ? null : state.groupId });
      setNewGroupName("");
      router.refresh();
    });
  };

  const handleValiditySubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validUntil || !selectedCount) return;
    startTransition(async () => {
      await updateAssetValidity(state.selectedIds, validUntil.replace("T", " "));
      setValidUntil("");
      dispatch({ type: "clearSelected" });
      router.refresh();
    });
  };

  return (
    <main>
      <section className="bg-white px-7 py-5">
        <p className="mb-2 text-sm text-slate-500">{breadcrumbPrefix} › {groupName}</p>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-bold">{groupName}</h1>
          <div className="flex flex-wrap justify-end gap-2">
            {mode === "recycle" ? (
              <>
                <button className="rounded-ui border border-slate-300 px-5 py-3 disabled:opacity-50" disabled={!selectedCount || isPending} onClick={() => runSelectedAction(batchRestoreAssets)} type="button">↩ 恢复选中</button>
                <button className="rounded-ui border border-slate-300 px-5 py-3 disabled:opacity-50" disabled={!selectedCount || isPending} onClick={() => runSelectedAction(batchHardDeleteAssets)} type="button">彻底删除</button>
              </>
            ) : (
              <>
                <button className="rounded-ui bg-brand px-5 py-3 font-semibold text-white" type="button">＋ 上传</button>
                <button className="rounded-ui border border-slate-300 px-5 py-3 disabled:opacity-50" disabled={!selectedCount || isPending} type="button">↗ 分享</button>
                <button className="rounded-ui border border-slate-300 px-5 py-3" type="button">☁ 网盘导入</button>
                <button className="rounded-ui border border-slate-300 px-5 py-3 disabled:opacity-50" disabled={!selectedCount || isPending} onClick={() => runSelectedAction(batchSoftDeleteAssets)} type="button">删除选中</button>
              </>
            )}
          </div>
        </div>
        {mode !== "recycle" ? (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <form className="flex items-center gap-2" onSubmit={handleCreateGroup}>
              <input className="h-10 rounded-ui border border-slate-300 px-3" onChange={(event) => setNewGroupName(event.target.value)} placeholder="新素材组名称" value={newGroupName} />
              <button className="h-10 rounded-ui border border-slate-300 px-4 disabled:opacity-50" disabled={!newGroupName.trim() || isPending} type="submit">＋ 新建素材组</button>
            </form>
            <form className="flex items-center gap-2" onSubmit={handleValiditySubmit}>
              <input className="h-10 rounded-ui border border-slate-300 px-3" onChange={(event) => setValidUntil(event.target.value)} type="datetime-local" value={validUntil} />
              <button className="h-10 rounded-ui border border-slate-300 px-4 disabled:opacity-50" disabled={!selectedCount || !validUntil || isPending} type="submit">更新失效时间</button>
            </form>
            {selectedCount ? <span className="text-sm text-slate-500">已选择 {selectedCount} 项</span> : null}
          </div>
        ) : selectedCount ? <p className="mt-4 text-sm text-slate-500">已选择 {selectedCount} 项</p> : null}
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
