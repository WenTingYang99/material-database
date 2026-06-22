import { JsonDatabase } from "@/lib/db/json/JsonDatabase";
import { DataTable } from "@/components/layout/DataTable";
import { PageHeader } from "@/components/layout/PageHeader";

export default async function SharesPage() {
  const db = await new JsonDatabase().read();
  return (
    <main>
      <PageHeader title="分享记录" eyebrow="全部 › 更多功能 › 分享记录" />
      <section className="p-7">
        <DataTable
          rows={db.t_share_record as Record<string, unknown>[]}
          emptyText="暂无分享记录"
          columns={[
            { key: "name", title: "分享名称" },
            { key: "target_type", title: "分享类型" },
            { key: "share_link", title: "链接" },
            { key: "expires_at", title: "过期时间" },
            { key: "status", title: "状态" },
          ]}
        />
      </section>
    </main>
  );
}
