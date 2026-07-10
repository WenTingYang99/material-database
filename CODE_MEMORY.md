# 代码记忆索引

> 最后核对日期：2026-07-10
> 用途：改动前先查本文件定位代码位置；如不能定位再回读完整相关文件，并补充新定位。

## 修改前流程

1. 先按需求关键词查本文件。
2. 能定位到模块和函数时，只读取对应函数附近代码，再做局部修改。
3. 不能定位时，再读取相关完整文件。
4. 修改后如果新增功能入口、状态字段、模板、动态数据来源，必须补充本文件。
5. 用户明确要求：每次更新代码前都先阅读本文件；如果代码结构或功能入口有变化，及时更新本文件。
6. 用户明确要求：收到"调整/修改/优化"类消息时，先说明对需求的理解并询问是否正确；用户确认后再开始修改。

## 文件职责

- `index.html`：静态骨架、模态框、模板（`<template>`）、脚本加载顺序。
- `styles.css`：全局布局、素材卡片、列表、弹窗、标签页、暗色模式、移动端样式。
- `app-infra.js`：基础设施封装（IIFE），包括 Toast、Modal.confirm、Loading、`http`、`initDatePicker`、`debounce`。
- `app-core.js`：种子数据、全局 `db/state/els`、初始化、数据迁移、主壳渲染、全局事件绑定、菜单系统、收集/分享落地页。
- `app-render.js`：主渲染入口、素材列表/卡片、管理页分发、回收站、标签管理页、值列表管理页、菜单管理页、系统管理页（用户/角色/组织/权限）、标签新增编辑合并。
- `app-actions.js`：上传、筛选菜单（树形结构）、侧边栏、素材组菜单、素材菜单、查看器、素材/素材组表单、收集任务创建、素材篮计数、素材编辑候选下拉。
- `app-workflows.js`：素材篮抽屉、分享（创建/记录管理）、收集任务配置/模拟上传、有效期/所有者/权限、删除/恢复/预览/下载。
- `app-utils.js`：过滤、排序、相似度、面包屑、日期时间格式、标签拆分、转义、空态、筛选匹配函数。
- `app.js`：启动入口，只调用 `bootstrap()`。

## 数据与状态

- 持久化 key：`app-core.js:1` `STORAGE_KEY = "dp-material-library-state-v2"`。
- 默认素材组：`app-core.js:3` `defaultGroups`。
- 种子素材名：`app-core.js:13` `seedNames`。
- 值列表种子树：`app-core.js:28` `SEED_VALUE_LIST_TREE`（统一树模型，包含素材库筛选维度和素材管理维度）。
- 种子素材：`app-core.js` `seedAssets`（使用 `assetStatus` / `auditStatus`，含 `series/interiorColors/exteriorColors/creator/lastUpdate/asset_source/collect_id/collect_link`）。
- 种子标签：`app-core.js:329` `seedTags`。
- 默认筛选项：`app-core.js:373` `filterLabels`。
- 会话 key：`app-core.js:375` `SESSION_USER_KEY`。
- 全局数据库：`app-core.js:376` `db = loadDb()`，紧接 `ensureSystemData()`。
- 全局状态：`app-core.js:378` `state`。
- 当前用户：`app-core.js:422` `currentUser`。
- DOM 缓存：`app-core.js:600` `els`。
- 读库：`app-core.js:1009` `loadDb()`。
- 存库：`app-core.js:1032` `saveDb()`。
- 数据迁移：`app-core.js:853` `migrateVehicleModels()`，`app-core.js:899` `migrateShareExpiresAt()`，`app-core.js:959` `migrateAssetMetadata()`，`app-core.js:948` `migrateCollectTaskSecurity()`。

### 素材状态体系

- `assetStatus` 是素材主状态，来自值列表 `asset_status`，当前核心值包括 `pending`、`active`、`deleted`、`disabled`。
- `auditStatus` 是审核链路状态，来自值列表 `audit_status`，覆盖待提交、待审核、机审、人审和终审通过等节点。
- 素材库展示已入库素材：`assetStatus=active` 且当前用户 `canViewAsset(asset)`。
- 待入库展示口径：`isPendingAsset(asset)`，包含 `assetStatus=pending` 或 `assetStatus` 非 active 且 `auditStatus` 未终审通过的素材；`assetStatus=active` 的素材一定不算待入库。
- 回收站展示口径：`assetStatus` 命中 `getAssetStatusConfig().deletedCodes`。
- 入库动作：`approveSelectedAssets()` 将命中素材写为 `auditStatus=human_pass`、`assetStatus=active`。

### 值列表统一树模型

- `db.valueListTree`：单一数组，节点字段 `id, code, name, type, parentId, refId, description, attr1, attr2, status, sortOrder`。
- type 取值：`root`/`dimension`/`group`/`value`。
- 树根："值列表"（`vl_root`），子节点包含"素材库筛选"（`vl_dim_matlib`）和"素材管理"（`vl_dim_matmanage`）。
- 树派生函数（`app-core.js`）：
  - `getTreeChildren(parentId)` :179
  - `getTreeNodeById(id)` / `getTreeNodeByCode(code)` / `getTreeNodeByName(name)` :183/:186/:189 (注: getTreeNodeByName 可能不存在，需核实)
  - `getDimensionNodes(parentDimId)` :189
  - `buildFilterTree(dimCode, parentId)` :194
  - `getAllLeafValues(dimCode)` :204
  - `getAllUploadAccept()` :218
  - `getAllCollectTaskTypes()` :222
  - `getVehicleModels()` :227
  - `getFileFormatCategoriesFromTree()` :230
  - `getAspectRatiosFromTree()` :249
  - `getAllowedUploadFormats()` :255
  - `getFilterLabels()` :258
  - `getConfigurableFilters()` :262

### 菜单系统

- `db.menus`：动态菜单树，节点字段 `id, name, page, parentId, category, layout, icon, valid, hidden, sortOrder, visible, editable`。
- `getManagedPages()` 已删除；当前使用 `getAllMenuPages()` (:464) 获取所有页面菜单。
- `isAssetPage(page)` :470 / `isManagePage(page)` :474 判断页面类型。
- `getDefaultMenus()` :691 返回初始菜单树。
- `ensureSystemData()` :716 仅在 `db.menus` 缺失/空时初始化，不覆盖用户修改。
- 权限函数：`getMenuPermission(menuId)` :570，`canViewMenu(menuId)` :583，`canEditMenu(menuId)` :587。
- `isVisibleNavMenu(menu)` :487 / `getVisibleNavMenuChildren(parentId)` :493 过滤左侧菜单。
- `normalizePageState()` :829 的 `validPages` 改为 `getAllMenuPages()` 动态获取。

## 主流程

