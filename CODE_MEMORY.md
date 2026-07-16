﻿﻿﻿﻿# 代码记忆索引

> 最后核对日期：2026-07-14
> 用途：改动前先查本文件定位代码位置；如不能定位再回读完整相关文件，并补充新定位。
> 说明：行号仅作定位参考，可能随重构漂移，**以函数名为准**。用户明确要求：收到“调整/修改/优化”类消息时，先说明对需求的理解并询问是否正确，再动手。

## 修改前流程

1. 先按需求关键词查本文件。
2. 能定位到模块和函数时，只读取对应函数附近代码，再做局部修改。
3. 不能定位时，再读取相关完整文件。
4. 修改后如果新增功能入口、状态字段、模板、动态数据来源，必须补充本文件。
5. 收到“调整/修改/优化”类消息时，先说明对需求的理解并询问是否正确；用户确认后再开始修改。

## 文件职责

- `index.html`：静态骨架、模态框、模板（`<template>`）、脚本加载顺序。
- `styles.css`：全局布局、素材卡片、列表、弹窗、标签页、暗色模式、移动端样式。
- `app-infra.js`：基础设施封装（IIFE），包括 Toast、Modal.confirm、Loading、`http`、`initDatePicker`、`debounce`、原生日期降级。
- `app-core.js`：种子数据、全局 `db/state/els`、值列表树、权限函数、全局状态、DOM 引用、启动函数、数据归一化、主壳渲染、全局事件绑定、菜单系统、收集/分享落地页、登录/会话。
- `app-render.js`：主渲染入口、首页、素材列表/卡片、管理页分发、回收站、标签管理页、值列表管理页、菜单管理页、系统管理页（用户/角色/组织/权限）、标签新增编辑合并。
- `app-actions.js`：上传、筛选菜单（树形结构）、侧边栏、素材组菜单、素材菜单、查看器、素材/素材组表单、收集任务创建、素材篮计数、素材编辑候选下拉。
- `app-workflows.js`：素材篮抽屉、分享（创建/记录管理）、收集任务配置/模拟上传、有效期/所有者/权限、删除/恢复/预览/下载、权限申请审批。
- `app-utils.js`：过滤、排序、相似度、面包屑、日期时间格式化、标签拆分、转义、空态、筛选匹配函数、整库日期归一化。
- `app.js`：启动入口，只调用 `bootstrap()`。

## 数据与状态

- 持久化 key：`app-core.js` `STORAGE_KEY = "dp-material-library-state-v2"`。
- 默认素材组：`app-core.js` `defaultGroups`。
- 种子素材名：`app-core.js` `seedNames`。
- 值列表种子树：`app-core.js` `SEED_VALUE_LIST_TREE`（统一树模型，包含素材库筛选维度和素材管理维度）。
- 种子素材：`app-core.js` `seedAssets`（已改同时带 `assetStatus:"active"` 与 `auditStatus:"machine_pass"`，不再使用旧 `status` 字段；品牌/车系/车型/权限均存值列表 code）。
- 种子标签：`app-core.js` `seedTags`（字段 `tagName/tagCode/tagType/parentId/level/aiSource/...`，与值列表树是两套独立体系）。
- 默认筛选项：`app-core.js` `filterLabels`。
- 会话 key：`app-core.js` `SESSION_USER_KEY`。
- 全局数据库：`app-core.js` `db = loadDb()`。
- 读库：`app-core.js` `loadDb()`。
- 存库：`app-core.js` `saveDb()`。
- 数据归一化（启动期调用，承担“迁移”职责）：
  - `normalizeDbDates(db)`（`app-utils.js`）：整库日期字段统一为 ISO，自愈历史 `/` 数据。
  - `normalizeDbSelectionCodes(db)`（`app-core.js`，`bootstrap` 中调用）：纠偏权限范围/品牌等枚举（如含“下载”→`downloadable`）。
  - `normalizeStoredTagCodes()`（`app-core.js`）：修正标签编码（空/中文/重复）。
  - `normalizeShareSecurity(share)` / `normalizeCollectTaskSecurity(task)`（`app-core.js`）：补齐分享/收集任务的密码与审核状态字段。
  - **注意**：CODE_MEMORY 早期版本提到的 `migrateVehicleModels/migrateShareExpiresAt/migrateAssetMetadata/migrateCollectTaskSecurity/migrateAuditFields` **在代码中均不存在**，不要按这些名字查找或调用；等效逻辑已并入上述 `normalize*` 函数。

### 素材状态体系

