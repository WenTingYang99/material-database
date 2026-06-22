import { JsonDatabase } from "@/lib/db/json/JsonDatabase";
import { DataTable } from "@/components/layout/DataTable";
import { PageHeader } from "@/components/layout/PageHeader";

export default async function CollectTasksPage() {
  const db = await new JsonDatabase().read();
  return (
    <main>
      <PageHeader title="收集素材管理" eyebrow="全部 › 更多功能 › 收集素材管理" actions={<button className="rounded-ui border border-slate-300 px-4 py-2">新建收集任务</button>} />
      <section className="p-7">
        <DataTable
          rows={db.t_collect_task as Record<string, unknown>[]}
          emptyText="暂无收集任务"
          columns={[
            { key: "theme", title: "主题" },
            { key: "group_name", title: "存放素材组" },
            { key: "status", title: "状态" },
            { key: "access_code", title: "访问密码" },
            { key: "expires_at", title: "失效时间" },
          ]}
        />
      </section>
    </main>
  );
}
