import { JsonDatabase } from "@/lib/db/json/JsonDatabase";
import { DataTable } from "@/components/layout/DataTable";
import { PageHeader } from "@/components/layout/PageHeader";

export default async function ActivityPage() {
  const db = await new JsonDatabase().read();
  const employees = new Map(db.t_employee.map((user) => [user.EMPLOYEE_ID, user.ACTUAL_NAME]));
  const assets = new Map(db.t_asset.map((asset) => [asset.asset_id, asset.name]));
  const rows = db.t_asset_operation_log
    .map((log) => ({ ...log, userName: log.user_id ? employees.get(log.user_id) || "-" : "-", assetName: log.asset_id ? assets.get(log.asset_id) || "-" : "-" }))
    .sort((a, b) => b.create_time.localeCompare(a.create_time));
  return (
    <main>
      <PageHeader title="用户动态" eyebrow="全部 › 更多功能 › 用户动态" />
      <section className="p-7">
        <DataTable
          rows={rows}
          columns={[
            { key: "create_time", title: "时间" },
            { key: "userName", title: "用户" },
            { key: "action", title: "动作" },
            { key: "assetName", title: "素材" },
            { key: "message", title: "日志内容" },
          ]}
        />
      </section>
    </main>
  );
}
