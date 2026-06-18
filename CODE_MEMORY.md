# 代码记忆索引

更新时间：2026-06-18

用途：后续改动前，先查本文件定位对应代码位置；如果这里不能定位，再回读完整相关文件，并把新定位补充到本文件。

## 修改前流程

1. 先按需求关键词查本文件。
2. 能定位到模块和函数时，只读取对应函数附近代码，再做局部修改。
3. 不能定位时，再读取相关完整文件。
4. 修改后如果新增功能入口、状态字段、模板、动态数据来源，必须补充本文件。

## 文件职责

- `index.html`：静态骨架、模态框、模板、脚本加载顺序。仍包含不少可变配置项的硬编码选项。
- `styles.css`：全局布局、素材卡片、列表、弹窗、标签页、暗色模式、移动端样式。
- `app-infra.js`：基础设施封装，包括 Toast、Modal、Loading、`http`、`initDatePicker`、`debounce`。
- `app-core.js`：种子数据、全局 `db/state/els`、初始化、数据迁移、主壳渲染、全局事件绑定。
- `app-render.js`：主渲染入口、素材列表/卡片、管理页、回收站、标签管理页、标签新增编辑合并。
- `app-actions.js`：上传、筛选菜单、侧边栏、素材组菜单、素材菜单、查看器、素材/素材组表单、收集任务创建、素材篮计数。
- `app-workflows.js`：素材篮抽屉、分享、更新分享过期时间、收集任务配置/模拟上传、有效期/所有者/权限、删除/恢复/预览。
- `app-utils.js`：过滤、排序、相似度、面包屑、日期时间格式、标签拆分、转义、空态。
- `app.js`：启动入口，当前只调用 `bootstrap()`。

## 数据与状态

- 持久化 key：`app-core.js:1` 的 `STORAGE_KEY = "dp-material-library-state-v2"`。
- 默认素材组：`app-core.js:3` `defaultGroups`。
- 默认素材：`app-core.js:13` `seedNames` 和 `app-core.js:39` `seedAssets`。
- 默认标签：`app-core.js:80` `seedTags`。
- 车型枚举：`app-core.js:28` `VEHICLE_MODELS`。
- 筛选项配置：`app-core.js:123` `filterLabels`，`app-core.js:124` `configurableFilters`。
- 全局状态：`app-core.js:127` `state`。
- DOM 缓存：`app-core.js:164` `els`。
- 读库：`app-core.js:360` `loadDb()`。
- 存库：`app-core.js:382` `saveDb()`。
- 数据迁移：`app-core.js:245` `migrateVehicleModels()`，`app-core.js:290` `migrateShareExpiresAt()`，`app-core.js:310` `migrateAssetMetadata()`。

## 主流程

- 启动：`app.js` -> `bootstrap()`。
- 初始化：`app-core.js:205` `bootstrap()`。
- URL 参数处理：`app-core.js:230` `applyHashState()`。
- 主壳同步：`app-core.js:570` `renderShell()`。
- 主渲染入口：`app-render.js:1` `render()`。
- 全局事件绑定：`app-core.js:621` `bindEvents()`。

## 页面定位

- 顶部导航、侧边栏、工具栏骨架：`index.html:11-132`。
- 顶部栏响应式：`styles.css:70` `.topbar`，`styles.css:167` `.top-icons`，重点看 `max-width: 1200px / 860px / 640px / 480px` 断点。
- 页面标题和面包屑：`index.html:60-65`，动态更新在 `app-render.js:13-30`，面包屑文案在 `app-utils.js:174` `getPageBreadcrumb()`。
- 页面按钮区：`index.html:65-90`，显示逻辑在 `app-render.js:252` `renderActions()`。
- 素材工具栏筛选/布局/排序：`index.html:94-116`，筛选 chip 在 `app-core.js:605`，排序事件在 `app-core.js:749` 附近。
- 素材内容区：`index.html:128` `#contentPanel`，主要由 `app-render.js` 动态填充。
- 更多功能页：`app-render.js:499` `renderManagePageV2()`。
- 标签管理页：`app-render.js:799` `renderTagsPage()`。
- 分享落地页：`app-core.js:485` `renderSharePortal()`。
- 收集任务落地页：`app-core.js:427` `renderCollectorPortal()`。