- 启动：`app.js` -> `bootstrap()`。
- 初始化：`app-core.js:798` `bootstrap()`。
- URL 参数处理：`app-core.js:838` `applyHashState()`。
- 主壳同步：`app-core.js:1621` `renderShell()`。
- 主渲染入口：`app-render.js:10` `render()`。
- 全局事件绑定：`app-core.js:1718` `bindEvents()`。
- 左侧菜单树渲染：`app-core.js:1660` `renderMainNav()` / `app-core.js:1682` `renderMainNavNodes()`。

## 页面定位

### HTML 骨架（index.html）

- 顶部栏：`:11-36`（含应用菜单按钮、搜索框、通知/语言/用户按钮）。
- 侧边栏：`:38-50`（含关闭按钮、`#mainNav`、素材组树、收起手柄）。
- 页面头部（面包屑+标题+操作按钮）：`:54-96`。
- 素材工具栏（筛选+布局+排序）：`:98-121`。
- 以图搜图区：`:123-131`。
- 内容区：`:133` `#contentPanel`。
- 查看器：`:221-258`。
- 素材篮抽屉：`:260-277`。
- 更多菜单浮层：`:279-289`（`#moreMenuContent` 由 JS 动态渲染）。

### 弹框/模板（index.html）

| 弹框/模板 | 行号 | 说明 |
|---|---|---|
| `#basketValidityModal` | 291-314 | 素材篮批量有效期 |
| `#basketShareModal` | 316-359 | 素材篮分享（含密码字段） |
| `#addTagModal` | 362-383 | 新增标签 |
| `#editTagModal` | 385-407 | 编辑标签 |
| `#mergeTagModal` | 409-435 | 标签合并（checkbox 勾选列表） |
| `#editAssetModal` | 438-511 | 编辑素材（.asset-edit-combo 结构） |
| `#shareAssetModal` | 513-545 | 单素材分享（含密码字段） |
| `#addGroupModal` | 548-563 | 新建素材组 |
| `#editGroupModal` | 565-580 | 编辑素材组 |
| `#moveGroupModal` | 582-596 | 移动素材组 |
| `#addToGroupModal` | 598-612 | 添加到素材组 |
| `#uploadSettingsModal` | 615-636 | 上传设置 |
| `#cloudImportModal` | 638-656 | 百度网盘导入 |
| `#collectTaskModal` | 658-687 | 创建收集任务 |
| `#shareGroupModal` | 689-721 | 素材组分享（含密码字段） |
| `#valueListModal` | 737-770 | 值列表新增/编辑（含树状 refId 下拉） |
| `#valueListItemListModal` | 773-815 | 值列表选项查看（旧，保留兼容） |
| `#valueListItemFormModal` | 818-840 | 值列表小类表单（旧，保留兼容） |
| `<template id="tplConfirmModal">` | 723-734 | 确认弹框模板 |
| `<template id="tplGlobalLoading">` | 842-847 | 全局 Loading 模板 |
| `<template id="tplFormModal">` | 849-859 | 通用表单弹框模板 |
| `<template id="tplUploadSettingsForm">` | 861-872 | 上传设置表单模板 |
| `<template id="tplCloudImportForm">` | 874-886 | 网盘导入表单模板 |
| `<template id="tplCollectTaskConfigForm">` | 888-906 | 收集任务配置模板 |
| `<template id="tplShareRecordConfigForm">` | 908-928 | 分享记录管理模板 |
| `<template id="tplCollectorUploadForm">` | 930-943 | 外部收集上传模板 |
| `<template id="tplAssetValidityForm">` | 945-955 | 素材有效期表单模板 |
| `<template id="tplOwnerForm">` | 957-961 | 所有者表单模板 |

### JS 渲染入口（app-render.js）

| 函数 | 行号 | 说明 |
|---|---|---|
| `getPageMenus()` | 1 | 从 db.menus 获取页面菜单列表 |
| `render()` | 10 | 主渲染入口，分发到素材页或管理页 |
| `renderActions()` | 254 | 顶部操作按钮显示逻辑 |
| `renderAssets()` | 268 | 素材列表渲染（平铺/分组） |
| `renderCompactAssets()` | 280 | 平铺视图 |
| `renderDateGroupedAssets()` | 285 | 日期分组视图 |
| `renderAssetCard()` | 302 | 素材卡片 |
| `renderMetadataList()` | 330 | 元数据列表（列表视图） |
| `renderList()` | 432 | 回收站列表视图 |
| `bindAssetEvents()` | 446 | 素材卡片事件绑定 |
| `renderManagePageV2()` | 529 | 管理页分发（directRenderers 映射表） |
| `renderActivityPage()` | 553 | 活动记录页 |
| `renderSharePage()` | 569 | 分享记录页 |
| `renderRecyclePage()` | 589 | 回收站页 |
| `renderCollectPage()` | 599 | 收集任务列表页 |
| `renderValidityPage()` | 623 | 有效期管理页 |
| `renderManageShell()` | 667 | 管理页外壳 |
| `renderValueListPage()` | 676 | 值列表管理页 |
| `renderMenuManagePage()` | 1180 | 菜单管理页 |
| `renderLoginLogPage()` | 1515 | 登录日志页 |
| `renderSystemManagePage()` | 1581 | 系统管理页（用户/角色/组织/权限分发） |
| `renderUserManagePage()` | 1642 | 用户管理页 |
| `renderRoleManagePage()` | 1739 | 角色管理页 |
| `renderOrganizationManagePage()` | 1767 | 组织管理页 |
| `renderPermissionManagePage()` | 1788 | 权限管理页 |
| `renderTagsPage()` | 2622 | 标签管理页 |
| `getTagSummary()` | 2469 | 标签汇总 |
| `renderTagTableBody()` | 2688 | 标签表格 |
| `emptyRecycleBin()` | 2375 | 清空回收站 |
| `toggleRecycleDeletedTimeSort()` | 2388 | 回收站排序切换 |
| `sortRecycleItems()` | 2394 | 回收站排序 |

### 落地页（app-core.js）

| 函数 | 行号 | 说明 |
|---|---|---|
| `renderCollectorPortal(code)` | 1077 | 收集任务落地页入口 |
| `renderCollectorPasswordGate()` | 1096 | 收集页密码门 |
| `renderCollectorPortalContent()` | 1122 | 收集页上传主体 |
| `renderSharePortal(token)` | 1369 | 分享落地页入口 |
| `renderSharePasswordGate()` | 1397 | 分享页密码门 |
| `renderSharePortalContent()` | 1423 | 分享页内容主体 |
| `getSharePortalAssets()` | 1391 | 分享页素材获取 |
| `downloadShareAssets()` | 1452 | 分享页批量下载 |
| `bindSharePortalDownloads()` | 1470 | 分享页下载事件绑定 |
| `ensureRuntimeElements()` | 1494 | 动态创建登录页 DOM |
| `handleLoginSubmit()` | 1559 | 登录提交 |
| `logoutCurrentUser()` | 1600 | 退出登录 |

## 素材列表与选择

