import { createShareAction } from "@/app/actions/share.actions";
import { createRepositories } from "@/lib/db/repositories/factory";
import { DataTable } from "@/components/layout/DataTable";
import { PageHeader } from "@/components/layout/PageHeader";
import type { DbShareRecord } from "@/lib/db/repositories/interfaces";

export default async function SharesPage() {
  const { shares } = createRepositories();
  const rows = await shares.findAll();
  return (
    <main>
      <PageHeader title="分享记录" eyebrow="全部 › 更多功能 › 分享记录" />
      <section className="space-y-5 p-7">
        <form action={createShareAction} className="grid gap-4 rounded-ui border border-slate-200 bg-white p-5 md:grid-cols-4">
          <label className="text-sm font-medium text-slate-700">分享名称<input className="mt-2 w-full rounded-ui border border-slate-300 px-3 py-2" name="share_name" placeholder="例如：618素材包" /></label>
          <label className="text-sm font-medium text-slate-700">目标类型<select className="mt-2 w-full rounded-ui border border-slate-300 px-3 py-2" name="target_type"><option value="asset">单素材</option><option value="group">素材组</option><option value="basket">素材篮</option></select></label>
          <label className="text-sm font-medium text-slate-700">目标ID<input className="mt-2 w-full rounded-ui border border-slate-300 px-3 py-2" name="target_ids" placeholder="多个用逗号分隔" defaultValue="1" /></label>
          <label className="text-sm font-medium text-slate-700">访问范围<select className="mt-2 w-full rounded-ui border border-slate-300 px-3 py-2" name="access_level"><option value="internal">企业内部</option><option value="public">互联网免登录</option><option value="specified">指定成员</option></select></label>
          <label className="text-sm font-medium text-slate-700">访问密码<input className="mt-2 w-full rounded-ui border border-slate-300 px-3 py-2" name="password" /></label>
          <label className="text-sm font-medium text-slate-700">过期时间<input className="mt-2 w-full rounded-ui border border-slate-300 px-3 py-2" name="expires_at" placeholder="2026-12-31 23:59" /></label>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700"><input name="allow_download" type="checkbox" defaultChecked />允许下载</label>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700"><input name="include_attachment" type="checkbox" />包含附件</label>
          <div className="md:col-span-4"><button className="rounded-ui bg-brand px-5 py-2 font-semibold text-white" type="submit">生成分享链接</button></div>
        </form>
        <DataTable<DbShareRecord>
          rows={rows}
          emptyText="暂无分享记录"
          columns={[
            { key: "share_name", title: "分享名称" },
            { key: "target_type", title: "分享类型" },
            { key: "share_link", title: "链接" },
            { key: "expires_at", title: "过期时间" },
            { key: "status", title: "状态" },
            { key: "view_count", title: "浏览" },
            { key: "download_count", title: "下载" },
          ]}
        />
      </section>
    </main>
  );
}
