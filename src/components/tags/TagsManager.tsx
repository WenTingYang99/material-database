"use client";

import { useMemo, useState } from "react";
import type { Tag } from "@/lib/types/tag";
import { createTagAction, mergeTagAction, updateTagAction } from "@/app/actions/tag.actions";

type ActiveTab = "business" | "ai";
type ModalState =
  | { type: "add" }
  | { type: "edit"; tag: Tag }
  | { type: "merge"; sourceId?: string }
  | null;

export function TagsManager({ rows }: { rows: Tag[] }) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("business");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("count");
  const [modal, setModal] = useState<ModalState>(null);

  const tagCounts = useMemo(() => new Map(rows.map((tag) => [tag.id, 0])), [rows]);
  const businessTags = useMemo(() => rows.filter((tag) => tag.tagType === 1), [rows]);
  const aiTags = useMemo(() => rows.filter((tag) => tag.tagType === 2), [rows]);
  const visibleRows = useMemo(() => {
    const source = activeTab === "business" ? businessTags : buildAiTreeRows(aiTags);
    const filtered = query.trim()
      ? source.filter((tag) => `${tag.tagName} ${tag.tagCode} ${tag.description}`.toLowerCase().includes(query.trim().toLowerCase()))
      : source;
    return [...filtered].sort((a, b) => {
      if (sort === "name") return a.tagName.localeCompare(b.tagName, "zh-CN");
      return (tagCounts.get(b.id) || 0) - (tagCounts.get(a.id) || 0) || a.tagName.localeCompare(b.tagName, "zh-CN");
    });
  }, [activeTab, aiTags, businessTags, query, sort, tagCounts]);

  return (
    <>
      <section className="bg-white px-7 py-5">
        <p className="mb-2 text-sm text-slate-500">全部 - 更多功能 - 标签管理 · 业务标签 {businessTags.length} 个 · AI标签 {aiTags.length} 个</p>
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-3xl font-bold">标签管理</h1>
          <div className="flex gap-2">
            <button className="rounded-ui border border-slate-300 px-4 py-2" onClick={() => setModal({ type: "add" })} type="button">新增标签</button>
            <button className="rounded-ui border border-slate-300 px-4 py-2" onClick={() => setModal({ type: "merge" })} type="button">标签合并</button>
          </div>
        </div>
      </section>
      <section className="p-7">
        <div className="manage-layout">
          <section className="manage-main">
            <div className="menu-pop side-pop">
              {["用户动态", "标签管理", "有效期管理", "收集素材", "分享记录", "回收站"].map((label) => (
                <button className={label === "标签管理" ? "active-side" : ""} key={label} type="button">{label}</button>
              ))}
            </div>
            <div className="tabs">
              <button className={activeTab === "business" ? "active" : ""} onClick={() => setActiveTab("business")} type="button">业务标签</button>
              <button className={activeTab === "ai" ? "active" : ""} onClick={() => setActiveTab("ai")} type="button">AI标签</button>
            </div>
            <div className="asset-toolbar inline-toolbar">
              <label>搜索标签<input onChange={(event) => setQuery(event.target.value)} placeholder="输入标签名称搜索" value={query} /></label>
              <label>排序方式<select onChange={(event) => setSort(event.target.value)} value={sort}>
                <option value="count">使用次数（降序）</option>
                <option value="name">标签名称（升序）</option>
              </select></label>
            </div>
            <div className="table-scroll">
              <table className="records-table tag-table">
                {activeTab === "business" ? <BusinessTagTable rows={visibleRows} onEdit={(tag) => setModal({ type: "edit", tag })} onMerge={(tag) => setModal({ type: "merge", sourceId: tag.id })} /> : <AiTagTable rows={visibleRows} allRows={rows} onEdit={(tag) => setModal({ type: "edit", tag })} />}
              </table>
            </div>
          </section>
        </div>
      </section>
      {modal?.type === "add" ? <TagFormModal mode="add" allRows={rows} onClose={() => setModal(null)} /> : null}
      {modal?.type === "edit" ? <TagFormModal mode="edit" allRows={rows} tag={modal.tag} onClose={() => setModal(null)} /> : null}
      {modal?.type === "merge" ? <MergeTagModal rows={businessTags} sourceId={modal.sourceId} onClose={() => setModal(null)} /> : null}
    </>
  );
}