- 素材过滤：`app-utils.js:1` `getFilteredAssets()`（素材库、待入库、回收站分别按 `assetStatus` / `auditStatus` 的当前口径取数）。
- 排序：`app-utils.js:82` `sortAssets()`。
- 筛选匹配：`app-utils.js:93` `matchFilter()`。
- 上传时间筛选：`app-actions.js:431` `showUploadTimeFilterMenu()`，匹配在 `app-utils.js:164` `matchUploadTimeFilter()`。
- 素材卡片：`app-render.js:302` `renderAssetCard()`。
- 平铺/分组：`app-render.js:280` / `app-render.js:285`。
- 元数据列表：`app-render.js:330` `renderMetadataList()`。
- 回收站列表：`app-render.js:432` `renderList()`。
- 勾选/全选/批量条：`app-render.js:446` `bindAssetEvents()`。
- 已选素材集合：`state.selectedIds`。
- 素材篮计数：`app-actions.js:1513` `updateBasketCount()`。

## 筛选与排序

- 默认筛选项：`app-core.js:373` `filterLabels`。
- 可配置筛选项：`app-core.js:262` `getConfigurableFilters()`（用 `new Set` 去重）。
- 筛选 chip 渲染：`app-core.js:1701` `renderFilterChips()`。
- 筛选配置弹窗：`app-core.js:1709` `renderFilterConfig()`。
- 浮层菜单防越界：`app-actions.js:301` `positionFloatingMenu()`。
- 素材菜单：`app-actions.js:863` `showAssetMenu()`。
- 普通筛选菜单：`app-actions.js:326` `showFilterMenu()`。
- 筛选树渲染：`app-actions.js:399` `renderFilterTree()`。
- 筛选值来源：`app-actions.js:484` `getFilterValues()`（从 `db.valueListTree` 动态读取，`buildCascadeTree()` 支持级联）。
- 多选状态规范：`state.filters[label]` 保存数组。
- 排序下拉静态项：`index.html:113-118`。
- 排序状态：`state.sort`。

### 筛选树形结构规范

- 树形节点有 `selectable` 属性，`true` 可选中，`false` 仅作分类标题。
- 品牌：可选中顶级节点，无子节点。
- 车系：按品牌筛选值过滤，返回扁平列表。
- 车型：按品牌和车系筛选值过滤，返回扁平列表。
- 内饰色/外饰色：按车型筛选值过滤。
- 文件格式、业务标签、AI标签：保持树形结构。

## 日期时间（规范：存储 = 显示 = YYYY-MM-DD，全程短横线，禁止 / 与 - 互转）

- 统一日期控件入口：`app-infra.js:157` `initDatePicker()`。**日期统一用 flatpickr 接管**（`dateFormat:"Y-m-d"` → 强制显示 `YYYY-MM-DD`，不受浏览器/系统区域影响，中文环境也不会变 `YYYY/MM/DD`）；库文件在 `index.html` 的 `vendor/flatpickr/` 本地加载（`flatpickr.min.js` + `flatpickr.min.css` + `flatpickr-theme.css`），且必须在 `app-infra.js` 之前加载，保证首次 `initDatePicker` 时 `window.flatpickr` 已存在。
- 节点原本 `readonly` 的日期 input（如有效期回填、上传设置默认值）：flatpickr 设 `clickOpens:false`，只显示 `YYYY-MM-DD` 不可改；原本可编辑的（如分享/收集任务失效日期）：可点开日历选日期，显示同样是 `YYYY-MM-DD`。
- `type="time"` 不交给 flatpickr，走原生 `lockNativePicker`（time 无斜杠问题）。
- flatpickr 未加载时的降级分支：原生 `lockNativePicker`（中文环境会显示 `YYYY/MM/DD`，仅作离线兜底）。
- 项目内初始化：`app-render.js:44` `initProjectDatePickers()`，每个弹框打开时以 modal 元素为 scope 调用，确保动态插入的日期 input 也被接管。
- **规范存储格式 = 显示格式 = `YYYY-MM-DD`**（日期部分短横线，时间 `HH:mm`，存储串为 ISO `YYYY-MM-DDTHH:mm:ss`；用户 2026-07-10 最终确认：数据库存短横线，页面显示也必须短横线，绝不做 `/`↔`-` 互相转换）。原生 `<input type="date">` 的 `value` 同样是 `YYYY-MM-DD`（HTML 规范，无需转换）。
- 所有格式转换收敛到 `app-utils.js` 的日期层，禁止业务代码散写 `replaceAll`/`replace`：
  - `toISODate(value)`：任意输入（YYYY/MM/DD HH:mm、YYYY-MM-DD HH:mm、ISO、永久有效、null）→ ISO 或原样透传。
  - `toJsDate(value)`：统一走 ISO 给 `new Date()` 解析，规避浏览器对 `YYYY/MM/DD` 的差异。
  - `toInputDateValue(value)`：原生 `<input type="date">` 的 value（ISO 取前 10 位 `YYYY-MM-DD`）。
  - `parseDateTimeText()`：兼容 `-`/`/`/`.` 输入分隔符，输出显示用 `{date:YYYY-MM-DD, time:HH:mm}`（短横线，与存储一致）。
  - `joinDateTime(date, time)`：组合为 ISO 存储串（入参 date 已是 `YYYY-MM-DD`，**不做任何 `/`↔`-` 转换**）。
  - `formatDateTimeDisplay(value)`：显示 `YYYY-MM-DD HH:mm`（短横线，与存储一致）；非日期（如"永久有效"）原样返回。
  - `dateTimeTextToTimestamp(value)`：转时间戳。
  - `normalizeDbDates(db)`：启动期对整库日期字段归一化为 ISO，**仅用于自愈旧版 localStorage 中遗留的 `/` 或 `-` 数据**；种子数据本身已是 ISO，故对种子为 no-op。在 `app-core.js:bootstrap()` 的 `ensureSystemData()` 之后调用。
- 日期文本：`app-utils.js` `todayText()`（返回 `YYYY-MM-DD`），`normalizeDateText()`（返回显示用 `YYYY-MM-DD`）。
- 时间戳比较：`dateTimeTextToTimestamp()`。
- 格式化显示：`formatDateTimeDisplay()`。
- 素材有效期弹窗：`app-workflows.js:314` `openValidityModal()`。
- 素材篮有效期：`app-workflows.js:37` `openBasketValidityModal()`。

## 素材有效期