- `assetStatus` 是素材主状态，来自值列表 `asset_status`，当前核心值包括 `pending`、`active`、`deleted`、`disabled`。
- `auditStatus` 是审核链路状态，来自值列表 `audit_status`，覆盖待提交、待审核、机审、人审和终审通过等节点（见 `getAuditStatusConfig()`）。
- 素材库展示已入库素材：`assetStatus=active` 且当前用户 `canViewAsset(asset)`。
- 待入库展示口径：`isPendingAsset(asset)`（`app-core.js:866`），包含 `assetStatus=pending` 或 `assetStatus` 非 active 且 `auditStatus` 未终审通过的素材；`assetStatus=active` 的素材一定不算待入库；`deleted`/`disabled` 也会提前返回 false（已在 `isPendingAsset` 中修正）。
- 回收站展示口径：`assetStatus` 命中 `getAssetStatusConfig().deletedCodes`（含 `deleted`/`disabled`）。
- 入库动作：`approveSelectedAssets()`（见 `app-actions.js`）将命中素材写为 `auditStatus=human_pass`、`assetStatus=active`。
- **关键约束**：所有新建素材（种子与运行时）应同时写入 `assetStatus` 与 `auditStatus`。`getFilteredAssets()`（`app-utils.js:1`）对 `assetStatus` 有 `|| asset.status` 兜底；`getHomeVisibleAssets()`（`app-render.js:65`）与 `getVisibleAssets()`（`app-core.js:1203`）仅靠 `asset.assetStatus` 判断——种子素材现已补齐 `assetStatus`，首页/可见列表正常显示。

### 值列表统一树模型

- `db.valueListTree`：单一数组，节点字段 `id, code, name, type, parentId, refId, description, attr1, attr2, status, sortOrder`。
- type 取值：`root`/`dimension`/`group`/`value`。
- 树根："值列表"（`vl_root`），子节点包含"素材库筛选"（`vl_dim_matlib`，code `material_lib`）和"素材管理"（`vl_dim_matmanage`，code `material_manage`）。
- 树派生函数（`app-core.js`）：
  - `getTreeChildren(parentId)`
  - `getTreeNodeById(id)`（`app-core.js:277`）
  - `getTreeNodeByCode(code, parentDimCode)`（`app-core.js:280`，**支持维度限定**，无维度时取全树第一个匹配）
  - `getDimensionNodes(parentDimId)`
  - `buildFilterTree(dimCode, parentId)`
  - `getAllLeafValues(dimCode)`
  - `getAllUploadAccept()` / `getAllCollectTaskTypes()`
  - `getVehicleModels()` / `getFileFormatCategoriesFromTree()` / `getAspectRatiosFromTree()`
  - `getAllowedUploadFormats()` / `getFilterLabels()` / `getConfigurableFilters()`
- **不存在 `getTreeNodeByName`**：全代码仅有 `getTreeNodeById` / `getTreeNodeByCode`，不要按名称查找值列表节点。

### 菜单系统

- `db.menus`：动态菜单树，节点字段 `id, name, page, parentId, category, layout, icon, valid, hidden, sortOrder, visible, editable`。
- `首页` 是一级菜单：`menu_home` / `page="home"` / `layout="home"`，与“素材管理”“更多功能”并列；`getMenuPermission("home")` 固定返回可见，首页内容仍按素材/素材组权限过滤。
- `getAllMenuPages()` 获取所有页面菜单；`isAssetPage(page)` / `isManagePage(page)` 判断页面类型。
- `getDefaultMenus()` 返回初始菜单树；`ensureSystemData()` 在 `db.menus` 缺失/空时初始化，并补齐默认菜单中新增但本地缺失的节点（如 `menu_home`），不覆盖已有菜单配置。
- 权限函数：`getMenuPermission(menuId)` / `canViewMenu(menuId)` / `canEditMenu(menuId)`。
- `isVisibleNavMenu(menu)` / `getVisibleNavMenuChildren(parentId)` 过滤左侧菜单。

## 主流程

- 启动：`app.js` -> `bootstrap()`（`app-core.js:1679`）。
- 启动顺序：清临时态 → `ensureRuntimeElements()` → `ensureSystemData()` → `normalizeDbDates(db)` → `normalizeDbSelectionCodes(db)`（有变化则存库）→ `normalizeStoredTagCodes()` → 取当前用户 → `buildUserGroupPermissionCache()` → `renderShell()` → 绑定值列表弹框事件 → 处理 `?collect=` / `?share=` 落地页 → 处理 `page` 参数 → `applyHashState()` → `normalizePageState()` → `bindEvents()` → `render()` → 未登录则显示登录页。
- 主壳同步：`renderShell()`（`app-core.js`）。
- 主渲染入口：`render()`（`app-render.js:10`）。
- 左侧菜单树渲染：`renderMainNav()` / `renderMainNavNodes()`（`app-core.js`）。
- 登录成功后默认进入 `state.page="home"`；URL `page` 参数、`#group=`、`#asset=` 仍可覆盖到对应页面。
- 退出登录后回到 `home` 并显示登录页。

