"use client";

import { ChangeEvent, FormEvent, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Asset, AssetStatus } from "@/lib/types/asset";
import type { MaterialGroup } from "@/lib/types/group";
import { useAppState } from "@/context/AppContext";
import { AssetToolbar } from "@/components/filters/AssetToolbar";
import { AssetCard } from "@/components/assets/AssetCard";
import { batchRestoreAssets, batchSoftDeleteAssets, createMaterialGroup, deleteMaterialGroup, shareAssetsAction, updateAssetAction, updateAssetValidity, updateMaterialGroup, uploadAssetsAction } from "@/app/actions/asset.actions";
import { formatBytes } from "@/lib/utils/format";

type WorkspaceMode = "normal" | "recycle";

export function AssetWorkspace({
  initialAssets,
  initialTotal,
  groups,
  title = "全部素材",
  breadcrumbPrefix = "全部",
  mode = "normal",
}: {
  initialAssets: Asset[];
  initialTotal: number;
  groups: MaterialGroup[];
  title?: string;
  breadcrumbPrefix?: string;
  status?: AssetStatus;
  mode?: WorkspaceMode;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [newGroupName, setNewGroupName] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [basketOpen, setBasketOpen] = useState(false);
  const [viewerAssetId, setViewerAssetId] = useState<string | null>(null);
  const [editingAssetId, setEditingAssetId] = useState<string | null>(null);
  const [viewerZoom, setViewerZoom] = useState(100);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { state, dispatch } = useAppState();

  const assets = useMemo(() => {
    let items = [...initialAssets];
    if (state.groupId !== "all") items = items.filter((asset) => asset.groupId === state.groupId);
    if (state.query.trim()) {
      const query = state.query.trim().toLowerCase();
      items = items.filter((asset) => `${asset.name} ${asset.format} ${asset.brand || ""} ${asset.model || ""} ${(asset.customTags || []).join(" ")} ${(asset.aiTags || []).join(" ")}`.toLowerCase().includes(query));
    }
    Object.entries(state.filters).forEach(([label, values]) => {
      items = items.filter((asset) => matchFilter(asset, label, values));
    });
    if (state.similarAssetId) {
      const base = initialAssets.find((asset) => asset.id === state.similarAssetId);
      if (base) items = items.filter((asset) => asset.id !== base.id && calculateSimilarity(base, asset) > 0).sort((a, b) => calculateSimilarity(base, b) - calculateSimilarity(base, a));
    }
    if (state.sort === "文件大小") items.sort((a, b) => b.sizeBytes - a.sizeBytes);
    if (state.sort === "素材名称") items.sort((a, b) => a.name.localeCompare(b.name, "zh-CN"));
    if (state.sort === "上传日期" || state.sort === "创建时间") items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return items;
  }, [initialAssets, state.filters, state.groupId, state.query, state.similarAssetId, state.sort]);

  const groupName = state.groupId === "all" ? title : groups.find((group) => group.id === state.groupId)?.name || title;
  const selectedCount = state.selectedIds.length;
  const basketAssets = assets.filter((asset) => state.selectedIds.includes(asset.id));
  const viewerAsset = viewerAssetId ? assets.find((asset) => asset.id === viewerAssetId) || null : null;
  const editingAsset = editingAssetId ? assets.find((asset) => asset.id === editingAssetId) || null : null;
  const viewerIndex = viewerAsset ? assets.findIndex((asset) => asset.id === viewerAsset.id) : -1;

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
    updateSelectedValidity();
  };

  const updateSelectedValidity = () => {
    if (!validUntil || !selectedCount) return;
    startTransition(async () => {
      await updateAssetValidity(state.selectedIds, validUntil.replace("T", " "));
      setValidUntil("");
      router.refresh();
    });
  };

  const handleUploadChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    formData.set("groupId", state.groupId === "all" ? "" : state.groupId);
    startTransition(async () => {
      await uploadAssetsAction(formData);
      event.target.value = "";
      router.refresh();
    });
  };

  const openViewer = (asset: Asset) => {
    setViewerAssetId(asset.id);
    setViewerZoom(100);
  };

  const closeViewer = () => {
    setViewerAssetId(null);
    setViewerZoom(100);
  };

  const changeViewerAsset = (offset: number) => {
    const next = assets[viewerIndex + offset];
    if (!next) return;
    setViewerAssetId(next.id);
    setViewerZoom(100);
  };

  const handleEditSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      await updateAssetAction(formData);
      setEditingAssetId(null);
      router.refresh();
    });
  };

  const handleShareSelected = () => {
    if (!state.selectedIds.length) return;
    startTransition(async () => {
      await shareAssetsAction(state.selectedIds);
      router.refresh();
    });
  };

  const handleUpdateCurrentGroup = () => {
    if (state.groupId === "all") return;
    const current = groups.find((group) => group.id === state.groupId);
    if (!current) return;
    const name = window.prompt("素材组名称", current.name)?.trim();
    if (!name) return;
    const parentId = window.prompt("父级素材组ID，留空为一级", current.parentId || "") || null;
    startTransition(async () => {
      await updateMaterialGroup({ id: current.id, name, parentId });
      router.refresh();
    });
  };

  const handleDeleteCurrentGroup = () => {
    if (state.groupId === "all") return;
    if (!window.confirm("删除素材组会将组内素材移入回收站，确认继续？")) return;
    startTransition(async () => {
      await deleteMaterialGroup(state.groupId);
      dispatch({ type: "setGroup", groupId: "all" });
      router.refresh();
    });
  };

  return (
    <main>
      <section className="bg-white px-7 py-5">
        <p className="mb-2 text-sm text-slate-500">{breadcrumbPrefix} - {groupName}</p>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-bold">{groupName}</h1>
          <div className="flex flex-wrap justify-end gap-2">
            {mode === "recycle" ? (
              <button className="rounded-ui border border-slate-300 px-5 py-3 disabled:opacity-50" disabled={!selectedCount || isPending} onClick={() => runSelectedAction(batchRestoreAssets)} type="button">恢复选中</button>
            ) : (
              <>
                <input ref={fileInputRef} className="hidden" multiple onChange={handleUploadChange} type="file" />
                <button className="rounded-ui bg-brand px-5 py-3 font-semibold text-white" disabled={isPending} onClick={() => fileInputRef.current?.click()} type="button">上传</button>
                <button className={`rounded-ui border border-slate-300 px-5 py-3 ${selectedCount ? "text-brand" : ""}`} onClick={() => setBasketOpen(true)} type="button">素材篮（{selectedCount}）</button>
                <button className="rounded-ui border border-slate-300 px-5 py-3 disabled:opacity-50" disabled={!selectedCount || isPending} onClick={handleShareSelected} type="button">分享</button>
                <button className="rounded-ui border border-slate-300 px-5 py-3 disabled:opacity-50" disabled={!selectedCount || isPending} onClick={() => runSelectedAction(batchSoftDeleteAssets)} type="button">删除</button>
              </>
            )}
          </div>
        </div>
        {mode !== "recycle" ? (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <form className="flex items-center gap-2" onSubmit={handleCreateGroup}>
              <input className="h-10 rounded-ui border border-slate-300 px-3" onChange={(event) => setNewGroupName(event.target.value)} placeholder="新素材组名称" value={newGroupName} />
              <button className="h-10 rounded-ui border border-slate-300 px-4 disabled:opacity-50" disabled={!newGroupName.trim() || isPending} type="submit">新建素材组</button>
            </form>
            <form className="flex items-center gap-2" onSubmit={handleValiditySubmit}>
              <input className="h-10 rounded-ui border border-slate-300 px-3" onChange={(event) => setValidUntil(event.target.value)} type="datetime-local" value={validUntil} />
              <button className="h-10 rounded-ui border border-slate-300 px-4 disabled:opacity-50" disabled={!selectedCount || !validUntil || isPending} type="submit">更新失效时间</button>
            </form>
            {selectedCount ? <span className="text-sm text-slate-500">已选择 {selectedCount} 项</span> : null}
            {state.groupId !== "all" ? <button className="h-10 rounded-ui border border-slate-300 px-4" onClick={handleUpdateCurrentGroup} type="button">编辑当前素材组</button> : null}
            {state.groupId !== "all" ? <button className="h-10 rounded-ui border border-slate-300 px-4" onClick={handleDeleteCurrentGroup} type="button">删除当前素材组</button> : null}
            {state.similarAssetId ? <button className="h-10 rounded-ui border border-slate-300 px-4" onClick={() => dispatch({ type: "setSimilarAsset", id: null })} type="button">退出相似结果</button> : null}
          </div>
        ) : selectedCount ? <p className="mt-4 text-sm text-slate-500">已选择 {selectedCount} 项</p> : null}
      </section>

      <AssetToolbar assets={initialAssets} total={state.groupId === "all" && !Object.keys(state.filters).length ? initialTotal : assets.length} />
      <section className="p-7">
        {state.view === "list" ? (
          <div className="overflow-hidden rounded-ui border border-slate-200 bg-white">
            {assets.map((asset) => (
              <button key={asset.id} className="grid w-full grid-cols-[80px_1fr_120px_120px_120px] items-center gap-4 border-b border-slate-100 px-4 py-3 text-left last:border-b-0" onClick={() => openViewer(asset)} type="button">
                <img alt={asset.name} className="h-14 w-20 rounded-ui object-cover" src={`/${asset.src}`} />
                <span className="font-semibold">{asset.name}</span>
                <span>{asset.format}</span>
                <span>{formatBytes(asset.sizeBytes)}</span>
                <span>{asset.validUntil || "-"}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-5">
            {assets.map((asset) => <AssetCard key={asset.id} asset={asset} onOpen={openViewer} />)}
          </div>
        )}
        {!assets.length ? <div className="py-28 text-center text-slate-400">暂无素材</div> : null}
      </section>

      {basketOpen ? (
        <>
          <div className="basket-overlay" onClick={() => setBasketOpen(false)} />
          <aside className="basket-drawer" aria-label="素材篮">
            <header>
              <div>
                <h2>素材篮</h2>
                <p>已选择 {basketAssets.length} 项素材</p>
              </div>
              <button className="plain-icon" onClick={() => setBasketOpen(false)} type="button" aria-label="关闭素材篮">×</button>
            </header>
            <div className="basket-list">
              {basketAssets.length ? basketAssets.map((asset) => (
                <article className="basket-item" data-asset-id={asset.id} key={asset.id}>
                  <div className="basket-thumb"><img alt={asset.name} src={`/${asset.src}`} /></div>
                  <div>
                    <strong title={asset.name}>{asset.name}</strong>
                    <span>{asset.format || "-"} · {formatBytes(asset.sizeBytes)}</span>
                    <small>有效期：{asset.validUntil || "永久有效"}</small>
                  </div>
                  <button onClick={() => dispatch({ type: "toggleSelected", id: asset.id })} title="移出素材篮" type="button">×</button>
                </article>
              )) : <div className="basket-empty">暂无已选素材</div>}
            </div>
            <footer>
              <button disabled={!basketAssets.length} onClick={() => dispatch({ type: "clearSelected" })} type="button">清空素材篮</button>
              <button disabled={!basketAssets.length || isPending} onClick={() => runSelectedAction(batchSoftDeleteAssets)} type="button">删除素材</button>
              <button disabled={!basketAssets.length || !validUntil || isPending} onClick={updateSelectedValidity} type="button">修改有效期</button>
              <button disabled={!basketAssets.length || isPending} onClick={handleShareSelected} type="button">分享</button>
              <button className="primary" disabled type="button">批量下载</button>
            </footer>
          </aside>
        </>
      ) : null}

      {viewerAsset ? (
        <div className="fixed inset-0 z-50 flex bg-slate-950/80 text-white">
          <div className="flex min-w-0 flex-1 flex-col">
            <header className="flex h-16 items-center justify-between border-b border-white/10 px-6">
              <strong className="truncate text-lg">{viewerAsset.name}</strong>
              <div className="flex items-center gap-2">
                <button className="rounded-ui border border-white/30 px-3 py-2 disabled:opacity-40" disabled={viewerIndex <= 0} onClick={() => changeViewerAsset(-1)} type="button">上一张</button>
                <button className="rounded-ui border border-white/30 px-3 py-2 disabled:opacity-40" disabled={viewerIndex < 0 || viewerIndex >= assets.length - 1} onClick={() => changeViewerAsset(1)} type="button">下一张</button>
                <button className="rounded-ui border border-white/30 px-3 py-2" onClick={() => setViewerZoom((value) => Math.max(50, value - 25))} type="button">-</button>
                <span className="w-16 text-center text-sm">{viewerZoom}%</span>
                <button className="rounded-ui border border-white/30 px-3 py-2" onClick={() => setViewerZoom((value) => Math.min(200, value + 25))} type="button">+</button>
                <button className="rounded-ui border border-white/30 px-3 py-2" onClick={closeViewer} type="button">关闭</button>
              </div>
            </header>
            <div className="grid min-h-0 flex-1 place-items-center overflow-auto p-8">
              {viewerAsset.mime.startsWith("video/") ? (
                <video className="max-h-full max-w-full" controls src={`/${viewerAsset.src}`} />
              ) : viewerAsset.mime.startsWith("image/") || viewerAsset.type === "图片" ? (
                <img alt={viewerAsset.name} className="max-h-full max-w-full object-contain transition-transform" src={`/${viewerAsset.src}`} style={{ transform: `scale(${viewerZoom / 100})` }} />
              ) : (
                <div className="rounded-ui bg-white p-8 text-center text-slate-900">
                  <strong className="block text-xl">{viewerAsset.format}</strong>
                  <span className="mt-2 block text-slate-500">该文件类型暂不支持在线预览</span>
                </div>
              )}
            </div>
          </div>
          <aside className="w-[360px] shrink-0 overflow-auto border-l border-white/10 bg-white p-6 text-slate-900">
            <div className="flex items-center justify-between gap-3">
              <h2 className="min-w-0 truncate text-xl font-bold">{viewerAsset.name}</h2>
              <button className="shrink-0 rounded-ui border border-slate-300 px-3 py-2 text-sm" onClick={() => setEditingAssetId(viewerAsset.id)} type="button">编辑信息</button>
            </div>
            <div className="mt-5 space-y-3 text-sm">
              <p><span className="text-slate-500">格式：</span>{viewerAsset.format}</p>
              <p><span className="text-slate-500">大小：</span>{formatBytes(viewerAsset.sizeBytes)}</p>
              <p><span className="text-slate-500">尺寸：</span>{viewerAsset.width || "-"} x {viewerAsset.height || "-"}</p>
              <p><span className="text-slate-500">品牌：</span>{viewerAsset.brand || "-"}</p>
              <p><span className="text-slate-500">车型：</span>{viewerAsset.model || "-"}</p>
              <p><span className="text-slate-500">权限：</span>{viewerAsset.permission || "-"}</p>
              <p><span className="text-slate-500">失效时间：</span>{viewerAsset.validUntil || "永久有效"}</p>
              <p><span className="text-slate-500">业务标签：</span>{viewerAsset.customTags.join("、") || "-"}</p>
              <p><span className="text-slate-500">AI标签：</span>{viewerAsset.aiTags.join("、") || "-"}</p>
              <p><span className="text-slate-500">日志：</span>{viewerAsset.logs.slice(0, 5).join("；") || "-"}</p>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <button className="rounded-ui border border-slate-300 px-3 py-2 text-sm" onClick={() => dispatch({ type: "setSimilarAsset", id: viewerAsset.id })} type="button">查找相似素材</button>
              <button className="rounded-ui border border-slate-300 px-3 py-2 text-sm" onClick={() => { if (!state.selectedIds.includes(viewerAsset.id)) dispatch({ type: "toggleSelected", id: viewerAsset.id }); setBasketOpen(true); }} type="button">加入素材篮</button>
            </div>
          </aside>
        </div>
      ) : null}

      {editingAsset ? (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/60 p-6">
          <form className="w-full max-w-2xl rounded-ui bg-white p-6 text-slate-900 shadow-xl" onSubmit={handleEditSubmit}>
            <input name="assetId" type="hidden" value={editingAsset.id} />
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-bold">编辑素材信息</h2>
              <button className="rounded-ui border border-slate-300 px-3 py-2" onClick={() => setEditingAssetId(null)} type="button">关闭</button>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="text-sm font-medium text-slate-700">素材名称<input className="mt-2 w-full rounded-ui border border-slate-300 px-3 py-2" defaultValue={editingAsset.name} name="name" required /></label>
              <label className="text-sm font-medium text-slate-700">素材组<select className="mt-2 w-full rounded-ui border border-slate-300 px-3 py-2" defaultValue={editingAsset.groupId || ""} name="groupId"><option value="">不指定</option>{groups.filter((group) => !group.system).map((group) => <option key={group.id} value={group.id}>{group.name}</option>)}</select></label>
              <label className="text-sm font-medium text-slate-700">品牌<input className="mt-2 w-full rounded-ui border border-slate-300 px-3 py-2" defaultValue={editingAsset.brand || ""} name="brand" /></label>
              <label className="text-sm font-medium text-slate-700">车型<input className="mt-2 w-full rounded-ui border border-slate-300 px-3 py-2" defaultValue={editingAsset.model || ""} name="model" /></label>
              <label className="text-sm font-medium text-slate-700">生效时间<input className="mt-2 w-full rounded-ui border border-slate-300 px-3 py-2" defaultValue={toDateTimeInputValue(editingAsset.validStart)} name="validStart" type="datetime-local" /></label>
              <label className="text-sm font-medium text-slate-700">失效时间<input className="mt-2 w-full rounded-ui border border-slate-300 px-3 py-2" defaultValue={toDateTimeInputValue(editingAsset.validUntil)} name="validUntil" type="datetime-local" /></label>
              <label className="text-sm font-medium text-slate-700 md:col-span-2">业务标签<input className="mt-2 w-full rounded-ui border border-slate-300 px-3 py-2" defaultValue={editingAsset.customTags.join("、")} name="customTags" /></label>
              <label className="text-sm font-medium text-slate-700 md:col-span-2">权限<input className="mt-2 w-full rounded-ui border border-slate-300 px-3 py-2" defaultValue={editingAsset.permission || ""} name="permission" /></label>
              <label className="text-sm font-medium text-slate-700 md:col-span-2">描述<textarea className="mt-2 min-h-24 w-full rounded-ui border border-slate-300 px-3 py-2" defaultValue={editingAsset.desc || ""} name="desc" /></label>
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button className="rounded-ui border border-slate-300 px-5 py-2" onClick={() => setEditingAssetId(null)} type="button">取消</button>
              <button className="rounded-ui bg-brand px-5 py-2 font-semibold text-white disabled:opacity-50" disabled={isPending} type="submit">保存</button>
            </div>
          </form>
        </div>
      ) : null}
    </main>
  );
}

function toDateTimeInputValue(value?: string) {
  if (!value) return "";
  return value.replace(" ", "T").slice(0, 16);
}

function matchFilter(asset: Asset, label: string, values: string[]) {
  if (!values.length) return true;
  if (label === "素材失效日") return values.some((value) => matchValidityFilter(asset, value));
  const haystack: Record<string, string[]> = {
    "素材来源": ["本地上传", "素材库"],
    "文件格式": [asset.format],
    "车型": [asset.model || ""],
    "品牌": [asset.brand || ""],
    "权限范围": [asset.permission || ""],
    "业务标签": asset.customTags || [],
    "AI标签": asset.aiTags || [],
  };
  return values.some((value) => (haystack[label] || []).some((item) => String(item).includes(value)));
}

function matchValidityFilter(asset: Asset, value: string) {
  if (value === "永久有效") return !asset.validUntil || asset.validUntil.startsWith("212");
  const expire = parseDate(asset.validUntilDate || asset.validUntil);
  if (!expire) return false;
  const days = Math.ceil((expire.getTime() - Date.now()) / 86400000);
  if (value === "30天内") return days >= 0 && days <= 30;
  if (value === "90天内") return days >= 0 && days <= 90;
  return false;
}

function parseDate(value?: string) {
  if (!value) return null;
  const date = new Date(value.replace(" ", "T"));
  return Number.isNaN(date.getTime()) ? null : date;
}

function calculateSimilarity(base: Asset, target: Asset) {
  let score = 0;
  score += base.aiTags.filter((tag) => target.aiTags.includes(tag)).length * 30;
  score += base.customTags.filter((tag) => target.customTags.includes(tag)).length * 20;
  if (base.brand && base.brand === target.brand) score += 15;
  if (base.model && base.model === target.model) score += 10;
  if (base.format === target.format) score += 5;
  return score;
}
