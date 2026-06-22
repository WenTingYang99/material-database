# 代码记忆索引

更新时间：2026-06-22

用途：后续改动前，先查本文档定位对应代码位置；如果这里不能定位，再回读完整相关文件，并把新的定位补充到本文档。

## 修改前流程

1. 先按需求关键词查本文档。
2. 能定位到模块和函数时，只读取对应函数附近代码，再做局部修改。
3. 不能定位时，再读取相关完整文件。
4. 修改后如果新增功能入口、状态字段、模板或动态数据来源，必须补充本文档。

## 项目分区

- Next.js 迁移版主代码：`src/`
- JSON 数据：`data/db.json`
- 静态版归档：`legacy-static/`
- 数据库字段说明：`DATABASE_SCHEMA.md`
- 迁移说明：`MIGRATION_GUIDE.md`
- 项目说明与缺口清单：`README.md`

## Next.js 入口

- 根布局：`src/app/layout.tsx`
- 全局样式：`src/app/globals.css`
- 登录页：`src/app/(auth)/login/page.tsx`
- Dashboard 布局：`src/app/(dashboard)/layout.tsx`
- Dashboard 外壳：`src/components/layout/DashboardShell.tsx`
- App 状态：`src/context/AppContext.tsx`
- 路由守卫：`src/proxy.ts`
- 登录 Session：`src/lib/auth/session.ts`

## 当前页面定位

- 全部素材：首页 `src/app/(dashboard)/page.tsx`
- 待入库：`src/app/(dashboard)/pending/page.tsx`
- 我创建的组：`src/app/(dashboard)/created/page.tsx`
- 用户动态：`src/app/(dashboard)/activity/page.tsx`
- 标签管理：`src/app/(dashboard)/tags/page.tsx`
- 有效期管理：`src/app/(dashboard)/validity/page.tsx`
- 收集素材：`src/app/(dashboard)/collect-tasks/page.tsx`
- 分享记录：`src/app/(dashboard)/shares/page.tsx`
- 回收站：`src/app/(dashboard)/recycle/page.tsx`
- 公开分享页：`src/app/share/[code]/page.tsx`
- 公开收集页：`src/app/collect/[code]/page.tsx`
- 素材 API 初版：`src/app/api/assets/route.ts`

## 素材工作区

- 素材工作区组件：`src/components/assets/AssetWorkspace.tsx`
- 素材卡片：`src/components/assets/AssetCard.tsx`
- 素材工具栏：`src/components/filters/AssetToolbar.tsx`
- 素材 Server Actions：`src/app/actions/asset.actions.ts`
- 当前已接入操作：批量软删除、批量恢复、批量彻底删除、批量更新失效时间、新建素材组。
- 当前未接入操作：上传、导入、详情查看器、素材编辑、素材组编辑/移动 UI、素材篮、完整筛选菜单、列表视图。

## Repository 索引

- Repository 接口：`src/lib/db/repositories/interfaces.ts`
- Repository 工厂：`src/lib/db/repositories/factory.ts`
- JSON 基础读写：`src/lib/db/json/JsonDatabase.ts`
- 用户：`src/lib/db/json/JsonUserRepository.ts`
- 素材：`src/lib/db/json/JsonAssetRepository.ts`
- 素材组：`src/lib/db/json/JsonGroupRepository.ts`
- 标签：`src/lib/db/json/JsonTagRepository.ts`
- 分享：`src/lib/db/json/JsonShareRepository.ts`
- 收集：`src/lib/db/json/JsonCollectRepository.ts`

## 数据表索引

- `t_employee`：用户表。
- `t_asset`：素材主表。
- `t_asset_group`：素材分组树表。
- `t_asset_tag`：标签表。
- `t_asset_tag_rel`：素材标签关联表。
- `t_asset_operation_log`：用户操作日志表。
- `t_share_record`：分享记录表。
- `t_share_target_rel`：分享对象关联表。
- `t_collect_task`：收集任务表。
- `t_collect_submission`：收集提交记录表。
- `t_collect_upload_file`：收集上传文件表。

## 类型文件

- 素材类型：`src/lib/types/asset.ts`
- 分组类型：`src/lib/types/group.ts`
- 标签类型：`src/lib/types/tag.ts`
- 用户类型：`src/lib/types/user.ts`
- 格式化工具：`src/lib/utils/format.ts`