## 页面定位

### HTML 骨架（index.html）

- 顶部栏：含应用菜单按钮、搜索框、通知/语言/用户按钮。
- 侧边栏：含关闭按钮、`#mainNav`、素材组树、收起手柄。
- 页面头部（面包屑+标题+操作按钮）。
- 素材工具栏（筛选+布局+排序）。
- 以图搜图区。
- 内容区：`#contentPanel`。
- 查看器、素材篮抽屉、更多菜单浮层（`#moreMenuContent` 由 JS 动态渲染）。

### 弹框/模板（index.html）

| 弹框/模板 | 说明 |
|---|---|
| `#basketValidityModal` | 素材篮批量有效期 |
| `#basketShareModal` | 素材篮分享（含密码字段） |
| `#addTagModal` / `#editTagModal` / `#mergeTagModal` | 新增/编辑/合并标签 |
| `#editAssetModal` | 编辑素材（`.asset-edit-combo` 结构） |
| `#shareAssetModal` | 单素材分享（含密码字段） |
| `#addGroupModal` / `#editGroupModal` / `#moveGroupModal` | 新建/编辑/移动素材组 |
| `#addToGroupModal` | 添加到素材组 |
| `#uploadSettingsModal` | 上传设置 |
| `#cloudImportModal` | 百度网盘导入 |
| `#collectTaskModal` | 创建收集任务 |
| `#shareGroupModal` | 素材组分享（含密码字段） |
| `#valueListModal` | 值列表新增/编辑（含树状 refId 下拉） |
| `#valueListItemListModal` / `#valueListItemFormModal` | 旧值列表弹框（保留兼容，已不被新布局调用） |
| `<template id="tplConfirmModal">` 等通用模板 | 确认弹框 / Loading / 表单 / 上传设置 / 网盘导入 / 收集任务配置 / 分享记录管理 / 收集上传 / 素材有效期 / 所有者 / 组权限 / 素材权限 / 操作日志 |

### JS 渲染入口（app-render.js）

| 函数 | 说明 |
|---|---|
| `render()` | 主渲染入口，优先分发 `home`，再分发素材页或管理页 |
| `renderHomePage()` | 首页：素材热榜、最新素材、已配置素材组卡片列表 |
| `openHomeGroupConfigModal()` | 首页素材组展示配置弹窗（最多 4 个） |
| `renderAssets()` / `renderCompactAssets()` / `renderDateGroupedAssets()` | 素材列表（平铺/分组/日期） |
| `renderAssetCard()` / `renderMetadataList()` | 素材卡片 / 列表视图 |
| `renderList()` | 回收站列表 |
| `bindAssetEvents()` | 素材卡片事件绑定 |
| `renderManagePageV2()` | 管理页分发（`directRenderers` 映射表） |
| `renderActivityPage()` / `renderSharePage()` / `renderRecyclePage()` / `renderCollectPage()` / `renderValidityPage()` | 各管理页 |
| `renderValueListPage()` / `renderMenuManagePage()` | 值列表 / 菜单管理 |
| `renderSystemManagePage()` 及 `renderUserManagePage()` / `renderRoleManagePage()` / `renderOrganizationManagePage()` / `renderPermissionManagePage()` / `renderLoginLogPage()` | 系统管理族 |
| `renderTagsPage()` / `getTagSummary()` / `renderTagTableBody()` | 标签管理 |

### 落地页（app-core.js）

| 函数 | 说明 |
|---|---|
| `renderCollectorPortal(code)` | 收集任务落地页入口 |
| `renderCollectorPasswordGate()` / `renderCollectorPortalContent()` | 收集页密码门 / 上传主体 |
| `renderSharePortal(token)` | 分享落地页入口（状态→有效期→访问次数→范围→密码→计数 链路） |
| `renderSharePasswordGate()` / `renderSharePortalContent()` / `getSharePortalAssets()` | 分享页密码门 / 内容主体 / 素材获取 |
| `ensureRuntimeElements()` / `handleLoginSubmit()` / `logoutCurrentUser()` | 动态登录页 / 登录提交 / 退出 |

## 首页

