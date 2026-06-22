"use client";

import type { Asset } from "@/lib/types/asset";
import { useAppState } from "@/context/AppContext";
import { formatBytes } from "@/lib/utils/format";

export function AssetCard({ asset, onOpen }: { asset: Asset; onOpen?: (asset: Asset) => void }) {
  const { state, dispatch } = useAppState();
  const selected = state.selectedIds.includes(asset.id);
  return (
    <article className={`rounded-ui border bg-white p-3 shadow-sm ${selected ? "border-brand ring-1 ring-brand" : "border-slate-200"}`}>
      <div className="relative aspect-[4/3] overflow-hidden rounded-ui bg-[linear-gradient(45deg,#f8fafc_25%,transparent_25%),linear-gradient(-45deg,#f8fafc_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f8fafc_75%),linear-gradient(-45deg,transparent_75%,#f8fafc_75%)] bg-[length:20px_20px]" onClick={() => onOpen?.(asset)} role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter") onOpen?.(asset); }}>
        <input
          checked={selected}
          className="absolute left-3 top-3 z-10 h-5 w-5"
          onChange={() => dispatch({ type: "toggleSelected", id: asset.id })}
          onClick={(event) => event.stopPropagation()}
          type="checkbox"
        />
        <img alt={asset.name} className="h-full w-full object-cover" src={`/${asset.src}`} />
        <div className="absolute bottom-3 left-3 flex gap-2 text-sm font-semibold text-white">
          <span className="rounded bg-slate-900/70 px-2 py-1">{asset.format}</span>
          <span className="rounded bg-slate-900/70 px-2 py-1">{formatBytes(asset.sizeBytes)}</span>
        </div>
      </div>
      <h2 className="mt-4 line-clamp-2 min-h-14 text-lg font-bold leading-7">{asset.name}</h2>
      <div className="mt-2 flex gap-4 text-sm text-slate-500">
        <span>⌘ {asset.share}</span>
        <span>↓ {asset.download}</span>
        <span>⊙ {asset.view}</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {[asset.format, formatBytes(asset.sizeBytes), ...(asset.customTags || []).slice(0, 1)].map((tag) => (
          <span key={tag} className="max-w-[90px] truncate rounded border border-slate-200 px-2 py-1 text-sm text-slate-600">{tag}</span>
        ))}
      </div>
    </article>
  );
}
