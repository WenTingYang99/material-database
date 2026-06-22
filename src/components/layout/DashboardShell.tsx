"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MaterialGroup } from "@/lib/types/group";
import type { SessionUser } from "@/lib/types/user";
import { useAppState } from "@/context/AppContext";

export function DashboardShell({ children, groups, user }: { children: React.ReactNode; groups: MaterialGroup[]; user: SessionUser }) {
  const { state, dispatch } = useAppState();
  const pathname = usePathname();
  const navItems = [
    { href: "/", icon: "▦", label: "全部素材" },
    { href: "/pending", icon: "▣", label: "待入库" },
    { href: "/created", icon: "♙", label: "我创建的组" },
  ];
  const manageItems = [
    { href: "/activity", label: "用户动态" },
    { href: "/tags", label: "标签管理" },
    { href: "/validity", label: "有效期管理" },
    { href: "/collect-tasks", label: "收集素材" },
    { href: "/shares", label: "分享记录" },
    { href: "/recycle", label: "回收站" },
  ];
  return (
    <div className="next-shell flex min-h-screen bg-slate-100 text-slate-900">
      <aside className="w-[248px] shrink-0 border-r border-slate-200 bg-white">
        <div className="flex h-[90px] items-center gap-4 bg-[#2c3f50] px-5 text-white">
          <div className="grid grid-cols-3 gap-1" aria-hidden>
            {Array.from({ length: 9 }).map((_, index) => <span key={index} className="h-1.5 w-1.5 rounded-full bg-white" />)}
          </div>
          <div className="rounded-ui bg-red-600 px-3 py-2 font-bold">DPCA</div>
          <strong className="text-2xl">素材库</strong>
        </div>
        <nav className="border-b border-slate-200 py-4">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} className={`flex w-full items-center gap-3 border-l-4 px-6 py-3 ${active ? "border-brand bg-teal-50 font-semibold text-brand" : "border-transparent text-slate-700"}`} href={item.href}>
                <span>{item.icon}</span>{item.label}
              </Link>
            );
          })}
          <div className="mt-2 px-6 py-2 text-sm font-semibold text-slate-400">更多功能</div>
          {manageItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} className={`flex w-full items-center gap-3 border-l-4 px-6 py-2.5 ${active ? "border-brand bg-teal-50 font-semibold text-brand" : "border-transparent text-slate-700"}`} href={item.href}>
                <span>...</span>{item.label}
              </Link>
            );
          })}
        </nav>
        <section className="px-5 py-4">
          <div className="mb-4 flex items-center justify-between font-bold">
            <span>全部素材组</span>
            <span className="text-xl">＋</span>
          </div>
          <div className="space-y-1">
            {groups.filter((group) => !group.system).map((group) => (
              <button
                key={group.id}
                className={`flex w-full items-center justify-between rounded-ui px-3 py-2 text-left ${state.groupId === group.id ? "bg-teal-50 text-brand" : "text-slate-700"}`}
                style={{ paddingLeft: `${12 + (group.depth || 0) * 18}px` }}
                type="button"
                onClick={() => dispatch({ type: "setGroup", groupId: group.id })}
              >
                <span className="truncate">□ {group.name}</span>
                <span className="text-sm text-slate-400">{group.count || ""}</span>
              </button>
            ))}
          </div>
        </section>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="flex h-[90px] items-center gap-6 bg-[#2c3f50] px-7 text-white">
          <div className="relative max-w-2xl flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">⌕</span>
            <input className="h-12 w-full rounded-ui border-0 bg-white px-11 text-slate-900" onChange={(event) => dispatch({ type: "setQuery", query: event.target.value })} placeholder="试试在搜索词中增加文件格式，如：手册pdf" value={state.query} />
          </div>
          <span className="rounded-full border border-white/30 px-3 py-2">深</span>
          <span>⌂</span>
          <span>♢</span>
          <span>中</span>
          <span className="rounded-full bg-white/90 px-4 py-3 text-slate-500">{user.name.slice(0, 1)}</span>
        </header>
        {children}
      </div>
    </div>
  );
}