## 素材列表与选择

- 素材过滤：`app-utils.js:1` `getFilteredAssets()`。
- 排序：`app-utils.js:79` `sortAssets()`。
- 筛选匹配：`app-utils.js:90` `matchFilter()`。
- 上传时间筛选：`app-actions.js:330` `showUploadTimeFilterMenu()`，匹配在 `app-utils.js:111` `matchUploadTimeFilter()`。
- 素材卡片：`app-render.js:299` `renderAssetCard()`。
- 平铺/分组：`app-render.js:277` `renderCompactAssets()`，`app-render.js:282` `renderDateGroupedAssets()`。
- 卡片尺寸和缩略图布局：`styles.css:829` `.asset-card`，`styles.css:842` `.thumb`，`styles.css:933` `.asset-info`。
- 元数据列表：`app-render.js:327` `renderMetadataList()`。
- 回收站素材列表：`app-render.js:402` `renderList()`。
- 勾选/全选/批量条：`app-render.js:416` `bindAssetEvents()`。
- 已选素材集合：`state.selectedIds`。
- 素材篮计数：`app-actions.js:1357` `updateBasketCount()`。

## 筛选与排序

- 默认筛选项：`app-core.js:123` `filterLabels`。
- 可配置筛选项：`app-core.js:124` `configurableFilters`。
- 筛选 chip 渲染：`app-core.js:605` `renderFilterChips()`。
- 筛选配置弹窗：`app-core.js:613` `renderFilterConfig()`。
- 浮层菜单防越界：`app-actions.js:289` 前后的 `positionFloatingMenu()`；素材菜单在 `app-actions.js:741` `showAssetMenu()`。
- 普通筛选菜单：`app-actions.js:289` `showFilterMenu()`。
- 筛选值来源：`app-actions.js:365` `getFilterValues()`。
- 多选状态规范：`state.filters[label]` 保存数组。
- 清空单个筛选：`app-core.js:792` 附近通过 `data-remove-config-filter` 删除。
- 排序下拉静态项：`index.html:107-112`。
- 排序状态：`state.sort`。

## 日期时间

- 统一日期控件入口：`app-infra.js:161` `initDatePicker()`。
- 项目内初始化：`app-render.js:41` `initProjectDatePickers()`。
- 日期文本：`app-utils.js:215` `todayText()`，`app-utils.js:221` `normalizeDateText()`。
- 日期时间组合：`app-utils.js:244` `joinDateTime()`，`app-utils.js:249` `formDateTimeValue()`。
- 时间戳比较：`app-utils.js:259` `dateTimeTextToTimestamp()`。
- 分享过期时间更新：`app-workflows.js:68` `openUpdateShareExpireModal()`，`app-workflows.js:104` `handleUpdateShareExpireSubmit()`。
- 素材有效期弹窗：`app-workflows.js:276` `openValidityModal()`。
- 素材篮有效期：`app-workflows.js:37` `openBasketValidityModal()`。

## 上传与导入

- 上传按钮菜单：`index.html:69-74`，事件在 `app-actions.js:1` `handleUploadMenu()`。
- 上传设置弹窗：`index.html:575-592`，逻辑在 `app-actions.js:19` `openUploadSettingsModal()`。
- 上传文件格式白名单：`app-core.js:29` `FILE_FORMAT_CATEGORIES`，由表格梳理出的 70 个具体后缀组成；`UPLOAD_FILE_FORMATS` 用于上传校验和“文件格式”筛选，`UPLOAD_ACCEPT` 用于文件选择框。
- 文件格式分类与校验：`app-utils.js:196` `isAllowedUploadFile()`，`app-utils.js:200` `getFormatCategory()`；上传处理在 `app-actions.js:59` 会跳过不支持格式。
- 文件格式筛选：`app-actions.js:397` `getFilterValues()`，其中“文件格式”不再截断 12 项，会返回完整上传白名单并兼容已有素材格式。
- 文件读取：`app-actions.js:201` `readFileAsDataUrl()`。
- 媒体信息：`app-actions.js:210` `getMediaInfo()`。
- AI 标签识别模拟：`app-actions.js:259` `recognizeTags()`。
- 车型识别：`app-actions.js:278` `detectVehicleModel()`。
- 百度网盘导入：`index.html:598-612`，逻辑在 `app-actions.js:39` `openCloudImportModal()`。

