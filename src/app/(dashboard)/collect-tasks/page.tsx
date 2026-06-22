import { createCollectTaskAction } from "@/app/actions/collect.actions";
import { createRepositories } from "@/lib/db/repositories/factory";
import { DataTable } from "@/components/layout/DataTable";
import { PageHeader } from "@/components/layout/PageHeader";
import type { DbCollectTask } from "@/lib/db/repositories/interfaces";

export default async function CollectTasksPage() {
  const { collect, groups } = createRepositories();
  const [rows, groupRows] = await Promise.all([collect.findTasks(), groups.findAll()]);
  return (
    <main>
      <PageHeader title="收集素材管理" eyebrow="全部 › 更多功能 › 收集素材管理" actions={<button className="rounded-ui border border-slate-300 px-4 py-2">新建收集任务</button>} />
      <section className="space-y-5 p-7">
        <form action={createCollectTaskAction} className="grid gap-4 rounded-ui border border-slate-200 bg-white p-5 md:grid-cols-3">
          <label className="text-sm font-medium text-slate-700">主题<input className="mt-2 w-full rounded-ui border border-slate-300 px-3 py-2" name="theme" placeholder="例如：经销商车展素材收集" /></label>
          <label className="text-sm font-medium text-slate-700">存放素材组<select className="mt-2 w-full rounded-ui border border-slate-300 px-3 py-2" name="group_id"><option value="">暂不指定</option>{groupRows.map((group) => <option key={group.id} value={group.id}>{group.name}</option>)}</select></label>
          <label className="text-sm font-medium text-slate-700">访问密码<input className="mt-2 w-full rounded-ui border border-slate-300 px-3 py-2" name="access_code" placeholder="留空自动生成" /></label>
          <label className="text-sm font-medium text-slate-700">失效时间<input className="mt-2 w-full rounded-ui border border-slate-300 px-3 py-2" name="expires_at" placeholder="2026-12-31 23:59" /></label>
          <label className="text-sm font-medium text-slate-700 md:col-span-2">说明<input className="mt-2 w-full rounded-ui border border-slate-300 px-3 py-2" name="description" placeholder="填写收集要求" /></label>
          <div className="flex flex-wrap gap-4 md:col-span-3">
            {["图片", "视频", "文档", "设计源文件", "表格", "压缩包"].map((type) => <label key={type} className="flex items-center gap-2 text-sm"><input name="allowed_file_types" type="checkbox" value={type} defaultChecked={["图片", "视频", "文档"].includes(type)} />{type}</label>)}
          </div>
          <div className="md:col-span-3"><button className="rounded-ui bg-brand px-5 py-2 font-semibold text-white" type="submit">创建收集任务</button></div>
        </form>
        <DataTable<DbCollectTask>
          rows={rows}
          emptyText="暂无收集任务"
          columns={[
            { key: "theme", title: "主题" },
            { key: "group_id", title: "素材组ID" },
            { key: "status", title: "状态" },
            { key: "access_code", title: "访问密码" },
            { key: "expires_at", title: "失效时间" },
            { key: "allowed_file_types", title: "允许类型", render: (row) => row.allowed_file_types.join("、") },
          ]}
        />
      </section>
    </main>
  );
}