function BusinessTagTable({ rows, onEdit, onMerge }: { rows: Tag[]; onEdit: (tag: Tag) => void; onMerge: (tag: Tag) => void }) {
  return (
    <>
      <colgroup><col style={{ width: 64 }} /><col style={{ width: 220 }} /><col style={{ width: 150 }} /><col style={{ width: 230 }} /><col style={{ width: 132 }} /><col style={{ width: 110 }} /><col style={{ width: 104 }} /></colgroup>
      <thead><tr><th>#</th><th>标签名称</th><th>标签编码</th><th>标签描述</th><th>创建时间</th><th>创建人</th><th>操作</th></tr></thead>
      <tbody>
        {rows.length ? rows.map((tag, index) => (
          <tr key={tag.id}>
            <td className="cell-mono">{index + 1}</td>
            <td><div className="tag-name-cell"><span className="tag-type-badge" title="业务标签">B</span><strong>{tag.tagName}</strong><span className="tag-count-badge" title="使用次数">0 次</span></div></td>
            <td className="cell-mono">{tag.tagCode}</td>
            <td className="cell-ellipsis">{tag.description || "-"}</td>
            <td>{formatDate(tag.createdAt)}</td>
            <td>{tag.createdBy || "-"}</td>
            <td><div className="tag-table-actions"><button className="op-button" onClick={() => onEdit(tag)} title="编辑" type="button">编</button><button className="op-button" onClick={() => onMerge(tag)} title="合并到分组" type="button">合</button></div></td>
          </tr>
        )) : <tr><td className="empty-cell" colSpan={7}>暂无业务标签</td></tr>}
      </tbody>
    </>
  );
}

function AiTagTable({ rows, allRows, onEdit }: { rows: Tag[]; allRows: Tag[]; onEdit: (tag: Tag) => void }) {
  const nameById = new Map(allRows.map((tag) => [String(tag.id), tag.tagName]));
  return (
    <>
      <colgroup><col style={{ width: 64 }} /><col style={{ width: 220 }} /><col style={{ width: 150 }} /><col style={{ width: 220 }} /><col style={{ width: 140 }} /><col style={{ width: 130 }} /><col style={{ width: 100 }} /><col style={{ width: 132 }} /><col style={{ width: 110 }} /><col style={{ width: 86 }} /></colgroup>
      <thead><tr><th>#</th><th>标签名称</th><th>标签编码</th><th>标签描述</th><th>父标签名称</th><th>AI来源</th><th>AI识别</th><th>创建时间</th><th>创建人</th><th>操作</th></tr></thead>
      <tbody>
        {rows.length ? rows.map((tag, index) => (
          <tr key={tag.id}>
            <td className="cell-mono">{index + 1}</td>
            <td><div className="tag-name-cell"><span className="tree-indent">{"├ ".repeat(tag.level || 0)}</span><span className="tag-type-badge ai" title="AI标签">AI</span><strong>{tag.tagName}</strong><span className="tag-count-badge" title="使用次数">0 次</span></div></td>
            <td className="cell-mono">{tag.tagCode}</td>
            <td className="cell-ellipsis">{tag.description || "-"}</td>
            <td>{nameById.get(String(tag.parentId)) || "-"}</td>
            <td><span className={`ai-source-tag ${tag.aiSource === 1 ? "ai-source-auto" : "ai-source-predef"}`}>{tag.aiSource === 1 ? "AI 自动识别" : "业务预定义"}</span></td>
            <td>{tag.aiRecognitionEnabled ? <span className="badge-on">启用</span> : <span className="badge-off">未启用</span>}</td>
            <td>{formatDate(tag.createdAt)}</td>
            <td>{tag.createdBy || "-"}</td>
            <td><div className="tag-table-actions"><button className="op-button" onClick={() => onEdit(tag)} title="编辑" type="button">编</button></div></td>
          </tr>
        )) : <tr><td className="empty-cell" colSpan={10}>暂无AI标签</td></tr>}
      </tbody>
    </>
  );
}