## 素材组

- 树渲染：`app-render.js:158` `renderGroups()`。
- 树排序和层级：`app-render.js:188` `getOrderedGroups()`，`app-render.js:225` `syncGroupDepths()`。
- 折叠：`app-render.js:238` `toggleGroupCollapse()`。
- 素材组菜单：`app-actions.js:576` `showGroupMenu()`，`app-actions.js:606` `handleGroupAction()`。
- 新建素材组：`index.html:508-519`，逻辑在 `app-actions.js:1168` `openGroupModal()`。
- 编辑素材组：`index.html:525-536`，逻辑在 `app-actions.js:1200` `openGroupEditModal()`。
- 移动素材组：`index.html:542-552`，逻辑在 `app-actions.js:1232` `openMoveGroupModal()`。

## 素材详情与查看器

- 查看器 HTML：`index.html:216-246`。
- 打开查看器：`app-actions.js:935` `openViewer()`。
- 查看器渲染：`app-actions.js:950` `renderViewer()`。
- 查看器序列：`app-actions.js:1015` `getViewerSequence()`。
- 缩放/平移：`app-render.js:50` `bindViewerPan()`，`app-render.js:90` `bindViewerResize()`，`app-actions.js:1047` `updateZoomDisplay()`。
- 详情面板布局：`app-render.js:148` `applyDetailPanelLayout()`。
- 素材编辑：`index.html:438-469`，逻辑在 `app-actions.js:1113` `openEditAssetModal()`。

## 标签管理

- 标签页入口：`app-render.js:799` `renderTagsPage()`。
- 标签汇总：`app-render.js:679` `getTagSummary()`。
- 标签表格：`app-render.js:864` `renderTagTableBody()`。
- 业务标签卡片：`app-render.js:967` `renderBusinessTagList()`。
- AI 标签卡片：`app-render.js:1007` `renderAITagList()`。
- 系统标签卡片：`app-render.js:1035` `renderSystemTagList()`。
- 标签事件：`app-render.js:1054` `bindTagEvents()`，`app-render.js:1059` `handleTagClick()`。
- 新增标签：`index.html:359-381`，逻辑在 `app-render.js:1114` `openAddTagModal()`。
- 编辑标签：`index.html:387-410`，逻辑在 `app-render.js:1191` `openEditTagModal()`。
- 合并标签：`index.html:416-431`，逻辑在 `app-render.js:1298` `openMergeTagModal()`。

## 分享与收集

- 分享素材组弹窗：`index.html:667-693`，逻辑在 `app-workflows.js:128` `openShareCurrentModal()`。
- 分享单素材弹窗：`index.html:475-501`，逻辑在 `app-workflows.js:167` `openShareAssetModal()`。
- 素材篮分享：`index.html:317-353`，逻辑在 `app-workflows.js:51` `openBasketShareModal()`。
- 分享过期时间更新：`index.html:699-724`，逻辑在 `app-workflows.js:68`。
- 创建收集任务：`index.html:618-636`，逻辑在 `app-actions.js:1311` 和 `app-actions.js:1322`。
- 创建收集任务的“允许文件类型”选项：静态兜底在 `index.html:628-632`，打开弹窗时由 `app-actions.js:1221` 使用 `COLLECT_TASK_FILE_TYPES` 动态刷新为文件大类。
- 收集任务配置模板：`index.html:810-828`，逻辑在 `app-workflows.js:209`。
- 模拟收集上传：`index.html:830-843`，逻辑在 `app-workflows.js:250`；模板中的 `{{UPLOAD_ACCEPT}}` 由 `openCollectorUploadModal()` 注入，提交时同样通过 `isAllowedUploadFile()` 过滤不支持格式。

## 回收站