- 核心原则：数据库存储精确 ISO 日期（`YYYY-MM-DDTHH:mm:ss`），状态由精确日期对比当前时间动态计算；页面显示统一 `YYYY-MM-DD HH:mm`（短横线，与存储一致，不做转换）。
- 精确日期生成：`app-core.js` `getExpireDate()`、`calculateExpireTime()`（"永久有效"转100年后日期，均输出 ISO `YYYY-MM-DDTHH:mm:ss`）。
- 数据迁移：`app-core.js` `migrateAssetMetadata()`；2026-07-10 起统一用 `normalizeDbDates(db)` 在启动期归一化。
- 状态计算：`app-render.js:386` `getValidityStatus()`，`app-render.js:423` `getValidityStatusClass()`。
- 有效期格式化：`app-render.js:381` `formatAssetValidUntil()`。
- 列表视图：`app-render.js:330` `renderMetadataList()`。
- 编辑素材信息：`app-actions.js:1118` `openEditAssetModal()`，`app-actions.js:1278` `handleEditAssetSubmit()`。
- 有效期管理页面：`app-render.js:623` `renderValidityPage()`。
- 上传设置：`app-actions.js:19` `openUploadSettingsModal()`。
- 创建素材：`app-actions.js:112` `createAssetFromFile()`。

## 上传与导入

- 上传按钮菜单：`index.html:62-68`，事件在 `app-actions.js:1` `handleUploadMenu()`。
- 上传设置弹窗：`index.html:615-636` + `<template id="tplUploadSettingsForm">` (861-872)，逻辑在 `app-actions.js:19`。
- 上传文件格式白名单：由 `app-core.js:255` `getAllowedUploadFormats()` 从值列表树动态获取。
- 文件格式分类：`app-utils.js:270` `getFormatCategory()`（调用 `getFileFormatCategoriesFromTree()`）。
- 文件格式校验：`app-utils.js:266` `isAllowedUploadFile()`。
- 文件读取：`app-actions.js:241` `readFileAsDataUrl()`。
- 媒体信息：`app-actions.js:250` `getMediaInfo()`。
- AI 标签识别：`app-actions.js:270` `recognizeTags()`。
- 车型识别：`app-actions.js:290` `detectVehicleModel()`。
- 百度网盘导入：`index.html:638-656` + `<template id="tplCloudImportForm">` (874-886)，逻辑在 `app-actions.js:39` `openCloudImportModal()`。

### 上传逻辑统一

- **内部上传**：`handleFiles()` 自动创建内部收集任务，素材写入 `assetStatus=pending`、`auditStatus=pending_audit`，进入待入库页面。
- **外部上传**：通过收集链接上传，关联收集任务 ID 和链接，提交后同样写入待入库状态。

## 素材组

- 树渲染：`app-render.js:160` `renderGroups()`。
- 树排序和层级：`app-render.js:190` `getOrderedGroups()`，`app-render.js:227` `syncGroupDepths()`。
- 折叠：`app-render.js:240` `toggleGroupCollapse()`。
- 素材组菜单：`app-actions.js:710` `showGroupMenu()`，`app-actions.js:738` `handleGroupAction()`。
- 新建素材组：`index.html:548-563`，逻辑在 `app-actions.js:1315` `openGroupModal()`。
- 编辑素材组：`index.html:565-580`，逻辑在 `app-actions.js:1347` `openGroupEditModal()`。
- 移动素材组：`index.html:582-596`，逻辑在 `app-actions.js:1379` `openMoveGroupModal()`。

## 素材详情与查看器

- 查看器 HTML：`index.html:221-258`。
- 打开查看器：`app-actions.js:940` `openViewer()`。
- 查看器渲染：`app-actions.js:955` `renderViewer()`。
- 查看器序列：`app-actions.js:1020` `getViewerSequence()`。
- 缩放/平移：`app-render.js:52` `bindViewerPan()`，`app-render.js:92` `bindViewerResize()`，`app-actions.js:1052` `updateZoomDisplay()`。
- 详情面板布局：`app-render.js:150` `applyDetailPanelLayout()`。
- 素材编辑：`index.html:438-511`，逻辑在 `app-actions.js:1118` `openEditAssetModal()`。
- 素材编辑候选下拉：`app-actions.js:1220` `setupAssetEditDropdown()`，`app-actions.js:1145` `setupAssetEditCascades()`（品牌→车系→车型→内饰色/外饰色级联）。

## 标签管理

- 标签页入口：`app-render.js:2622` `renderTagsPage()`。
- 标签菜单权限：`canViewMenu("tags")` / `canEditMenu("tags")` 控制操作按钮。
- 标签汇总：`app-render.js:2469` `getTagSummary()`。
- 标签编码：`app-render.js:2426` `generateTagCode()` 自动生成；`normalizeStoredTagCodes()` (:2444) 修正空编码/中文编码/重复编码。
- 标签表格：`app-render.js:2688` `renderTagTableBody()`。
- 标签树扁平化：`app-render.js:2610` `flattenTagTree()`。
- 标签事件：`app-render.js:2826` `bindTagEvents()`，`app-render.js:2831` `handleTagClick()`。
- 新增标签：`index.html:362-383`，逻辑在 `app-render.js:2896` `openAddTagModal()`；AI 字段显隐在 `app-render.js:2914` `toggleAddAiFields()`；提交在 `app-render.js:2923` `handleAddTagSubmit()`。
- 编辑标签：`index.html:385-407`，逻辑在 `app-render.js:3019` `openEditTagModal()`；`createTagRecordFromUsage()` (:2969) 补齐标签库记录；提交在 `app-render.js:3052` `handleEditTagSubmit()`。
- AI 识别字段：`.checkbox-label` CSS 有 `display: flex !important`，必须用 `classList.toggle("hidden")` 控制显隐，不能用 `style.display`。
- 合并标签：`index.html:409-435`，逻辑在 `app-render.js:3137` `openMergeTagModal()`；源标签选择为 checkbox 勾选列表（`#mergeSourceTags`）。

## 分享与收集

- 分享素材组弹窗：`index.html:689-721`，逻辑在 `app-workflows.js:69` `openShareCurrentModal()`。
- 分享单素材弹窗：`index.html:513-545`，逻辑在 `app-workflows.js:149` `openShareAssetModal()`。
- 素材篮分享：`index.html:316-359`，逻辑在 `app-workflows.js:51` `openBasketShareModal()`。
- 分享记录管理弹窗：`<template id="tplShareRecordConfigForm">`，逻辑在 `app-workflows.js` `openShareRecordConfigModal()`（复用收集任务配置弹框结构）。分享状态下拉从 `share_status` 值列表动态生成（生效中/已撤销/已过期），保存时若状态为"已撤销"或"已过期"，记 `share.revoke` 日志并置失效时间；不再有独立 `revokeShare()` 函数（已删除，逻辑并入此处）。
- 创建收集任务：顶部按钮 `index.html:87` `#newCollectTask`，弹窗 `index.html:658-687`，逻辑在 `app-actions.js:1458` `openCollectTaskModal()` / `app-actions.js:1470` `handleCollectTaskSubmit()`。
- 收集任务允许文件类型：`index.html:669-680` 静态兜底，打开弹窗时由 `getAllCollectTaskTypes()` (:222) 动态刷新。
- 收集任务配置模板：`<template id="tplCollectTaskConfigForm">` (888-906)，逻辑在 `app-workflows.js:195` `openCollectTaskConfigModal()`。
- 模拟收集上传：`<template id="tplCollectorUploadForm">` (930-943)，逻辑在 `app-workflows.js:236` `openCollectorUploadModal()`。
- 审核模拟：`app-workflows.js:278` `simulateMachineAudit()`，`app-workflows.js:296` `simulateHumanAudit()`。