function TagFormModal({ mode, tag, allRows, onClose }: { mode: "add" | "edit"; tag?: Tag; allRows: Tag[]; onClose: () => void }) {
  const aiParents = allRows.filter((item) => item.tagType === 2 && item.id !== tag?.id);
  const action = mode === "add" ? createTagAction : updateTagAction;
  const title = mode === "add" ? "新增标签" : "编辑标签";
  return (
    <div className="modal">
      <div className="modal-card form-card">
        <header><h2>{title}</h2><button className="plain-icon" onClick={onClose} type="button">×</button></header>
        <form action={action} onSubmit={onClose}>
          {tag ? <input name="tagId" type="hidden" value={tag.id} /> : null}
          {tag ? <label>当前标签名称<strong>{tag.tagName}</strong></label> : null}
          <label>标签类型<select defaultValue={String(tag?.tagType || 1)} name="tagType">
            <option value="1">业务标签</option>
            <option value="2">AI标签</option>
          </select></label>
          <label>{mode === "add" ? "标签名称" : "新标签名称"}<input defaultValue={tag?.tagName || ""} name="tagName" placeholder="例如：618活动、画面质感" required /></label>
          <label>标签描述<textarea defaultValue={tag?.description || ""} name="description" placeholder="可选：描述标签的用途或含义" /></label>
          <label>父级AI标签<select defaultValue={String(tag?.parentId || "")} name="parentId"><option value="">无（顶级标签）</option>{aiParents.map((item) => <option key={item.id} value={item.id}>{item.tagName}</option>)}</select></label>
          <label className="checkbox-label"><input defaultChecked={Boolean(tag?.aiRecognitionEnabled)} name="aiRecognitionEnabled" type="checkbox" /> 启用AI识别</label>
          <label>状态<select defaultValue={String(tag?.status ?? 1)} name="status"><option value="1">启用</option><option value="0">停用</option></select></label>
          <div className="form-actions"><button onClick={onClose} type="button">取消</button><button className="primary" type="submit">{mode === "add" ? "添加标签" : "保存修改"}</button></div>
        </form>
      </div>
    </div>
  );
}

function MergeTagModal({ rows, sourceId, onClose }: { rows: Tag[]; sourceId?: string; onClose: () => void }) {
  return (
    <div className="modal">
      <div className="modal-card form-card">
        <header><h2>标签合并</h2><button className="plain-icon" onClick={onClose} type="button">×</button></header>
        <form action={mergeTagAction} onSubmit={onClose}>
          <div className="info-card"><span>标签合并说明</span><p>将多个标签合并为一个标签，原标签会被软删除，所有使用原标签的素材将使用新标签。</p></div>
          <label>选择要合并的标签（可多选）<select defaultValue={sourceId ? [sourceId] : []} multiple name="sourceTagId" required size={6}>{rows.map((tag) => <option key={tag.id} value={tag.id}>{tag.tagName}</option>)}</select></label>
          <label>合并到目标标签<select name="targetTagId" required><option value="">请选择目标标签</option>{rows.map((tag) => <option key={tag.id} value={tag.id}>{tag.tagName}</option>)}</select></label>
          <div className="form-actions"><button onClick={onClose} type="button">取消</button><button className="primary" type="submit">执行合并</button></div>
        </form>
      </div>
    </div>
  );
}

function buildAiTreeRows(tags: Tag[]) {
  const byParent = new Map<string, Tag[]>();
  tags.forEach((tag) => {
    const key = String(tag.parentId || 0);
    byParent.set(key, [...(byParent.get(key) || []), tag]);
  });
  const result: Tag[] = [];
  const walk = (parentId: string) => {
    (byParent.get(parentId) || []).sort((a, b) => a.sortOrder - b.sortOrder || a.tagName.localeCompare(b.tagName, "zh-CN")).forEach((tag) => {
      result.push(tag);
      walk(tag.id);
    });
  };
  walk("0");
  tags.filter((tag) => !result.includes(tag)).forEach((tag) => result.push(tag));
  return result;
}

function formatDate(value: string) {
  return value ? value.slice(0, 10) : "-";
}