- 菜单入口：一级菜单 `menu_home` / `page="home"` / `layout="home"`。
- 登录后默认进入首页；`getMenuPermission("home")` 固定可见，首页具体数据仍必须按素材/素材组权限过滤。
- 渲染入口：`renderHomePage()`，由 `render()` 在 `state.page === "home"` 时优先分发。
- 素材热榜：从 `getHomeVisibleAssets()` 取当前用户可查看且 `assetStatus=active` 的素材，按 `asset.view` 倒序取前 8 条。
- 最新素材列表：同样先按 `canViewAsset(asset)` 过滤，再按 `createdAt/uploadDate/updatedAt` 倒序取前 8 条。
- 素材组展示配置：`openHomeGroupConfigModal()` 按 `canViewGroup(group.id)` 渲染可选素材组树；最多保存 4 个素材组，按用户存 `localStorage`，key 为 `dp-material-library-home-groups:${currentUser.id}`。
- 首页取数 `getHomeVisibleAssets()` 仅判断 `asset.assetStatus`（无 `|| asset.status` 兜底），种子素材已补齐 `assetStatus`，首页正常显示。

## 素材列表与选择

- 素材过滤：`getFilteredAssets()`（`app-utils.js:1`）对 `assetStatus`/`auditStatus` 取数，且对主状态有 `|| asset.status` 兜底。
- 排序：`sortAssets()`（`app-utils.js:83`）。
- 筛选匹配：`matchFilter()`（`app-utils.js:94`）。
- 上传时间筛选：`showUploadTimeFilterMenu()`（`app-actions.js`）+ `matchUploadTimeFilter()`（`app-utils.js:141`）。
- 素材卡片：`renderAssetCard()`（`app-render.js`）；平铺/分组：`renderCompactAssets()` / `renderDateGroupedAssets()`。
- 勾选/全选/批量条：`bindAssetEvents()`；已选集合：`state.selectedIds`；素材篮计数：`updateBasketCount()`（`app-actions.js`）。

## 筛选与排序

- 默认筛选项：`filterLabels`（`app-core.js`）；可配置筛选项：`getConfigurableFilters()`（用 `new Set` 去重）。
- 筛选 chip 渲染：`renderFilterChips()`；筛选配置弹窗：`renderFilterConfig()`（`app-core.js`）。
- 浮层菜单防越界：`positionFloatingMenu()`（`app-actions.js`）。
- 素材菜单：`showAssetMenu()`；普通筛选菜单：`showFilterMenu()`；筛选树渲染：`renderFilterTree()`；筛选值来源：`getFilterValues()`（从 `db.valueListTree` 动态读取，`buildCascadeTree()` 支持级联）。
- 多选状态规范：`state.filters[label]` 保存数组。
- 排序下拉静态项（`index.html`）；排序状态：`state.sort`。

### 筛选树形结构规范

- 树形节点有 `selectable` 属性，`true` 可选中，`false` 仅作分类标题。
- 品牌：可选中顶级节点，无子节点。
- 车系：按品牌筛选值过滤，返回扁平列表。
- 车型：按品牌和车系筛选值过滤，返回扁平列表。
- 内饰色/外饰色：按车型筛选值过滤。
- 文件格式、业务标签、AI标签：保持树形结构。

## 日期时间（规范：存储 = 显示 = YYYY-MM-DD 短横线，禁止 / 与 - 互转）

- 统一日期控件入口：`initDatePicker()`（`app-infra.js:159`）。flatpickr 接管时 `dateFormat:"Y-m-d"` 强制显示 `YYYY-MM-DD`，不受浏览器/系统区域影响；库文件在 `index.html` 的 `vendor/flatpickr/` 本地加载，且必须在 `app-infra.js` 之前加载。
- 日期 input 统一由 flatpickr 接管并显示 `YYYY-MM-DD`；`readonly` 仅阻止手填，不应再用 `clickOpens:false` 禁止打开日历。
- `type="time"` 不交给 flatpickr，走原生 `lockNativePicker`（time 无斜杠问题）。
- flatpickr 未加载时降级原生 `lockNativePicker`（中文环境会显示 `YYYY/MM/DD`，仅离线兜底）。
- 项目内初始化：`initProjectDatePickers()`（`app-render.js`），每个弹框打开时以 modal 元素为 scope 调用。
- **规范存储格式 = 显示格式 = `YYYY-MM-DD HH:mm`**（短横线，与存储一致，全程禁止 `/`↔`-` 互转）。原生 `<input type="date">` 的 `value` 同样是 `YYYY-MM-DD`。
- 所有格式转换收敛到 `app-utils.js` 的日期层，禁止业务代码散写 `replaceAll`/`replace`：
  - `toISODate(value)`：任意输入→ISO 或原样透传。
  - `toJsDate(value)`：统一走 ISO 给 `new Date()` 解析。
  - `toInputDateValue(value)`：原生 `<input type="date">` 的 value（ISO 取前 10 位）。
  - `parseDateTimeText()`：兼容 `-`/`/`/`.` 输入，输出 `{date:YYYY-MM-DD, time:HH:mm}`。
  - `joinDateTime(date, time)`：组合为 ISO 存储串（入参 date 已是 `YYYY-MM-DD`，不做转换）。
  - `formatDateTimeDisplay(value)`：显示 `YYYY-MM-DD HH:mm`（短横线，非日期如“永久有效”原样返回）。
  - `dateTimeTextToTimestamp(value)`：转时间戳。
  - `normalizeDbDates(db)`：启动期整库日期字段归一化为 ISO（自愈历史 `/` 数据），对种子为 no-op。