### 分享访问密码

- `db.shares` 新增 `requirePassword` 和 `password` 字段；`migrateShareExpiresAt()` 通过 `normalizeShareSecurity()` (:923) 给老分享补默认值。
- 创建分享时可设置密码；`buildShareSecurity()` (:934) 处理密码生成。
- 分享记录"管理分享"弹框可后续修改密码。
- 外部分享页 `renderSharePortal()` 增加密码校验页，校验通过后用 sessionStorage 记录。

## 回收站

- 顶部按钮：`index.html:90-94`。
- 页面渲染：`app-render.js:589` `renderRecyclePage()`。
- 清空回收站：`app-render.js:2375` `emptyRecycleBin()`。
- 删除时间排序：`app-render.js:2388` `toggleRecycleDeletedTimeSort()`。
- 回收站排序函数：`app-render.js:2394` `sortRecycleItems()`。
- 素材恢复/硬删：`app-workflows.js:468` `restoreAsset()`，`app-workflows.js:502` `hardDeleteAsset()`。
- 批量恢复：`app-workflows.js:482` `restoreSelectedRecycleAssets()`。
- 回收站已去掉素材组功能；删除"组及素材"时，素材进入回收站，素材组直接移除。

## 权限与所有者

- 修改权限弹窗：`index.html:199-219`，逻辑在 `app-workflows.js:357` `openPermissionModal()`。
- 申请权限弹窗：`index.html:162-178`，逻辑在 `app-workflows.js:638` `openPermissionRequestModal(id, type)`，支持 asset/group 两种类型，权限等级从值列表动态取值。
- 所有者弹窗模板：`<template id="tplOwnerForm">` (957-961)，逻辑在 `app-workflows.js:340` `openOwnerModal()`。
- 权限判断：`app-core.js:424` `isAdmin()`，`app-core.js:428` `canManageAsset()`。

## 权限管理弹窗

### 组权限设置弹窗
- 入口：组右键菜单 → 权限设置（canManageGroup 可见）
- 模板：`<template id="tplGroupPermissionForm">`
- 逻辑：`app-workflows.js:261` `openGroupPermissionModal(groupId)`
- Tab1 成员与权限：已授权列表每行含「权限等级下拉（change 调 `updateGroupAcl`）+ 复选框 + 单行删除按钮」；列表上方工具栏有「添加授权」按钮（点击展开默认隐藏的添加表单）与「批量删除」按钮（按勾选批量删除，含全选）；辅助函数新增 `buildPermissionOptions()` / `syncGroupAclBatchButton()` / `bindGroupAclToolbarEvents()`。
- Tab2 权限交接：仅 ownedBy 或 admin 可见，变更 ownedBy/ownedByDept
- Tab3 操作日志：展示组权限变更日志，倒序排列
- 辅助函数：`populateGroupPermissionDropdowns()`、`renderGroupAclList()`、`handleGroupAclAdd()`、`handleGroupOwnerTransfer()`、`renderGroupPermissionLogs()`

### 素材权限设置弹窗
- 入口：素材详情页 → 权限 Tab 或 权限设置按钮
- 模板：`<template id="tplAssetPermissionForm">`
- 逻辑：`app-workflows.js:428` `openAssetPermissionModal(assetId)`
- 继承权限区域：只读展示从组继承的权限
- 单独授权区域：已授权列表每行含「权限等级下拉（change 调 `updateAssetAcl`）+ 复选框 + 单行删除按钮」；列表上方工具栏有「添加授权」按钮（展开默认隐藏的添加表单）与「批量删除」按钮（按勾选批量删除，含全选）；辅助函数：`populateAssetPermissionDropdowns()`、`renderAssetAclList()`、`updateAssetAcl()`、`bindAssetAclToolbarEvents()`。

### 操作日志列表模板
- 模板：`<template id="tplOperationLogList">`，组和素材权限弹窗共用
- 字段：操作时间、操作人、操作类型、详情

## 分享体系升级

### 分享创建弹窗升级
- 三个弹窗：素材篮分享 `#basketShareModal`、素材分享 `#shareAssetModal`、组分享 `#shareGroupModal`
- 新增字段：访问范围（share_access_scope）、密码保护（复选框+密码输入）、内容权限（share_content_permission）、有效期（7天/30天/90天/永久 + 日期时间选择器）、最大访问次数
- 公共函数：`populateShareDropdowns(prefix)`、`bindShareExpireButtons(prefix)`、`bindSharePasswordToggle(prefix)`、`bindShareAccessScopeChange(prefix)`、`getShareFormData(prefix)`
- 内容权限限制：用户无 download 权限时"可下载"选项置灰

### 分享落地页鉴权链路
- 顺序校验：状态校验 → 有效期校验 → 访问次数校验 → 访问范围校验 → 密码校验 → 内容展示 → 访问计数
- 状态校验：`share.status !== 'active'` → 展示"分享已失效"
- 有效期校验：`isShareRecordExpired(share)`（分享记录对象）→ 过期后自动标记 `status = 'expired'`；通用日期过期判断用 `isShareExpired(expiresAt)`（日期字符串）。
- 访问次数校验：`maxVisits != null && visits >= maxVisits` → 自动失效
- 访问范围校验：internal 需要登录，public 直接放行
- 密码校验：`requirePassword === true` 时弹出密码框
- 内容展示：根据 `contentPermission` 控制下载按钮显隐
- 访问计数：有效访问后 `visits + 1`，达到上限自动标记失效
- 辅助函数：`renderShareLandingError(title, message)`、`renderShareLandingLogin(token)`

## 新增模板清单

- `tplGroupPermissionForm`：组权限设置弹窗（3个Tab）
- `tplAssetPermissionForm`：素材权限设置弹窗
- `tplOperationLogList`：操作日志列表（复用模板）
- `tplRecycleBin`：已删除（无任何 JS 引用，回收站页面 `renderRecyclePage()` 自建 HTML）
- `tplGroupMoveSelector`：已删除（无任何 JS 引用，组移动用 `openMoveGroupModal()` 自建 HTML）
- `tplPermissionRequestForm`：权限申请表单（升级现有）
- `tplShareLandingExpired`：分享失效/过期/次数耗尽提示页

## 系统管理