## 分享与收集迁移定位

- 分享管理页读取 `shares.findAll()`，创建表单提交到 `createShareAction()`。
- 分享创建 Action：`src/app/actions/share.actions.ts`，写入 `t_share_record` 和 `t_share_target_rel`。
- 分享公开页通过 `shares.findByCode(code)` 查询。
- 收集任务管理页读取 `collect.findTasks()`，创建表单提交到 `createCollectTaskAction()`。
- 收集任务创建 Action：`src/app/actions/collect.actions.ts`，写入 `t_collect_task`。
- 收集公开页通过 `collect.findTaskByCode(code)` 查询。
- 当前仍缺：分享权限校验、密码访问、过期状态流转、真实访问/下载统计、收集提交、收集文件上传、入库流程。

## 标签迁移定位

- 标签管理页：`src/app/(dashboard)/tags/page.tsx`
- 标签 Action：`src/app/actions/tag.actions.ts`
- 标签 Repository：`src/lib/db/json/JsonTagRepository.ts`
- 当前已接入：新增标签、自动生成标签编码、读取标签表。
- 当前仍缺：编辑标签、启用/停用、合并标签、AI 标签字段、标签使用统计、标签点击筛选。

## 旧静态版定位

以下文件仅作迁移参考，不应被 Next 项目直接依赖：

- 静态骨架与弹窗模板：`legacy-static/index.html`
- 全局样式：`legacy-static/styles.css`
- 基础设施：`legacy-static/app-infra.js`
- 种子数据、全局状态、启动和事件：`legacy-static/app-core.js`
- 主渲染、素材列表、管理页、标签页：`legacy-static/app-render.js`
- 上传、筛选、菜单、素材组、查看器、编辑、收集任务创建：`legacy-static/app-actions.js`
- 素材篮、分享、收集任务配置、权限、回收站工作流：`legacy-static/app-workflows.js`
- 过滤、排序、日期、格式、转义等工具：`legacy-static/app-utils.js`

## 旧静态版功能对照

- 上传与导入：旧版在 `app-actions.js`，Next 尚未迁移。
- 筛选与排序：旧版在 `app-utils.js`、`app-actions.js`、`app-core.js`，Next 仅有工具栏骨架和基础排序。
- 素材查看器：旧版在 `app-actions.js` 和 `app-render.js`，Next 尚未迁移。
- 素材编辑：旧版在 `app-actions.js`，Next 尚未迁移完整弹窗。
- 素材组 CRUD/移动：旧版在 `app-actions.js`，Next 仅有创建入口和 Repository 写操作。
- 标签新增/编辑/合并：旧版在 `app-render.js`，Next 仅有新增入口。
- 素材篮：旧版在 `app-actions.js`、`app-workflows.js`，Next 尚未迁移。
- 分享：旧版在 `app-workflows.js`，Next 仅有基础记录创建和公开页。
- 收集：旧版在 `app-actions.js`、`app-workflows.js`，Next 仅有任务创建和公开页。
- 回收站：旧版在 `app-render.js`、`app-workflows.js`，Next 已接入批量恢复/彻底删除，但清空回收站、排序等仍需补齐。
- 权限与所有者：旧版在 `app-workflows.js`，Next 尚未迁移完整交互。

## 当前仍需注意的问题

- 文档已重新保存为 UTF-8；后续更新文档继续使用 UTF-8。
- 当前 Next 源码中仍能看到部分中文文案乱码，后续迁移 UI 时应按页面逐步修复。
- `npm run typecheck` 当前通过，但它无法发现所有交互缺失；迁移功能时需要对照旧静态页手动验收。
- MySQL Repository 仍未实现，正式后端存储前需要补齐。

## 点检建议

- 改素材列表：先测分组切换、选择状态、批量删除、回收站恢复/彻底删除、有效期批量更新。
- 改筛选排序：先测顶部筛选、多选、排序、素材数量、空状态。
- 改标签：先测标签管理页表格、新增、编辑、合并、AI 标签字段、标签跳转筛选。
- 改分享/收集：先测创建链接、公开页、过期时间、密码/权限、提交和上传。
- 改回收站：先测软删、恢复、彻底删除、清空、删除时间排序。