- 顶部按钮：`index.html:87-89`。
- 页面渲染：`app-render.js:540` 附近在 `renderManagePageV2()` 内。
- 清空回收站：`app-render.js:650` `emptyRecycleBin()`。
- 删除时间排序：`app-render.js:663` `toggleRecycleDeletedTimeSort()`。
- 回收站排序函数：`app-render.js:669` `sortRecycleItems()`。
- 素材恢复/硬删：`app-workflows.js:430` `restoreAsset()`，`app-workflows.js:443` `hardDeleteAsset()`。
- 批量恢复素材：顶部按钮 `index.html:88` `#restoreSelectedRecycle`，事件绑定 `app-core.js:761`，逻辑 `app-workflows.js:443` `restoreSelectedRecycleAssets()`。
- 回收站已去掉素材组功能；删除“组及素材”时，素材进入回收站，素材组直接移除。

## 权限与所有者

- 修改权限弹窗：`index.html:194-211`，逻辑在 `app-workflows.js:319` `openPermissionModal()`。
- 申请权限弹窗：`index.html:157-188`，逻辑在 `app-workflows.js:344` `openPermissionRequestModal()`。
- 所有者弹窗模板：`index.html:857-860`，逻辑在 `app-workflows.js:302` `openOwnerModal()`。
- 权限判断：`app-core.js:156` `isAdmin()`，`app-core.js:160` `canManageAsset()`。

## 目前发现的 HTML 固定可变数据

这些不是本次全部改动项，只是后续动态化时优先检查的清单。

- 主导航文案与入口：`index.html:41-45` 固定写死；页面状态在 `state.page`，渲染逻辑在 `app-core.js:648` 附近。
- 排序项：`index.html:107-112` 固定写死；排序实现依赖 `app-utils.js:79` `sortAssets()`。
- 相似搜索模式：`index.html:121-122` 固定写死；读取位置在 `app-utils.js:16`。
- 权限选项：`index.html:169-180`、`index.html:202-205`、`index.html:462-465`、`index.html:653-657` 固定写死；相关逻辑分散在 `app-workflows.js` 和 `app-actions.js`。
- 分享访问范围与有效期：`index.html:332-343`、`index.html:486-495`、`index.html:678-687` 固定写死；提交逻辑在 `app-workflows.js:141`、`app-workflows.js:182`。
- 标签类型与 AI 来源：`index.html:366-378`、`index.html:395-407` 固定写死；保存逻辑在 `app-render.js:1144`、`app-render.js:1227`。
- 素材权限范围：`index.html:462-465` 固定写死；编辑提交在 `app-actions.js:1136`。
- 收集任务允许文件类型：静态 HTML 仅兜底；打开弹窗时从 `COLLECT_TASK_FILE_TYPES` 动态生成，保存逻辑在 `app-actions.js:1322`。
- 收集任务状态：`index.html:820` 固定写死；配置逻辑在 `app-workflows.js:209`。
- 有效期提醒选项：`index.html:853` 固定写死；有效期弹窗逻辑在 `app-workflows.js:276`。
- 品牌、公司名、搜索提示：`app-core.js:573-576` 动态写入，但值仍硬编码在 JS。
- 筛选项名称和值：筛选项在 `app-core.js:123`，筛选值在 `app-actions.js:365`，其中部分固定值如素材来源、失效日、时长、创建时间仍写在 JS。
- 标签名称与使用次数：截图中标签行来自 `db.tags` 和 `db.assets` 动态汇总，不是 HTML 固定数据；定位 `app-render.js:679` `getTagSummary()` 与 `app-render.js:864` `renderTagTableBody()`。

## 当前仍需注意的历史痕迹

- `index.html:366` 和 `index.html:395` 仍有内联 `onchange`，后续如果继续执行“禁止内联事件”原则，应迁移到 `addEventListener`。
- `styles.css:3670` 以后还有协作弹窗样式残留；之前已移除协作弹窗 JS/旧弹窗逻辑，样式是否删除需单独确认页面无依赖。
- `memberPermissionModal` HTML 仍存在于 `index.html:642-662`，但对应旧协作弹窗 JS 已清理；如果确认无业务入口，可作为后续无效 HTML 清理项。

## 点检建议

- 改筛选/排序：先测顶部筛选、多选、排序菜单、素材数量、控制台。
- 改标签：先测标签管理页表格、卡片、编辑、新增、合并、AI 标签跳转筛选。
- 改日期：先测 `readonly`、日期控件可选择、不能手填、提交值格式。
- 改分享/收集：先测创建链接、复制链接、过期时间、收集任务落地页。
- 改回收站：先测软删、恢复、硬删、清空、删除时间排序。