- 入口层级：左侧菜单树中的"系统管理"分组，子菜单为用户管理、角色管理、组织管理、权限管理、菜单管理。
- 页面状态值：`users`、`roles`、`organizations`、`permissions`、`menus`。
- 数据结构：`db.users`（含 `roleIds` 数组多角色、`phone`、`email`）；`db.organizations`；`db.roles`（含 `roleId` 字段）；`db.orgPermissions`；`db.userPermissions`。
- 登录日志：`db.loginLogs` 保存 `{ username, name, loginAt, ip, entry }`。
- 默认账号：`admin / admin123`（超级管理员）、`kerry / kerry123`（素材运营）、`tagview / tag123`（标签只读）。
- 默认数据补齐：`ensureSystemData()` (:716) 初始化组织、角色、用户，并为每个角色/组织/用户补齐 `db.menus` 中所有菜单的 `visible/editable` 权限。
- 页面白名单：`normalizePageState()` (:829) 的 `validPages` 改为 `getAllMenuPages()` 动态获取。
- 标题映射：`render()` (:10) 内动态从 `db.menus` 生成 `menuTitleMap`，不再有固定 `titleMap` 常量。
- 面包屑：`app-utils.js:241` `getPageBreadcrumb()` 动态遍历 `db.menus` 父链。
- 权限判断：`getMenuPermission(menuId)` (:570) 合并多个角色权限、组织权限、个人权限；`canViewMenu(menuId)` (:583) / `canEditMenu(menuId)` (:587)。
- 菜单过滤：`isVisibleNavMenu()` (:487) / `getVisibleNavMenuChildren()` (:493) 按 `valid`、`hidden` 和 `canViewMenu(page)` 过滤。
- 渲染分发：`renderManagePageV2()` (:529) 使用 `directRenderers` 映射表分发。
- 用户管理页：`renderUserManagePage()` (:1642)，左组织树右人员信息布局；`renderUserManageOrgTree()` (:1708)，`getUserManageFilteredUsers()` (:1725)。
- 角色管理页：`renderRoleManagePage()` (:1739)，新增角色 ID 列；`openRoleManageModal()` (:2265)。
- 权限管理页：`renderPermissionManagePage()` (:1788)，支持"按菜单授权"和"按组织个人授权"双视图。
- 菜单管理页：`renderMenuManagePage()` (:1180)，左树右表布局。
- 用户登录日志：`renderLoginLogPage()` (:1515)，支持按用户名/姓名/日期范围过滤。
- 值列表扩展：在 `material_manage` 维度下新增8个维度（授权主体类型 `permission_subject_type`、素材组权限等级 `group_permission_level`、素材权限等级 `asset_permission_level`、分享访问范围 `share_access_scope`、分享内容权限 `share_content_permission`、权限申请状态 `permission_request_status`、操作类型 `operation_action_type`、素材状态 `asset_status`），禁止硬编码权限枚举数组。
- 数据模型扩展：统一审计字段（createdBy、createdAt、ownedBy、ownedByDept、updatedAt）；新增 `db.groupAcl`（素材组授权表）、`db.assetAcl`（素材单独授权表）、`db.permissionRequests`（权限申请表）、`db.operationLogs`（全局操作日志）；升级 `db.shares` 新增 accessScope/contentPermission/maxVisits/status；素材主状态使用 `assetStatus`，审核链路使用 `auditStatus`；操作日志体系双写（实体级 + 全局）；`logOperation()` 统一日志函数；`migrateAuditFields()` 数据迁移。
- 权限校验体系：`buildUserGroupPermissionCache()` + `groupPermissionCache` 权限缓存；`getPermissionWeight()` 从值列表取权重；`hasGroupPermissionLevel()` 判断组权限等级；`getGroupEffectiveAcl()` 递归合并父组ACL；`aclMatchesCurrentUser()` 统一匹配人员/部门/公司授权主体；素材组权限 `canViewGroup/canDownloadFromGroup/canContributeToGroup/canManageGroup`；素材使用权限 `canViewAsset/canEditAsset/canDownloadAsset`；素材管理权限 `canDeleteAsset/canRestoreAsset/canMoveAsset/canUploadToGroup/canPurgeAsset`；`hasAssetAclPermission()` 资产ACL检查（正交权限映射）；`canCreateShare/canManageShare` 分享权限；`canManageTag/canManageCollect` 标签与收集任务权限；`canMoveGroup/isGroupDescendant` 组移动与循环检测；`getFilteredAssets()` 按页面和权限返回素材列表，`isPendingAsset()` 统一待入库判断。
- 写操作改造：所有写操作函数添加前置权限校验 + 统一日志。素材操作（`handleFiles`/`deleteSelectedAssets`/`handleEditAssetSubmit`/`softDeleteAsset`/`restoreAsset`/`hardDeleteAsset`/`handleAddToGroupSubmit`/`rerunRecognition`）；素材组操作（`handleAddGroupSubmit`/`handleEditGroupSubmit`/`handleMoveGroupSubmit`/`deleteGroup`/`dissolveGroup`/`deleteGroupAndAssets`）；标签操作（`createTagRecordFromUsage`/`handleEditTagSubmit`/`deleteTag`）；分享操作（`createGroupShare`/`handleShareGroupSubmit`/`handleShareAssetSubmit`）；收集任务操作（`handleCollectTaskSubmit`/`openCollectTaskConfigModal`）；权限申请操作（`openPermissionRequestModal`/`approvePermissionRequest`/`rejectPermissionRequest`）；组权限操作（`addGroupAcl`/`removeGroupAcl`/`updateGroupAcl`/`transferGroupOwner`）；素材权限操作（`addAssetAcl`/`removeAssetAcl`）。通用规则：每个写操作函数第一行调用对应 `canXxx()` 校验权限，操作成功后调用 `logOperation()` 写日志，涉及 groupAcl 变更后调用 `invalidateGroupPermissionCache()` 清除权限缓存。

### 树展开/折叠规范

- 所有树状结构（组织树、权限树、菜单树等）必须使用明确的 `+/-` 展开收起图标，并真正支持收缩。
- 用户管理和权限相关树不记录全局折叠状态，每次打开页面或弹框默认展开；点击 `+/-` 只做当前 DOM 的临时展开收起。
- `bindTreeToggleEvents()` (:1608) / `applyTreeToggle()` (:1618) 统一处理树展开/折叠。

## 值列表管理

- 页面状态值：`valueLists`。
- 菜单入口：由 `db.menus` 中 `page="valueLists"` 的页面节点驱动。
- 渲染入口：`app-render.js:676` `renderValueListPage()`。

### 页面布局

- 左侧树 + 右侧搜索表格（`styles.css` `.value-list-layout`：grid 260px+1fr）。
- 左侧树：`renderValueListTreeNodes(tree, null, 0)` (:805) 从 null parentId 开始递归渲染完整树。
- 右侧：搜索栏 + 操作按钮 + 面包屑导航 + 子节点表格。
- 表格列：编码、名称、类型、描述、关联管理（父级 `名称 (code)` / refId 关联节点 `名称 (code)`）、属性值（attr1/attr2）、子节点数、状态、操作。
- 状态管理：`state.valueListSearch` / `state.valueListSelectedNodeId` / `state.valueListExpandedIds`。

