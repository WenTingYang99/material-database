import { createRepositories } from "@/lib/db/repositories/factory";
import { DataTable } from "@/components/layout/DataTable";
import { PageHeader } from "@/components/layout/PageHeader";
import type { Asset } from "@/lib/types/asset";

function getValidity(asset: Asset) {
  if (!asset.validUntil) return "永久有效";
  const time = new Date(asset.validUntil.replace(" ", "T")).getTime();
  if (Number.isNaN(time)) return "未知";
  const diff = time - Date.now();
  if (diff < 0) return "已过期";
  if (diff <= 30 * 24 * 60 * 60 * 1000) return "30天内到期";
  if (diff <= 90 * 24 * 60 * 60 * 1000) return "90天内到期";
  return "生效中";
}

export default async function ValidityPage() {
  const { assets } = createRepositories();
  const result = await assets.findAll({ status: "active", sortBy: "创建时间" });
  return (
    <main>
      <PageHeader title="有效期管理" eyebrow="全部 › 更多功能 › 有效期管理" />
      <section className="p-7">
        <DataTable<Asset>
          rows={result.items}
          columns={[
            { key: "name", title: "素材名称" },
            { key: "validStart", title: "生效时间" },
            { key: "validUntil", title: "失效时间" },
            { key: "status", title: "有效期状态", render: getValidity },
            { key: "owner", title: "所有者" },
          ]}
        />
      </section>
    </main>
  );
}