## 素材有效期

- 核心原则：数据库存储精确 ISO 日期（`YYYY-MM-DDTHH:mm:ss`），状态由精确日期对比当前时间动态计算；页面显示统一 `YYYY-MM-DD HH:mm`（短横线，与存储一致，不做转换）。
- 精确日期生成：`getExpireDate()` / `calculateExpireTime()`（`app-core.js`，"永久有效"转 100 年后日期，均输出 ISO）。
- 状态计算：`getValidityStatus()` / `getValidityStatusClass()`（`app-render.js`）。
- 有效期格式化：`formatAssetValidUntil()`（`app-render.js`）。
- 编辑素材信息：`openEditAssetModal()` / `handleEditAssetSubmit()`（`app-actions.js`）。
- 有效期管理页面：`renderValidityPage()`（`app-render.js`）。
- 上传设置：`openUploadSettingsModal()`（`app-actions.js`）。
- 创建素材：`createAssetFromFile()`（`app-actions.js`）。

## 上传与导入

- 上传按钮菜单（`index.html`）+ `handleUploadMenu()`（`app-actions.js`）。
- 上传设置弹窗逻辑 `openUploadSettingsModal()`；上传文件格式白名单由 `getAllowedUploadFormats()` 从值列表树动态获取。
- 文件格式分类：`getFormatCategory()`（调用 `getFileFormatCategoriesFromTree()`）；校验：`isAllowedUploadFile()`。
- 文件读取：`readFileAsDataUrl()`；媒体信息：`getMediaInfo()`；AI 标签识别：`recognizeTags()`；车型识别：`detectVehicleModel()`。
- 百度网盘导入：`openCloudImportModal()`（`app-actions.js`）。

### 上传逻辑统一

- **内部上传**：`handleFiles()` 自动创建一个系统内部上传收集任务（`status=active`、`auditStatus=pending_audit`、`types=["其他"]`、绑定目标 `groupId`），上传素材写入 `assetStatus=pending`、`auditStatus=pending_audit`、`asset_source=internal`，进入待入库页面。
- **外部上传**：通过收集链接上传，暂存阶段为 `pending_submit`，提交后任务和素材进入 `pending_audit`；任务允许文件类型来自文件格式值列表，选择“其他”时不限制上传格式。

## 素材组

- 树渲染：`renderGroups()`（`app-render.js`）；树排序和层级：`getOrderedGroups()` / `syncGroupDepths()`；折叠：`toggleGroupCollapse()`。
- 素材组菜单：`showGroupMenu()` / `handleGroupAction()`（`app-actions.js`）。
- 新建/编辑/移动素材组：`openGroupModal()` / `openGroupEditModal()` / `openMoveGroupModal()`（`app-actions.js`）。

## 素材详情与查看器

- 查看器 HTML（`index.html`）；打开：`openViewer()`；渲染：`renderViewer()`；序列：`getViewerSequence()`（`app-actions.js`）。
- 缩放/平移：`bindViewerPan()` / `bindViewerResize()` / `updateZoomDisplay()`。
- 详情面板布局：`applyDetailPanelLayout()`（`app-render.js`）。
- 素材编辑：`openEditAssetModal()`（`app-actions.js`）；候选下拉：`setupAssetEditDropdown()` / `setupAssetEditCascades()`（品牌→车系→车型→内饰色/外饰色级联）。

## 标签管理

- 标签页入口：`renderTagsPage()`（`app-render.js`）；标签汇总：`getTagSummary()`；标签编码：`generateTagCode()` / `normalizeStoredTagCodes()`。
- 标签表格：`renderTagTableBody()`；标签树扁平化：`flattenTagTree()`。
- 新增/编辑/合并：`openAddTagModal()` / `openEditTagModal()` / `openMergeTagModal()`（`app-render.js`）。
- AI 识别字段：`.checkbox-label` CSS 有 `display: flex !important`，必须用 `classList.toggle("hidden")` 控制显隐，不能用 `style.display`。
- **标签两套体系**：业务/AI 标签存于 `db.tags`（字段 `tagName/tagCode/tagType/parentId/level/aiSource`），与 `db.valueListTree` 相互独立；筛选时业务标签/AI标签通过 `getTagCode/getTagName` 解析。