### 弹框（index.html）

- `#valueListModal` (:737-770)：新增/编辑节点。表单字段：编码、名称、类型、父级下拉（禁用，默认当前节点且不可改）、关联码(refId) 树状下拉、描述、属性1、属性2、状态。
- `renderValueListRefIdDropdown()` (:3252) / `bindRefIdDropdownEvents()` (:3322)：树状下拉组件，支持搜索过滤。
- 保留旧弹框 `#valueListItemListModal` / `#valueListItemFormModal`（不再被新布局调用，保留代码兼容）。

### 事件绑定

- 页面级：`bindValueListEvents()` (:836) 绑定树展开/选择/搜索/新增/修改/删除。
- 弹框级：`initValueListModalEvents()` (:1493) 在 `bootstrap()` 中一次性绑定。
- `populateValueListParentSelect()` (:961) / `collectValueListDescendantIds()` (:971)。

## HTML 固定可变数据清单

后续动态化时优先检查的清单：

- 排序项：`index.html:113-118` 固定写死；排序实现在 `app-utils.js:82` `sortAssets()`。
- 相似搜索模式：`index.html:126-127` 固定写死。
- 权限选项：`index.html:174-178`、`index.html:207-211`、`index.html:501-504`、`index.html:700-704` 固定写死。
- 分享访问范围与有效期：`index.html:331-335`、`index.html:524-536`、`index.html:700-712` 固定写死。
- 标签类型与 AI 来源：`index.html:369-372`、`index.html:393-396` 固定写死。
- 收集任务允许文件类型：`index.html:669-680` 静态兜底，打开弹窗时从 `getAllCollectTaskTypes()` 动态刷新。
- 收集任务状态：`index.html:898` 固定写死。
- 有效期提醒选项：`index.html:953` 固定写死。
- 品牌、公司名、搜索提示：`app-core.js` `renderShell()` (:1621) 动态写入，但值仍硬编码在 JS。
- 筛选项名称：`app-core.js:373` `filterLabels`。
- 筛选值来源：`app-actions.js:484` `getFilterValues()`，素材来源已从 `source` 值列表动态读取；剩余固定值如失效日、时长、创建时间仍写在 JS。

## 历史痕迹与注意事项

- 左侧主导航已删除"我收藏的组"功能模块入口；`favorite` 页面筛选/标题/面包屑已移除。旧链接进入 `page=favorite` 会通过 `normalizePageState()` 回退到 `all`。
- `ensureSystemData()` 仅在 `db.menus` 不存在或为空时初始化 `getDefaultMenus()`，不再每次启动覆盖用户修改。
- `render()` 中标签页渲染分支必须先于 `isManagePage()` 管理页分支判断，否则 `tags` 会被识别为管理页。
- `renderManagePageV2()` 使用 `directRenderers` 映射表，未知管理页显示空态"暂无对应管理页面"。
- 已删除废弃常量：`FILE_FORMAT_CATEGORIES`、`UPLOAD_FILE_FORMATS`、`UPLOAD_ACCEPT`、`COLLECT_TASK_FILE_TYPES`、`ASPECT_RATIOS`、`VEHICLE_MODELS`、`SYSTEM_MENUS`，全部改为从值列表树动态读取。
- 已删除旧函数：`showMoreMenu()`、`getManagedPages()`、`applyMenuPermissions()`、`isMenuPage()`、`updateShareExpireModal` 系列函数。
- 日期格式统一为 `YYYY-MM-DD HH:mm`（使用 `-` 短横线分隔，与存储一致），解析函数兼容多种分隔符输入。
- 素材编辑弹框不再使用原生 `datalist`，改为 `.asset-edit-combo` 结构 + `setupAssetEditDropdown()` 统一管理候选下拉。
- 内饰色/外饰色在素材编辑弹框中是单选字段，保存时写入数组但最多保留一个值。
- `db.shares` 和 `db.collectTasks` 新增 `requirePassword` / `password` 字段，老数据由迁移函数补默认值。
- 禁止使用 PowerShell `Set-Content` 整文件重写（曾导致中文字符串损坏），继续使用 `apply_patch` / Edit 做局部修改。
- CODE_MEMORY.md 必须保存为 UTF-8（带 BOM）。

## 点检建议

- 改筛选/排序：先测顶部筛选、多选、排序菜单、素材数量、控制台。
- 改标签：先测标签管理页表格、卡片、编辑、新增、合并、AI 标签跳转筛选。
- 改日期：先测 `readonly`、日期控件可选择、不能手填、提交值格式。
- 改分享/收集：先测创建链接、复制链接、过期时间、收集任务落地页、密码门。
- 改回收站：先测软删、恢复、硬删、清空、删除时间排序。

## 第三步任务：权限改造记录（2026-07-08）

### 通用规则
- `render()` 函数开头调用 `buildUserGroupPermissionCache()` 构建权限缓存
- 所有列表数据先过权限过滤再渲染
- 所有操作按钮按权限动态显隐，无权限不展示或置灰
- 所有枚举下拉从值列表动态生成，不写死选项
- 无权限的入口直接隐藏，不让用户看到（不是置灰）

### 修改内容

1. **render() 权限缓存**：`app-render.js:10` `render()` 函数开头调用 `buildUserGroupPermissionCache()`

2. **左侧素材组导航树**：`app-render.js:160` `renderGroups()` 
   - 只渲染 `canViewGroup()` 为 true 的组
   - "全部素材"作为顶部独立入口
   - 组右键菜单按 `canManageGroup()` 控制显隐

3. **素材列表过滤**：`renderAssets()` 
   - 统一复用 `getFilteredAssets()` 取得当前页面素材池
   - `all` / `pending` 页面再应用 `canViewAsset()`；待入库页面由 `isPendingAsset()` 判断是否仍处于审核或入库链路

4. **素材卡片按钮**：`app-render.js:302` `renderAssetCard()` 
   - 编辑按钮：`canEditAsset()`
   - 下载按钮：`canDownloadAsset()`
   - 分享按钮：`canCreateShare(asset, 'view')`
   - 移动按钮：`canMoveAsset(asset)`

5. **元数据列表操作按钮**：`app-render.js:330` `renderMetadataList()` 
   - 按权限控制操作按钮显隐

6. **回收站页面**：`app-render.js:589` `renderRecyclePage()` 
   - 筛选：status=deleted + `canViewAsset()`
   - 恢复按钮：`canRestoreAsset()`
   - 彻底删除按钮：`canPurgeAsset()`

7. **分享记录页**：`app-render.js:569` `renderSharePage()` 
   - 只展示 `canManageShare()` 的记录

8. **收集任务页**：`app-render.js:599` `renderCollectPage()` 
   - 只展示 `canManageCollect()` 的任务

9. **标签管理页**：`app-render.js:2622` `renderTagsPage()` 
   - AI标签按 `ownedBy` 控制操作按钮，普通用户看不到AI标签的编辑按钮

