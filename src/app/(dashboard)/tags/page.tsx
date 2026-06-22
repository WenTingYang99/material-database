import { createRepositories } from "@/lib/db/repositories/factory";
import { DataTable } from "@/components/layout/DataTable";
import { PageHeader } from "@/components/layout/PageHeader";
import type { Tag } from "@/lib/types/tag";
import { createTagAction, mergeTagAction, updateTagAction } from "@/app/actions/tag.actions";

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
      <section className="space-y-5 p-7">
        <form action={createTagAction} className="grid gap-3 rounded-ui border border-slate-200 bg-white p-5 md:grid-cols-[240px_1fr_auto]">
          <input className="h-11 rounded-ui border border-slate-300 px-3" name="tagName" placeholder="请输入标签名称" required />
          <input className="h-11 rounded-ui border border-slate-300 px-3" name="description" placeholder="请输入标签说明" />
          <button className="h-11 rounded-ui bg-brand px-5 font-semibold text-white" type="submit">＋ 创建标签</button>
          <p className="text-sm text-slate-500 md:col-span-3">标签编码由系统自动生成；当前新增标签默认为业务标签。</p>
        </form>
        <form action={mergeTagAction} className="grid gap-3 rounded-ui border border-slate-200 bg-white p-5 md:grid-cols-[1fr_1fr_auto]">
          <select className="h-11 rounded-ui border border-slate-300 px-3" name="sourceTagId" required><option value="">选择被合并标签</option>{rows.map((tag) => <option key={tag.id} value={tag.id}>{tag.tagName}</option>)}</select>
          <select className="h-11 rounded-ui border border-slate-300 px-3" name="targetTagId" required><option value="">选择目标标签</option>{rows.map((tag) => <option key={tag.id} value={tag.id}>{tag.tagName}</option>)}</select>
          <button className="h-11 rounded-ui border border-slate-300 px-5" type="submit">合并标签</button>
          <p className="text-sm text-slate-500 md:col-span-3">合并后，被合并标签会停用并软删除，素材关联转移到目标标签。</p>
        </form>
        <DataTable<Tag>
          rows={rows}
          columns={[
            { key: "tagName", title: "标签名称" },
            { key: "tagCode", title: "标签编码" },
            { key: "tagType", title: "标签类型", render: (row) => row.tagType === 2 ? "AI标签" : "业务标签" },
            { key: "aiSource", title: "AI来源", render: (row) => row.tagType === 1 ? "-" : row.aiSource === 1 ? "AI自动识别" : "业务预定义" },
            { key: "status", title: "状态", render: (row) => row.status === 1 ? "启用" : "停用" },
            { key: "updatedAt", title: "更新时间" },
            { key: "actions", title: "操作", render: (row) => (
              <form action={updateTagAction} className="flex flex-wrap gap-2">
                <input name="tagId" type="hidden" value={row.id} />
                <input className="w-28 rounded-ui border border-slate-300 px-2 py-1" name="tagName" defaultValue={row.tagName} />
                <input className="w-36 rounded-ui border border-slate-300 px-2 py-1" name="description" defaultValue={row.description} />
                <select className="rounded-ui border border-slate-300 px-2 py-1" name="status" defaultValue={String(row.status)}><option value="1">启用</option><option value="0">停用</option></select>
                <button className="rounded-ui border border-slate-300 px-3 py-1" type="submit">保存</button>
              </form>
            ) },
          ]}
        />
      </section>
    </main>
  );
}
