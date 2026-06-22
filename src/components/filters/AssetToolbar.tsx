"use client";

import { useMemo, useState } from "react";
import { useAppState } from "@/context/AppContext";
import type { Asset } from "@/lib/types/asset";

const filterLabels = ["素材来源", "文件格式", "车型", "品牌", "权限范围", "业务标签", "AI标签", "素材失效日"];

export function AssetToolbar({ assets, total }: { assets: Asset[]; total: number }) {
  const { state, dispatch } = useAppState();
  const [openFilter, setOpenFilter] = useState<string | null>(null);
  const valuesByLabel = useMemo(() => getFilterValues(assets), [assets]);
  return (
    <div className="border-y border-slate-200 bg-white px-7 py-5">
      <div className="mb-5 flex flex-wrap items-center gap-8 text-lg">
        {filterLabels.map((item) => (
          <span key={item} className="relative">
            <button className="flex items-center gap-2" onClick={() => setOpenFilter(openFilter === item ? null : item)} type="button">
              {item}{state.filters[item]?.length ? `(${state.filters[item].length})` : ""}<span className="text-slate-500">▾</span>
            </button>
            {openFilter === item ? (
              <div className="absolute left-0 top-full z-40 mt-2 min-w-44 rounded-ui border border-slate-200 bg-white p-2 text-base shadow-lg">
                <button className={`block w-full rounded px-3 py-2 text-left ${state.filters[item]?.length ? "" : "bg-teal-50 text-brand"}`} onClick={() => dispatch({ type: "clearFilter", label: item })} type="button">全部</button>
                {(valuesByLabel[item] || []).map((value) => {
                  const active = state.filters[item]?.includes(value);
                  return <button key={value} className={`block w-full rounded px-3 py-2 text-left ${active ? "bg-teal-50 text-brand" : ""}`} onClick={() => dispatch({ type: "toggleFilter", label: item, value })} type="button">{active ? "✓ " : ""}{value}</button>;
                })}
              </div>
            ) : null}
          </span>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <div className="h-2 w-32 rounded-full bg-slate-700"><div className="h-2 w-20 rounded-full bg-brand" /></div>
        <label className="flex items-center gap-2 text-slate-700"><input type="checkbox" />显示全部素材组和素材</label>
        <button className="rounded-ui border border-slate-300 px-4 py-2" type="button">筛选配置</button>
        <div className="inline-flex rounded-ui border border-slate-300">
          <button className={`px-4 py-2 ${state.view === "compact" ? "bg-teal-50 text-brand" : ""}`} onClick={() => dispatch({ type: "setView", view: "compact" })} type="button">卡片</button>
          <button className={`px-4 py-2 ${state.view === "list" ? "bg-teal-50 text-brand" : ""}`} onClick={() => dispatch({ type: "setView", view: "list" })} type="button">列表</button>
        </div>
        <select className="rounded-ui border border-slate-300 px-4 py-2" value={state.sort} onChange={(event) => dispatch({ type: "setSort", sort: event.target.value })}>
          <option>素材热度</option>
          <option>上传日期</option>
          <option>创建时间</option>
          <option>素材名称</option>
          <option>文件大小</option>
        </select>
        <span className="ml-auto text-xl font-semibold">共 {total} 项</span>
      </div>
    </div>
  );
}

function getFilterValues(assets: Asset[]): Record<string, string[]> {
  return {
    "素材来源": ["本地上传", "素材库"],
    "文件格式": unique(assets.map((asset) => asset.format)),
    "车型": unique(assets.map((asset) => asset.model || "")),
    "品牌": unique(assets.map((asset) => asset.brand || "")),
    "权限范围": unique(assets.map((asset) => asset.permission || "")),
    "业务标签": unique(assets.flatMap((asset) => asset.customTags || [])),
    "AI标签": unique(assets.flatMap((asset) => asset.aiTags || [])),
    "素材失效日": ["永久有效", "30天内", "90天内"],
  };
}

function unique(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))].slice(0, 24);
}