10. **素材详情页操作日志 Tab**：`app-actions.js:1041` `renderViewer()` 
    - 操作日志 Tab 显示结构化日志（操作时间、操作人、操作类型、操作详情）
    - 无素材管理权限的用户看不到该 Tab

11. **组移动目标选择器**：`app-actions.js:1518` `openMoveGroupModal()` 
    - 源组自身及其所有后代组置灰不可选（调用 `isGroupDescendant()` 判断）

### 权限函数汇总

| 权限函数 | 说明 |
|---|---|
| `canViewGroup(groupId)` | 查看素材组 |
| `canManageGroup(groupId)` | 管理素材组 |
| `canViewAsset(asset)` | 查看素材 |
| `canEditAsset(asset)` | 编辑素材 |
| `canDownloadAsset(asset)` | 下载素材 |
| `canDeleteAsset(asset)` | 删除素材（软删除） |
| `canRestoreAsset(asset)` | 恢复素材 |
| `canPurgeAsset(asset)` | 彻底删除素材 |
| `canMoveAsset(asset)` | 移动素材 |
| `canUploadToGroup(groupId)` | 上传到组 |
| `canContributeToGroup(groupId)` | 贡献到组 |
| `canCreateShare(target, permission)` | 创建分享 |
| `canManageShare(share)` | 管理分享 |
| `canManageCollect(task)` | 管理收集任务 |
| `canManageTag(tag)` | 管理标签 |
| `canManageAsset(asset)` | 素材管理权限 |
| `isGroupDescendant(descendantId, ancestorId)` | 判断组是否为后代 |
| `canDownloadFromGroup(groupId)` | 从组下载 |
| `isPendingAsset(asset)` | 判断素材是否处于待入库/待终审链路 |
| `aclMatchesCurrentUser(acl)` | 统一匹配 user / department / company 授权主体 |
| `getOrgAncestorIds(orgId)` | 获取组织祖先链，用于包含子部门授权 |
| `getEffectiveGroupPermissionLevel(groupId)` | 获取组继承 ACL 中当前用户最高权限等级 |

### 当前权限与值列表实现基线

#### 素材与审核状态
- `assetStatus` 是素材主状态，覆盖 `pending`、`active`、`deleted`、`disabled` 等展示和操作状态。
- `auditStatus` 是审核链路状态，覆盖待提交、待审核、机审、人审、终审通过等节点。
- `isPendingAsset(asset)` 是待入库统一判断入口；`assetStatus=active` 直接返回 false，`assetStatus=pending` 直接返回 true，其他状态再判断 `auditStatus` 是否终审通过。
- `getFilteredAssets()` 根据页面状态返回基础素材池；`renderAssets()` 对 `all` / `pending` 页面继续应用 `canViewAsset()`。
- `approveSelectedAssets()` 只处理 `isPendingAsset(asset)` 命中的素材，入库后写入 `auditStatus=human_pass` 和 `assetStatus=active`。

#### ACL 权限
- `aclMatchesCurrentUser(acl)` 是 user / department / company 的统一匹配入口。
- `department` 支持 `includeSubDept`，通过 `getOrgAncestorIds(currentUser.organizationId)` 匹配上级部门授权。
- `company` 使用 `subjectId="all"` 表示全公司授权。
- 组 ACL 缓存、组继承权限、素材 ACL 权限均复用统一匹配逻辑。
- 组 ACL 和素材 ACL 弹窗均支持公司级授权；切换主体类型时清空旧主体选择，避免提交脏 ID。

#### 权限申请
- `renderPermissionManagePage()` 已接入权限申请列表、状态筛选、审批通过和审批拒绝按钮。
- `approvePermissionRequest()` / `rejectPermissionRequest()` 只处理 `pending` 状态。
- 审批通过时先查找既有 ACL，存在则更新，不存在才新增，避免重复点击产生重复授权。
- 审批处理完成后刷新权限管理页。

#### 值列表
- `db.valueListTree` 是统一树模型，权限枚举、状态枚举、上传格式、收集类型和业务标签都应来自值列表。
- `getTreeNodeByCode(code, parentDimCode)` 支持维度限定，避免 `view`、`active` 等通用 code 跨维度冲突。
- `saveValueList()` / `saveValueListItem()` 的 code 唯一性按同父节点约束，允许不同维度复用同名编码。
- 编辑节点时禁止移动到自己的子孙节点下，避免树结构成环。

#### 菜单管理
- `db.menus` 是动态菜单源，页面白名单、标题、面包屑、管理页入口都从菜单树派生。
- 菜单权限 key 使用 `page` 字段。
- `saveMenu()` 校验 `page` 唯一性，避免多个菜单共用同一个权限 key。
- `deleteMenu()` 删除菜单树时同步清理角色、组织、用户权限对象中的残留 page key，并调用 `normalizePageState()` 防止停留在已删除页面。

#### 弹框 DOM 查询规范
- 弹框内 `name="..."`、`class="..."` 等选择器必须限定在 `#formModal` 或对应弹框根节点内，禁止直接使用 `document.querySelector("[name='status']")` 等全局查询，避免命中页面其他同名元素。
- 典型错误：`openCollectTaskConfigModal` 曾全局查询 `[name='status']`，结果把 option 加到了值列表编辑弹框的 select 上，导致收集任务配置弹框的状态下拉为空。

#### 日期 input 回填格式
- `<input type="date">` 的 `value` 必须是 `YYYY-MM-DD`（HTML 规范）。统一用 `toInputDateValue(字段)` 生成（内部走 `toISODate` 取前 10 位），禁止在业务代码里散写 `splitDateTimeText().date.replaceAll("/", "-")`。
- `calculateExpireTime()` / `getExpireDate()` 统一输出 ISO `YYYY-MM-DDTHH:mm:ss`；显示层由 `formatDateTimeDisplay()` 渲染为 `YYYY/MM/DD HH:mm`。

#### Modal.confirm 调用规范
- `Modal.confirm()` 返回 Promise，调用处必须使用 `await` 或 `.then()`，禁止传入回调函数；历史代码中的回调式调用会导致点击确定后没有任何动作。

#### 函数命名冲突
- 避免同名函数覆盖。曾存在两个 `isShareExpired`（一个接受 share 对象，一个接受 expiresAt 字符串），后者覆盖了前者，导致分享落地页的对象版过期判断永远返回 false。现已将对象版重命名为 `isShareRecordExpired(share)`。

#### 待入库判断
- `isPendingAsset()` 必须优先排除 `assetStatus=active` 的素材，否则所有已入库但 `auditStatus` 非终审通过的素材会同时出现在"全部素材"和"待审核"两个页面。

#### 权限交接数据一致性
- 素材组责任人字段 `group.ownedBy` 存储的是 `username`，搜索选人时虽然列表显示用户姓名，但回填和交接必须使用 `username`，否则后续权限判断会失效。
