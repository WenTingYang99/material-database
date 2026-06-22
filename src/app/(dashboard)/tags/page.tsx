import { createRepositories } from "@/lib/db/repositories/factory";
import { DataTable } from "@/components/layout/DataTable";
import { PageHeader } from "@/components/layout/PageHeader";
import type { Tag } from "@/lib/types/tag";

export default async function TagsPage() {
  const { tags } = createRepositories();
  const rows = await tags.findAll();
  const businessCount = rows.filter((tag) => tag.tagType === 1).length;
  const aiCount = rows.filter((tag) => tag.tagType === 2).length;
  return (
    <main>
      <PageHeader
        title="标签管理"
        eyebrow={`全部 › 更多功能 › 标签管理 · 业务标签 ${businessCount} 个 · AI标签 ${aiCount} 个`}
        actions={<><button className="rounded-ui border border-slate-300 px-4 py-2">＋ 新增标签</button><button className="rounded-ui border border-slate-300 px-4 py-2">标签合并</button></>}
      />
      <section className="p-7">
        <DataTable<Tag>
          rows={rows}
          columns={[
            { key: "tagName", title: "标签名称" },
            { key: "tagCode", title: "标签编码" },
            { key: "tagType", title: "标签类型", render: (row) => row.tagType === 2 ? "AI标签" : "业务标签" },
            { key: "aiSource", title: "AI来源", render: (row) => row.tagType === 1 ? "-" : row.aiSource === 1 ? "AI自动识别" : "业务预定义" },
            { key: "status", title: "状态", render: (row) => row.status === 1 ? "启用" : "停用" },
            { key: "updatedAt", title: "更新时间" },
          ]}
        />
      </section>
    </main>
  );
}