## 分享与收集

- 分享素材组/单素材/素材篮弹窗：`openShareCurrentModal()` / `openShareAssetModal()` / `openBasketShareModal()`（`app-workflows.js`）。
- 分享记录管理弹窗：复用收集任务配置弹框结构，`openShareRecordConfigModal()`；分享状态下拉从 `share_status` 值列表动态生成，保存时若状态为“已撤销”或“已过期”，记日志并置失效时间；无独立 `revokeShare()` 函数。
- 创建收集任务：`openCollectTaskModal()` / `handleCollectTaskSubmit()`（`app-actions.js`）；存放素材组用 `groupId` 下拉树（可为空）。
- 收集任务允许文件类型：`getAllCollectTaskTypes()` 动态刷新；选“其他”时不限制上传格式。
- 模拟收集上传：`openCollectorUploadModal()`（`app-workflows.js`）；审核模拟：`simulateMachineAudit()` / `simulateHumanAudit()`。

### 分享访问密码

- `db.shares` 含 `requirePassword`/`password`；`normalizeShareSecurity()` 给老分享补默认值；`buildShareSecurity()` 处理密码生成；外部分享页增加密码校验，校验通过后用 sessionStorage 记录。

## 回收站

- 页面渲染：`renderRecyclePage()`（`app-render.js`）；清空：`emptyRecycleBin()`。
- 删除时间排序：`toggleRecycleDeletedTimeSort()` / `sortRecycleItems()`。
- 素材恢复/硬删：`restoreAsset()` / `hardDeleteAsset()`；批量恢复：`restoreSelectedRecycleAssets()`（`app-workflows.js`）。
- 回收站已去掉素材组功能；删除“组及素材”时，素材进入回收站，素材组直接移除。

## 权限与所有者

- 修改权限弹窗：`openPermissionModal()`（`app-workflows.js`）；申请权限弹窗：`openPermissionRequestModal(id, type)`（asset/group 两种）。
- 所有者弹窗：`openOwnerModal()`（`app-workflows.js`）。
- 权限判断：`isAdmin()` / `canManageAsset()`（`app-core.js`）。

### 权限管理弹窗

- 组权限设置：`openGroupPermissionModal(groupId)`（`app-workflows.js`），3 个 Tab（成员与权限/权限交接/操作日志）。
- 素材权限设置：`openAssetPermissionModal(assetId)`（`app-workflows.js`），继承权限只读 + 单独授权区域。
- 操作日志列表模板：`tplOperationLogList`，组和素材权限弹窗共用。

### 分享体系升级

- 三个分享弹窗新增字段：访问范围、密码保护、内容权限、有效期（7/30/90/永久）、最大访问次数。
- 公共函数：`populateShareDropdowns(prefix)` / `bindShareExpireButtons(prefix)` / `bindSharePasswordToggle(prefix)` / `bindShareAccessScopeChange(prefix)` / `getShareFormData(prefix)`。
- 内容权限限制：用户无 download 权限时“可下载”选项置灰。

### 分享落地页鉴权链路（`renderSharePortal`）

- 顺序：状态校验 → 有效期校验 → 访问次数校验 → 访问范围校验 → 密码校验 → 内容展示 → 访问计数。
- 状态校验：`share.status !== 'active'` → “分享已失效”。
- 有效期校验：`isShareRecordExpired(share)`（对象版）过期后自动标记 `status='expired'`；通用日期过期用 `isShareExpired(expiresAt)`（字符串版）。两者函数名已区分，无历史覆盖问题。
- 访问次数校验：`maxVisits != null && visits >= maxVisits` → 自动失效。
- 访问范围校验：internal 需要登录，public 直接放行。
- 密码校验：`requirePassword === true` 时弹出密码框。
- 内容展示：根据 `contentPermission` 控制下载按钮显隐。
- 访问计数：有效访问后 `visits + 1`，达到上限自动标记失效。
- 分享 internal 范围判断用 `share.ownedByDept !== currentUser.department`（`app-core.js:2415`），双方均为组织名；种子数据原存组织 ID（`org-market`）已统一改为组织名（`市场部`），与运行时一致，不再误判。

## 系统管理

