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
- 当前已接入操作：上传文件入库、批量软删除、批量恢复、批量更新失效时间、新建素材组。
- 当前已接入补充操作：顶部搜索、列表视图、素材篮、相似素材筛选、快速分享、素材组编辑/软删除、标签编辑/合并、公开分享素材展示、公开收集提交和文件上传明细。
- 当前未接入操作：上传设置弹窗、精确媒体尺寸/时长读取、真实 AI 识别、查看器拖拽平移、完整详情标签页、下载行为、真实权限校验。
- 素材详情查看器初版：`AssetWorkspace` 内维护 `viewerAssetId` 和 `viewerZoom`，`AssetCard` 缩略图区通过 `onOpen` 打开查看器；支持图片/视频预览、上一张/下一张、缩放和基础详情侧栏。
- 素材基础编辑：`AssetWorkspace` 内维护 `editingAssetId`，查看器侧栏“编辑信息”打开表单，提交到 `updateAssetAction()`；`JsonAssetRepository.update()` 当前写入名称、描述、品牌、车型、权限、素材组、生效时间、失效时间和业务标签。
- 业务标签编辑：编辑表单的 `customTags` 支持逗号、中文逗号、顿号或换行分隔；`JsonAssetRepository.syncCustomTags()` 会自动补齐不存在的业务标签，并重建该素材的 `custom` 标签关联，不影响 AI 标签关联。
- 筛选与搜索：`AppContext` 维护 `query/filters/similarAssetId`，`DashboardShell` 顶部搜索写入 `query`，`AssetToolbar` 从当前素材生成筛选值并分发 `toggleFilter/clearFilter`，`AssetWorkspace.matchFilter()` 执行素材来源、文件格式、车型、品牌、权限范围、业务标签、AI 标签和素材失效日过滤；相似素材通过 `calculateSimilarity()` 基于标签、品牌、车型和格式计算。
- 列表视图：`AssetWorkspace` 根据 `state.view` 在卡片网格和列表行之间切换。
- 素材篮：`AppContext` 维护 `basketIds`；工作区支持把选中素材或查看器当前素材加入素材篮，素材篮可移除/清空，分享按钮优先分享选中素材，没有选中时分享素材篮。
- 素材组基础管理：`AssetWorkspace` 当前组可通过按钮调用 `updateMaterialGroup()` 或 `deleteMaterialGroup()`；删除仍走软删除，组内素材进入回收站。
- 删除策略：所有删除均为软删除，只能更新状态或 `deleted_flag`，不得从 JSON/数据库表中物理移除记录。
- 百度网盘导入：旧版有入口，Next 当前隐藏入口；功能作为后续保留项，需要时再恢复入口并补齐实现。

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
- 当前已接入：新增标签、自动生成标签编码、读取标签表、编辑标签、启用/停用、合并标签。
- 当前仍缺：完整 AI 标签字段、标签使用统计、标签点击筛选。

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

- 上传与导入：旧版在 `app-actions.js`；Next 已接入现有上传按钮到隐藏文件选择框，文件保存到 `public/uploads/` 并通过 `uploadAssetsAction()` 写入素材表。上传设置、媒体信息、AI 标签识别和车型识别仍待补齐；百度网盘导入入口当前按需求隐藏。
- 筛选与排序：旧版在 `app-utils.js`、`app-actions.js`、`app-core.js`；Next 已迁移多选筛选、基础排序、搜索、相似结果和列表视图，筛选配置和显示全部素材组开关仍待增强。
- 素材查看器：旧版在 `app-actions.js` 和 `app-render.js`；Next 已迁移初版查看器，平移、详情标签页、浏览日志和底部操作仍待增强。
- 素材编辑：旧版在 `app-actions.js`；Next 已迁移基础编辑和业务标签编辑，AI 标签、颜色、所有者、权限枚举和表单校验仍待补齐。
- 素材组 CRUD/移动：旧版在 `app-actions.js`，Next 已有创建、编辑和软删除；树形拖拽/折叠仍未做。
- 标签新增/编辑/合并：旧版在 `app-render.js`；Next 当前实现位置为 `src/components/tags/TagsManager.tsx`，页面入口为 `src/app/(dashboard)/tags/page.tsx`；展示方式按旧版恢复为业务标签/AI 标签 tab、搜索/排序、表格图标操作和新增/编辑/合并弹框，不再把新增、合并、编辑表单平铺在页面内。
- 素材篮：旧版在 `app-actions.js`、`app-workflows.js`，Next 当前在 `src/components/assets/AssetWorkspace.tsx` 中按旧版语义恢复：素材篮内容等同 `selectedIds`，通过右侧抽屉展示，支持移出、清空、软删除、修改有效期和分享；不再维护独立 `basketIds` 状态。
- 分享：旧版在 `app-workflows.js`，Next 已有基础记录创建、快速分享和公开页素材展示；密码校验、访问计数、下载计数仍需后端级完善。
- 收集：旧版在 `app-actions.js`、`app-workflows.js`，Next 已有任务创建、公开提交、提交记录和上传文件明细；入库/拒收流转仍待真实后台工作流。
- 回收站：旧版在 `app-render.js`、`app-workflows.js`，Next 已接入批量恢复；清空回收站、物理删除等能力不再迁移为可用功能，删除统一按软删除处理。
- 权限与所有者：旧版在 `app-workflows.js`，Next 尚未迁移完整交互。

## 当前仍需注意的问题

- 文档已重新保存为 UTF-8；后续更新文档继续使用 UTF-8。
- 标签管理页、素材工作区、筛选工具栏、通用 DataTable/PageHeader 中已修复本次触碰到的中文乱码；当前 Next 源码中如仍能看到其他页面中文文案乱码，后续迁移 UI 时继续按页面逐步修复。
- 功能迁移必须先对照 `legacy-static/` 的展示方式，保持弹框、抽屉、表格列、按钮位置和操作入口；不要把旧版弹框改成内联表单，除非用户明确同意重做布局或样式。
- `npm run typecheck` 当前通过，但它无法发现所有交互缺失；迁移功能时需要对照旧静态页手动验收。
- MySQL Repository 仍未实现，正式后端存储前需要补齐。
- 每次文件变化后同步更新 `README.md` 和 `CODE_MEMORY.md`；涉及数据结构或数据语义时也必须更新 `DATABASE_SCHEMA.md`，并询问是否需要把变化加入本地 git。

## 下一步迁移优先级

1. 若继续推进，应优先做真实后端能力：MySQL Repository、媒体解析、AI 识别、权限校验、下载/访问统计、网盘导入。
2. JSON 演示版剩余主要是体验增强：查看器拖拽平移、详情标签页、筛选配置、树折叠/拖拽。

## 点检建议

- 改素材列表：先测分组切换、选择状态、批量软删除、回收站恢复、有效期批量更新。
- 改筛选排序：先测顶部筛选、多选、排序、素材数量、空状态。
- 改标签：先测标签管理页表格、新增、编辑、合并、AI 标签字段、标签跳转筛选。
- 改分享/收集：先测创建链接、公开页、过期时间、密码/权限、提交和上传。
- 改回收站：先测软删、恢复、删除时间排序；不测试物理删除，因为删除统一为软删除。
