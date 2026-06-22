"use client";

import { useAppState } from "@/context/AppContext";

export function AssetToolbar({ total }: { total: number }) {
  const { state, dispatch } = useAppState();
  return (
    <div className="border-y border-slate-200 bg-white px-7 py-5">
      <div className="mb-5 flex flex-wrap items-center gap-8 text-lg">
        {["素材来源", "文件格式", "车型", "品牌", "权限范围", "业务标签", "AI标签", "素材失效日"].map((item) => (
          <button key={item} className="flex items-center gap-2" type="button">{item}<span className="text-slate-500">⌄</span></button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <div className="h-2 w-32 rounded-full bg-slate-700"><div className="h-2 w-20 rounded-full bg-brand" /></div>
        <label className="flex items-center gap-2 text-slate-700"><input type="checkbox" />显示全部素材组和素材</label>
        <button className="rounded-ui border border-slate-300 px-4 py-2" type="button">⚙ 筛选配置</button>
        <div className="inline-flex rounded-ui border border-slate-300">
          <button className={`px-4 py-2 ${state.view === "compact" ? "bg-teal-50 text-brand" : ""}`} onClick={() => dispatch({ type: "setView", view: "compact" })} type="button">▦</button>
          <button className={`px-4 py-2 ${state.view === "list" ? "bg-teal-50 text-brand" : ""}`} onClick={() => dispatch({ type: "setView", view: "list" })} type="button">☷</button>
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