- 入口层级：左侧菜单树“系统管理”分组，子菜单为用户管理、角色管理、组织管理、权限管理、菜单管理。
- 数据结构：`db.users`（含 `roleIds` 数组多角色、`phone`、`email`）；`db.organizations`；`db.roles`（含 `roleId`）；`db.orgPermissions`；`db.userPermissions`。
- 登录日志：`db.loginLogs` 保存 `{ username, name, loginAt, ip, entry }`。
- 默认账号：`admin / admin123`（超级管理员）、`kerry / kerry123`（素材运营）、`tagview / tag123`（标签只读）。
- 默认数据补齐：`ensureSystemData()` 初始化组织、角色、用户，并为每个角色/组织/用户补齐 `db.menus` 中所有菜单的 `visible/editable` 权限。
- 页面白名单：`normalizePageState()` 的 `validPages` 由 `getAllMenuPages()` 动态获取；标题映射由 `render()` 从 `db.menus` 动态生成 `menuTitleMap`；面包屑：`getPageBreadcrumb()` 动态遍历 `db.menus` 父链。
- 权限判断：`getMenuPermission()` / `canViewMenu()` / `canEditMenu()`。
- 菜单过滤：`isVisibleNavMenu()` / `getVisibleNavMenuChildren()`。
- 渲染分发：`renderManagePageV2()` 使用 `directRenderers` 映射表分发。
- 值列表扩展：`material_manage` 维度下含授权主体类型、素材组权限等级、素材权限等级、分享访问范围、分享内容权限、权限申请状态、操作类型、素材状态等，禁止硬编码权限枚举数组。
- 数据模型扩展：统一审计字段（createdBy/createdAt/ownedBy/ownedByDept/updatedAt）；`db.groupAcl` / `db.assetAcl` / `db.permissionRequests` / `db.operationLogs`；`db.shares` 扩展 accessScope/contentPermission/maxVisits/status；双写日志体系；`logOperation()` 统一日志函数。
- 权限校验体系：`buildUserGroupPermissionCache()` + `groupPermissionCache`；`getPermissionWeight()` 从值列表取权重；`hasGroupPermissionLevel()`；`getGroupEffectiveAcl()` 递归合并父组 ACL；`aclMatchesCurrentUser()` 统一匹配人员/部门/公司；素材组权限 `canViewGroup/canDownloadFromGroup/canContributeToGroup/canManageGroup`；素材权限 `canViewAsset/canEditAsset/canDownloadAsset/canDeleteAsset/canRestoreAsset/canPurgeAsset/canMoveAsset`；分享权限 `canCreateShare/canManageShare`；标签/收集权限 `canManageTag/canManageCollect`；组移动与循环检测 `canMoveGroup/isGroupDescendant`；`getFilteredAssets()` 按页面和权限返回素材，`isPendingAsset()` 统一待入库判断。

### 树展开/折叠规范

- 所有树状结构（组织树、权限树、菜单树等）使用明确 `+/-` 展开收起图标并真正支持收缩。
- 用户管理和权限相关树每次打开默认展开；点击 `+/-` 只做当前 DOM 的临时展开收起。
- `bindTreeToggleEvents()` / `applyTreeToggle()` 统一处理树展开/折叠。

## 值列表管理

- 页面状态值：`valueLists`；菜单入口由 `db.menus` 中 `page="valueLists"` 驱动。
- 渲染入口：`renderValueListPage()`（`app-render.js`）。
- 页面布局：左侧树 + 右侧搜索表格（`styles.css` `.value-list-layout`：grid 260px+1fr）。
- 左侧树：`renderValueListTreeNodes(tree, null, 0)` 递归渲染；右侧：搜索栏 + 操作按钮 + 面包屑 + 子节点表格。
- 弹框：`#valueListModal`，`renderValueListRefIdDropdown()` / `bindRefIdDropdownEvents()` 树状下拉组件；保留旧弹框 `#valueListItemListModal` / `#valueListItemFormModal`（不再被新布局调用）。
- 事件绑定：页面级 `bindValueListEvents()`；弹框级 `initValueListModalEvents()`（在 `bootstrap()` 中绑定）。

## HTML 固定可变数据清单（后续动态化时优先检查）

- 排序项（`index.html`）：固定写死；排序实现在 `sortAssets()`。
- 相似搜索模式（`index.html`）：固定写死。
- 权限选项（`index.html`）：多处固定写死。
- 分享访问范围与有效期（`index.html`）：固定写死。
- 标签类型与 AI 来源（`index.html`）：固定写死。
- 收集任务允许文件类型（`index.html`）：静态兜底，打开弹窗时从 `getAllCollectTaskTypes()` 动态刷新。
- 收集任务状态（`index.html`）：固定写死。
- 有效期提醒选项（`index.html`）：固定写死。
- 品牌、公司名、搜索提示：`renderShell()` 动态写入，但值仍硬编码在 JS。
- 筛选项名称：`filterLabels`（`app-core.js`）。
- 筛选值来源：`getFilterValues()`（`app-actions.js`），素材来源已从 `source` 值列表动态读取；剩余固定值如失效日、时长、创建时间仍写在 JS。

## 历史痕迹与注意事项

- 左侧主导航已删除“我收藏的组”功能模块入口；`favorite` 页面筛选/标题/面包屑已移除，旧链接进入 `page=favorite` 会通过 `normalizePageState()` 回退到 `all`。
- `ensureSystemData()` 不再每次启动覆盖用户菜单；但补齐默认菜单中新增但本地缺失的节点（如 `menu_home`）。
- `render()` 中标签页渲染分支必须先于 `isManagePage()` 管理页分支判断，否则 `tags` 会被识别为管理页。
- `renderManagePageV2()` 使用 `directRenderers` 映射表，未知管理页显示空态“暂无对应管理页面”。
- 已删除废弃常量：`FILE_FORMAT_CATEGORIES`、`UPLOAD_FILE_FORMATS`、`UPLOAD_ACCEPT`、`COLLECT_TASK_FILE_TYPES`、`ASPECT_RATIOS`、`VEHICLE_MODELS`、`SYSTEM_MENUS`，全部改为从值列表树动态读取。
- 已删除旧函数：`showMoreMenu()`、`getManagedPages()`、`applyMenuPermissions()`、`isMenuPage()`、`updateShareExpireModal` 系列函数。
- 素材编辑弹框不再使用原生 `datalist`，改为 `.asset-edit-combo` 结构 + `setupAssetEditDropdown()`。
- 内饰色/外饰色在素材编辑弹框中是单选字段，保存时写入数组但最多保留一个值。
- `db.shares` 和 `db.collectTasks` 含 `requirePassword`/`password` 字段，老数据由 `normalizeShareSecurity`/`normalizeCollectTaskSecurity` 补默认值。
- 禁止使用 PowerShell `Set-Content` 整文件重写（曾导致中文字符串损坏），继续使用 Edit/Write 做局部修改；CODE_MEMORY.md 必须保存为 UTF-8（带 BOM）。
- **数据迁移函数命名已变更**：不要查找 `migrate*` 系列，实际归一化逻辑在 `normalizeDbDates` / `normalizeDbSelectionCodes` / `normalizeStoredTagCodes` / `normalizeShareSecurity` / `normalizeCollectTaskSecurity`。

## 已知功能逻辑问题（修复记录）

以下问题为代码审查发现。**#1–#4 已于 2026-07-14 在代码中修复**（种子数据规范化 + `isPendingAsset` 补 `deletedCodes` 排除 + 部门字段统一为组织名 + 枚举改存 code），仅 #5 仍存留（低风险，暂无需处理）：

1. ~~🟠 首页/可见列表对种子素材失效~~ **已修复**：种子素材改为带 `assetStatus:"active"` 与 `auditStatus:"machine_pass"`，首页热榜/最新/素材组卡片恢复正常显示。
2. ~~🟠 `isPendingAsset` 未排除 `deleted`/`disabled`~~ **已修复**：开头新增 `if (statusConfig.deletedCodes.includes(assetStatus)) return false;`，已删/禁用素材不再误入待入库。
3. ~~🟡 部门字段 ID/名称混用~~ **已修复**：种子 `ownedByDept`/`department`/`operatorDept` 由组织 ID（`org-market`）统一改为组织名（`市场部`），与运行时 `currentUser.department` 一致，种子 internal 分享不再误判“无权访问”。
4. ~~🟡 业务枚举存展示串而非 code~~ **已修复**：种子 `brand`/`series`/`model`/`permission` 改为值列表 code（`peugeot`/`citroen`/`4008`/`c5-aircross`/`.code`/`downloadable`），与运行时一致；全局搜索行改用 `getValueListName` 保持展示。

5. ⚪ **值列表跨维度重复 code 隐患**：`getTreeNodeByCode(code)` 无维度时返回全树第一个匹配，`active`/`disabled`/`expired`/`completed`/`enabled` 等 code 在多个维度重复。当前关键调用均传维度，暂未触发错误，但无维度调用（如 `logOperation` 用 `getTreeNodeByCode(action)`）存在潜在静默误取风险。

## 点检建议

- 改筛选/排序：先测顶部筛选、多选、排序菜单、素材数量、控制台。
- 改标签：先测标签管理页表格、卡片、编辑、新增、合并、AI 标签跳转筛选。
- 改日期：先测 `readonly`、日期控件可选择、不能手填、提交值格式。
- 改分享/收集：先测创建链接、复制链接、过期时间、收集任务落地页、密码门。
- 改回收站：先测软删、恢复、硬删、清空、删除时间排序。
- 改首页/列表：确认种子素材在首页可见（见“已知功能逻辑问题”#1）。
