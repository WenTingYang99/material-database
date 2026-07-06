# 代码记忆索引

## 2026-07-06 左侧菜单树动态化

- 左侧主导航由 `app-core.js` 的 `renderMainNav()` 递归读取 `db.menus` 渲染，不再把“素材管理 / 更多功能”等分组拍平成页面按钮。
- 左侧菜单分组使用 `data-nav-toggle` 支持 `+/-` 展开收起，页面节点使用 `data-page` 进入对应页面；展开状态仅保存在当前运行时的 `state.navExpandedMenuIds`，刷新后重新默认展开可见分组。
- 菜单可见性由 `valid !== false`、`hidden !== true` 和 `canViewMenu(page)` 共同控制；空分组不会展示。
- 旧的左侧“更多功能”下拉入口、`data-go` 页面跳转分支和 `showMoreMenu()` 已清理，避免同一菜单保留两套入口。
- 菜单管理不再保留“展示位置”配置；入口统一由菜单树决定，`layout` 仅用于区分素材页面和管理页面。

## 2026-07-03 渲染入口稳定性调整

- `app-render.js` 的 `renderManagePageV2()` 已改为按 `users / roles / organizations / permissions / activity / loginLogs / share / recycle / collect / valueLists / menus / validity` 显式入口分发。
- 未知管理页现在显示空态 `暂无对应管理页面`，不再落入有效期管理兜底，避免动态菜单或新增页面误渲染成有效期页。

## 2026-07-03 菜单动态化调整

- 菜单入口展示不再依赖固定的 `menu_group_assets` / `menu_group_more` 判断；主导航读取 `db.menus` 树，所有可见菜单统一在左侧树中展示，通过 `layout` 决定素材页面或管理页面。
- 菜单管理表单保留 `layout` 保存字段；已有本地菜单数据只在字段缺失时补默认值，不覆盖用户维护的名称、层级、顺序等配置。
- 删除旧的 `getManagedPages()`、`applyMenuPermissions()`、`isMenuPage()` 特殊/重复逻辑，菜单渲染时直接按权限输出可见入口。

更新时间：2026-06-30

用途：后续改动前，先查本文件定位对应代码位置；如果这里不能定位，再回读完整相关文件，并把新定位补充到本文件。

## 修改前流程

1. 先按需求关键词查本文件。
2. 能定位到模块和函数时，只读取对应函数附近代码，再做局部修改。
3. 不能定位时，再读取相关完整文件。
4. 修改后如果新增功能入口、状态字段、模板、动态数据来源，必须补充本文件。
5. 用户明确要求：每次更新代码前都先阅读本文件；如果代码结构或功能入口有变化，及时更新本文件。
6. 用户明确要求：以后收到“调整/修改/优化”类消息时，先说明对需求的理解并询问是否正确；用户确认后再开始修改。

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
- 车型/品牌/车系/颜色筛选数据：从 `app-core.js` 的 `SEED_VALUE_LIST_TREE` 动态读取；旧静态常量 `BRANDS / BRAND_SERIES / SERIES_MODELS / MODEL_INTERIOR_COLORS / MODEL_EXTERIOR_COLORS / VEHICLE_MODELS` 已清理。
- 筛选项配置：`app-core.js` 的 `filterLabels` 控制默认可见筛选项；可配置筛选项由 `getConfigurableFilters()` 动态合并值列表维度和固定扩展项，旧 `configurableFilters` 常量已清理。
- 全局状态：`app-core.js:127` `state`；用户管理页使用 `userManageFilters / userManageOrgId / selectedManageUserId` 控制组织树筛选、查询条件和当前选中用户；权限管理页额外使用 `permissionView / permissionMenuId / permissionSubjectType / permissionSubjectId` 控制“按菜单授权 / 按组织个人授权”双视图和左侧树当前选中节点。用户管理和权限相关树不记录全局折叠状态，每次打开页面或弹框默认展开；点击 `+/-` 只做当前 DOM 的临时展开收起。
- 登录会话 key：`app-core.js:179` `SESSION_USER_KEY = "dp-material-library-current-user"`。
- 系统菜单权限清单：由 `db.menus` 动态驱动，菜单权限按 `visible/editable` 控制。`getManagedPages()` 函数从 `db.menus` 获取所有有效页面菜单（排除素材管理分组下的页面）。
- 登录日志筛选状态：`state.loginLogFilters`，包含 `username/name/startDate/endDate`。
- 当前用户：`app-core.js:223` `currentUser`，由登录会话和 `db.users` 动态生成，不再是固定常量。
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
- 全局事件绑定：`app-core.js:621` `bindEvents()`；2026-07-03 第二批代码审计优化后，重复的弹窗取消/关闭/遮罩关闭事件通过 `bindModalClose()` 统一绑定，原有无遮罩关闭的弹窗仍显式传 `{ backdrop: false }` 保持交互不变。

## 页面定位

- 顶部导航、侧边栏、工具栏骨架：`index.html:11-132`。
- 顶部栏响应式：`styles.css:70` `.topbar`，`styles.css:167` `.top-icons`，重点看 `max-width: 1200px / 860px / 640px / 480px` 断点。
- 页面标题和面包屑：`index.html:60-65`，动态更新在 `app-render.js:13-30`，面包屑文案在 `app-utils.js:174` `getPageBreadcrumb()`。
- 页面按钮区：`index.html:65-98`，显示逻辑在 `app-render.js:252` `renderActions()`；全部素材、待入库、标签管理、收集素材、回收站的顶部操作按钮均在这里统一展示。
- 素材工具栏筛选/布局/排序：`index.html:94-116`，筛选 chip 在 `app-core.js:605`，排序事件在 `app-core.js:749` 附近。
- 素材内容区：`index.html:128` `#contentPanel`，主要由 `app-render.js` 动态填充。
- 更多功能页：`app-render.js:499` `renderManagePageV2()`。
- 左侧菜单树：`app-core.js` 的 `renderMainNav()` / `renderMainNavNodes()` 读取 `db.menus` 递归渲染；“素材管理”“更多功能”“系统管理”都是树节点，点击 `+/-` 展开收起，点击页面节点进入独立页面。
- 更多功能子菜单页面：所有更多功能子菜单都通过左侧菜单树的 `data-page` 页面节点进入，不再使用 `#moreMenuContent` / `data-go` 下拉入口，也不在内容区通过 tab/二级导航切换。
- 系统管理页：`app-render.js:627` `renderSystemManagePage()`。当前五个子页为：用户管理、角色管理、组织管理、权限管理、菜单管理。
- 菜单管理页：`app-render.js:1153` `renderMenuManagePage()`。左侧树展示 `db.menus`，右侧表单支持新增/修改/删除菜单节点。
- 值列表管理页：`app-render.js:643` `renderValueListPage()`。单表格展示大类，点击"查看小类"弹框管理小类。详见下方"值列表管理"章节。
- 登录页：`app-core.js:582` `ensureRuntimeElements()` 动态创建 `#loginPage`；提交在 `app-core.js:790` `handleLoginSubmit()`；退出在 `app-core.js:815` `logoutCurrentUser()`。
- 用户登录日志页：页面状态 `loginLogs`；菜单入口在 `index.html` 的 `#moreMenuContent`；渲染在 `app-render.js` 的 `renderLoginLogPage()`；登录成功时 `handleLoginSubmit()` 写入 `db.loginLogs`。
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

- 默认筛选项：`app-core.js` `filterLabels`。
- 可配置筛选项：`app-core.js` `getConfigurableFilters()`。
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
- 素材有效期弹窗：`app-workflows.js:284` `openValidityModal()`（已改为日期时间选择器，移除相对时间选项）。
- 素材篮有效期：`app-workflows.js:37` `openBasketValidityModal()`（日期为空时自动设为100年后）。

## 素材有效期

- 核心原则：所有日期字段（上传日期、生效日期、失效日期）使用精确日期时间格式（`YYYY-MM-DD HH:mm`），状态由精确日期对比当前时间动态计算。
- 精确日期生成：`app-core.js:45` `getExpireDate()`（生成未来指定天数的日期），`app-core.js:218` `calculateExpireTime()`（相对时间转精确日期，"永久有效"转100年后日期）。
- 种子数据：`app-core.js:54` `seedAssets`（已使用精确日期，移除"永久有效"等相对时间）。
- 数据迁移：`app-core.js:325` `migrateAssetMetadata()`（自动将相对时间转换为精确日期，确保 `validUntil` 和 `validUntilDate` 同步）。
- 状态计算：`app-render.js:383` `getValidityStatus()`（根据精确日期计算：已过期/即将过期/生效中），`app-render.js:393` `getValidityStatusClass()`（返回状态样式类）。
- 列表视图：`app-render.js:327` `renderMetadataList()`（新增"状态"列，失效日期改为可编辑的日期时间选择器）。
- 编辑素材信息：`app-actions.js:1113` `openEditAssetModal()`（失效日期改为可编辑），`app-actions.js:1136` `handleEditAssetSubmit()`（保存失效日期）。
- 有效期管理页面：`app-render.js:499` `renderManagePageV2()` 内 validity 分支（筛选改为基于精确日期的动态计算）。
- 上传设置：`app-actions.js:19` `openUploadSettingsModal()`（失效日期为空时自动设为100年后）。
- 创建素材：`app-actions.js:289` `createAssetFromFile()`（默认失效日期为100年后）。

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

- 标签页入口：`app-render.js:799` `renderTagsPage()`；“新增标签/标签合并”按钮在顶部 `page-actions`，事件绑定在 `app-core.js:758` 附近。
- 标签菜单权限：`canViewMenu("tags")` 允许查看业务标签和 AI 标签；`canEditMenu("tags")` 才显示新增、编辑、合并、删除等操作按钮。控制点包括 `renderActions()`、`renderTagsPage()`、`renderTagTableBody()`，并在 `openAddTagModal/openEditTagModal/deleteTag/openMergeTagModal` 做二次校验。
- 标签汇总：`app-render.js:679` `getTagSummary()`。
- 标签编码：由 `app-render.js:666` 附近的 `generateTagCode()` 自动生成；新增/编辑弹窗不允许用户输入编码，打开标签管理时 `normalizeStoredTagCodes()` 会修正空编码、中文编码或重复编码。
- 标签表格：`app-render.js:864` `renderTagTableBody()`。
- 标签树扁平化：2026-07-03 第二批代码审计优化后，业务标签树展开为表格行统一使用 `flattenTagTree()`，不再在初始渲染和业务标签 tab 点击中各写一份局部 `flattenTree`。
- 旧标签卡片渲染函数 `renderBusinessTagList()` / `renderAITagList()` / `renderSystemTagList()` 已于 2026-07-03 清理；当前标签管理只保留表格渲染。
- 标签事件：`app-render.js:1054` `bindTagEvents()`，`app-render.js:1059` `handleTagClick()`。
- 新增标签：`index.html:359-381`，逻辑在 `app-render.js:1097` `openAddTagModal()`；AI 字段显隐在 `app-render.js:1119` `toggleAddAiFields()`，标签类型 change 事件由 `app-core.js` 的 `bindEvents()` 绑定；提交在 `app-render.js:1127` `handleAddTagSubmit()`。
- 编辑标签：`index.html:387-410`，逻辑在 `app-render.js:1174` `openEditTagModal()`；如果标签来自素材使用汇总但尚未进入 `db.tags`，`createTagRecordFromUsage()` 会先补齐标签库记录再打开弹窗；AI 来源只展示不允许编辑，人工新增 AI 标签固定为“业务预定义”，上传/重新识别补入的 AI 标签固定为“AI 自动识别”；AI 字段显隐在 `app-render.js:1202` `toggleEditAiFields()`，标签类型 change 事件由 `app-core.js` 的 `bindEvents()` 绑定；提交在 `app-render.js:1210` `handleEditTagSubmit()`。
- AI 识别字段（aiRecognitionRow）：新增/编辑弹窗中共两处 checkbox，`index.html:379` 和 `index.html:408`；业务标签（tagType=1）不显示该字段，AI 标签（tagType=2）才显示，由各自的 `toggleXxxAiFields()` 控制。注意：`.checkbox-label` CSS（`styles.css:3067`）有 `display: flex !important`，必须用 `classList.toggle("hidden")` 控制显隐，不能用 `style.display`，否则会被 CSS 覆盖。补充覆盖规则见 `styles.css:3081` `.checkbox-label.hidden`。
- 合并标签：`index.html:416-431`，逻辑在 `app-render.js:1298` `openMergeTagModal()`。
- 标签合并弹窗的源标签选择已从原生 `select multiple` 改为 checkbox 勾选列表；HTML 在 `index.html:425` 附近 `#mergeSourceTags`，打开弹窗由 `app-render.js` 的 `openMergeTagModal()` 动态生成勾选项，提交由 `handleMergeTagSubmit()` 读取已勾选项；`#mergeClearSelected` 通过 `clearMergeTagSelection()` 一键清除勾选。

## 分享与收集

- 分享素材组弹窗：`index.html:667-693`，逻辑在 `app-workflows.js:128` `openShareCurrentModal()`。
- 分享单素材弹窗：`index.html:475-501`，逻辑在 `app-workflows.js:167` `openShareAssetModal()`。
- 素材篮分享：`index.html:317-353`，逻辑在 `app-workflows.js:51` `openBasketShareModal()`。
- 分享过期时间更新：`index.html:699-724`，逻辑在 `app-workflows.js:68`。
- 创建收集任务：顶部按钮在 `index.html:93` `#newCollectTask`，事件绑定在 `app-core.js:760` 附近；弹窗逻辑在 `app-actions.js:1311` 和 `app-actions.js:1322`。
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

## 系统管理

- 入口层级：左侧“更多功能”弹出菜单中的“系统管理”分组，子菜单为用户管理、角色管理、组织管理、权限管理。
- 页面状态值：`users`、`roles`、`organizations`、`permissions`。
- 数据结构：`db.users` 保存登录用户名、密码、姓名、所属组织、所属角色、状态、最近登录；用户角色标准字段为 `roleIds`（数组，多角色），`roleId` 仅作为旧数据兼容和首个角色冗余字段；`db.organizations` 保存组织；`db.roles` 保存角色和 `permissions`；`db.orgPermissions` 保存组织/部门菜单授权；`db.userPermissions` 保存个人菜单授权。
- 登录日志结构：`db.loginLogs` 保存 `{ username, name, loginAt, ip, entry }`；登录入口值包括“网页登录 / 飞书登录 / 企微登录”。纯前端版本暂用 `127.0.0.1` 作为 IP 占位，后续接服务端可替换真实来源 IP。
- 默认账号：`admin / admin123`（超级管理员）、`kerry / kerry123`（素材运营）、`tagview / tag123`（标签只读）。
- 默认数据补齐：`app-core.js` 的 `ensureSystemData()` 会初始化组织、角色、用户，并为每个角色、组织、用户补齐 `db.menus` 中所有菜单的 `visible/editable` 权限。
- 页面白名单：`app-core.js:286` `normalizePageState()` 的 `validPages`。
- 主导航激活：`app-render.js:8` 的 `morePage` 数组，系统管理子页会高亮“更多功能”。
- 标题映射：`app-render.js:19` `titleMap`。
- 面包屑：`app-utils.js:234` `getPageBreadcrumb()`。
- 权限判断：`app-core.js` 的 `getMenuPermission(menuId)` 会合并多个角色权限、组织权限、个人权限；任一来源有 `visible` 即可见，任一来源有 `editable` 即可编辑且默认可见。`getUserRoleIds()` 兼容读取 `roleIds` 和旧 `roleId`，`canViewMenu(menuId)` 控制菜单可见，`canEditMenu(menuId)` 控制页面操作。
- 菜单过滤：`app-core.js` 的 `isVisibleNavMenu()` / `getVisibleNavMenuChildren()` 按 `valid`、`hidden` 和 `canViewMenu(page)` 过滤左侧菜单树；空分组不展示。
- 渲染入口：`app-render.js:506` `renderManagePageV2()` 先判断系统管理页面并转到 `renderSystemManagePage()`。
- 页面表格：`app-render.js` 的 `renderUserManagePage()` / `renderRoleManagePage()` / `renderOrganizationManagePage()` / `renderPermissionManagePage()` 分别渲染用户、角色、组织、权限。角色管理行内有“角色权限”按钮，调用角色授权弹窗。
- 用户管理页：`renderUserManagePage()` 已改为左组织树、右人员信息布局；组织树由 `renderUserManageOrgTree()` 渲染，人员筛选由 `getUserManageFilteredUsers()` 处理，支持用户名、员工姓名、是否包含下级组织查询；选中用户后可修改、菜单授权或菜单权限查看，查看弹框为 `openUserPermissionViewModal()`。组织树有子节点时使用明确的 `+/-` 展开收起图标，不能用空方框样式；左侧组织树不显示人数数字，不保留外层框线。编辑用户时登录用户名只读不可改，所属角色为多选并保存到 `roleIds`。
- 权限管理页：`renderPermissionManagePage()` 支持“按菜单授权”和“按组织个人授权”两个参考系；内部不再使用下拉框，`renderMenuPermissionTree()` 渲染功能菜单树，`renderSubjectPermissionTree()` 渲染组织/个人树；右侧默认空态，选中左侧节点后由 `renderMenuPermissionDetail()` 或 `renderSubjectPermissionDetail()` 展示权限摘要和“编辑权限”按钮。权限管理中的所有树状结构也必须使用明确的 `+/-` 展开收起图标，并真正支持收缩。
- 权限编辑弹框：选中菜单后点“编辑权限”会调用 `openMenuPermissionModal()`，弹框内用组织/个人树编辑该菜单对组织/个人的可读可写；选中组织或个人后点“编辑权限”会调用 `openSubjectPermissionModal()`，弹框内用菜单分组树编辑该对象对所有菜单的可读可写；保存逻辑在 `savePermissionRows()`。角色管理中的“角色权限”弹框 `openPermissionManageModal()` 也使用菜单分组树，不再用平铺表格。弹框树同样支持 `+/-` 展开收起，弹框内收缩不丢失未保存勾选。用户“菜单权限查看”由 `renderUserPermissionViewTree()` 渲染只读树，显示可读、可写和权限来源（个人授权、组织权限、角色权限）。
- 表单：`openUserManageModal()`、`openRoleManageModal()`、`openOrganizationManageModal()`、`openPermissionManageModal()` 使用通用 `openFormModal()` 做新增/编辑/角色授权；新增用户会初始化 `db.userPermissions`，新增组织会初始化 `db.orgPermissions`。
- 用户登录日志：`renderLoginLogPage()` 支持按用户名、姓名、登录开始日期、登录结束日期过滤，展示用户名、姓名、登录时间、IP 地址、登录入口。
- 样式：`styles.css:1118` `.menu-section` / `.menu-section-title` / `.menu-sub button` 控制下拉菜单分组。
- 页面独立性：管理页壳 `app-render.js:617` `renderManageShell()` 不再渲染 `renderMoreMenuPanel()`；`app-core.js` 也不再监听 `data-panel-page`，避免在页面内用 tab 切换更多功能子菜单。

## 值列表管理

- 页面状态值：`valueLists`（已加入 `normalizePageState()` 的 `validPages`）。
- 菜单入口：由 `db.menus` 中 `page="valueLists"` 的页面节点驱动，在左侧菜单树中通过 `data-page="valueLists"` 进入。
- 菜单权限：`db.menus` 包含 `valueLists`，受 RBAC 控制。
- 渲染入口：`app-render.js` `renderValueListPage()`。

### 数据结构（统一树模型）
- 使用 `db.valueListTree` 单一数组，废弃旧的 `db.valueListDefinitions` + `db.valueListItems` 双表。
- 节点字段：`id, code, name, type, parentId, refId, description, attr1, attr2, status, sortOrder`。
- type 取值：`root`（根节点）、`dimension`（维度/分类）、`group`（分组）、`value`（选项值）。
- 树以"值列表"（`vl_root`, parentId=null）为根节点，"素材库筛选"（`vl_dim_matlib`）为其子节点。
- 种子数据：`app-core.js:73` `SEED_VALUE_LIST_TREE`。

### 树派生函数（app-core.js）
- `getTreeChildren(parentId)`：按父节点+status=enabled 获取子节点。
- `getTreeNodeById(id)` / `getTreeNodeByCode(code)` / `getTreeNodeByName(name)`：按 ID/编码/名称查找。
- `getDimensionNodes(parentDimId)`：获取 material_lib 下所有 dimension 节点。
- `getTreeChildrenByRefIds(dimCode, refIds)`：按关联 refId 过滤子节点（用于级联筛选）。
- `getAllLeafValues(dimCode)`：递归获取维度下所有叶子 value 节点。
- `buildFilterTree(dimCode)`：构建筛选菜单树形结构。
- `getAllUploadAccept()`：从 file_format 维度动态获取上传 accept 值。

### 筛选系统动态化
- 所有筛选值从 `db.valueListTree` 动态读取，不再依赖静态常量。
- `app-actions.js` `getFilterValues()` 使用 `buildFilterTree()` / `getAllLeafValues()` / `buildCascadeTree()`。
- `buildCascadeTree(dimCode, parentFilter, parentDimCode)`：通用级联函数，根据上级筛选值过滤下级选项。
- **已删除废弃常量**：`FILE_FORMAT_CATEGORIES`、`UPLOAD_FILE_FORMATS`、`UPLOAD_ACCEPT`、`COLLECT_TASK_FILE_TYPES`、`ASPECT_RATIOS`（2026-07-02 清理）
- **种子数据**：model 字段从 `vl_dim_model` 子节点读取（`SEED_VALUE_LIST_TREE.filter(n => n.parentId === "vl_dim_model")...`），不再使用任何旧车型静态常量。

### 页面布局
- 左侧树 + 右侧搜索表格（`styles.css` `.value-list-layout`：grid 260px+1fr）。
- 左侧树：`renderValueListTreeNodes(tree, null, 0)` 从 null parentId 开始递归渲染完整树，支持展开/折叠/选中高亮。根节点"值列表"在树中可见。
- 右侧：搜索栏（按编码/名称过滤）+ 操作按钮（新增/修改/删除当前节点）+ 面包屑导航 + 子节点表格。
- 表格列：编码、名称、类型、描述、**关联管理**（父级 `名称 (code)` / refId 关联节点 `名称 (code)`）、**属性值**（attr1 / attr2）、子节点数、状态、操作。
- 状态管理：`state.valueListSearch` / `state.valueListSelectedNodeId` / `state.valueListExpandedIds`。

### 弹框（index.html）

- `#valueListModal`：新增/编辑节点。表单字段：编码、名称、类型（root/dimension/group/value）、父级下拉（禁用，默认当前节点且不可改）、**关联码(refId) 树状下拉**、描述、属性1、属性2、状态。逻辑：`openValueListModal(nodeId, parentId)` / `saveValueList(data)`。
- 保留旧弹框 `#valueListItemListModal` / `#valueListItemFormModal`（不再被新布局调用，保留代码兼容）。
- 2026-07-02 修复：`renderValueListRefIdDropdown()` 和 `bindRefIdDropdownEvents()` 已覆盖为稳定版本；关联码打开时完整展示值列表树，编辑已有节点时按 `refId` 回填 `#valueListRefIdSearch` 和选中态，选择节点后同步更新隐藏字段 `#valueListRefId`。
- 2026-07-02 追加：关联码已从只读触发框改为可输入搜索的树状下拉，HTML 在 `index.html` 的 `#valueListRefIdSearch` / `#valueListRefIdPanel`，支持按名称、编码、描述、属性1、属性2过滤；例如输入“东风”会保留匹配节点及其父级路径。样式在 `styles.css` 的 `.tree-dropdown-input`、`.tree-dropdown-trigger`、`.tree-dropdown-panel .tree-item`，输入和选中项保持普通表单字重，不额外加粗。
- 2026-07-03 第二批代码审计优化：值列表后代节点收集统一为 `collectValueListDescendantIds(tree, rootId, options)`；查看旧小类弹窗默认排除 `status=deleted`，删除节点时传 `{ includeDeleted: true }`，保持原有两处逻辑差异。

### 事件绑定
- 页面级：`bindValueListEvents()` 绑定树展开/选择、搜索、新增/修改/删除当前节点、行内操作。
- 弹框级：`initValueListModalEvents()` 在 `bootstrap()` 中一次性绑定表单提交和关闭按钮。
- 下拉填充：
  - `populateValueListParentSelect(excludeNodeId)` 填充节点弹窗的父级下拉。
  - `populateValueListRefIdSelect(excludeNodeId)` 填充节点弹窗的关联码(refId)下拉，递归生成带缩进的树形 option，排除当前节点及其子孙节点以避免循环引用。

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

- 2026-07-03 第二批代码审计优化已将新增/编辑标签类型的内联 `onchange` 迁移到 `app-core.js` 的 `addEventListener("change", ...)`，`index.html` 当前不再保留这两处内联事件。
- 2026-07-03 代码审计第一批优化已清理旧协作弹窗 `memberPermissionModal` 及 `styles.css` 中明确标注的 Collaboration modal 残留样式。
- 2026-07-03 bug 修复：`render()` 中标签页渲染分支必须先于 `getManagedPages()` 管理页分支判断，否则 `tags` 会被动态菜单识别为管理页并落入有效期管理兜底渲染。
- 2026-07-03 bug 修复：`ensureSystemData()` 仅在 `db.menus` 不存在或为空时初始化 `getDefaultMenus()`，不再每次启动覆盖菜单管理保存的新增、修改、删除结果。

## 点检建议

- 改筛选/排序：先测顶部筛选、多选、排序菜单、素材数量、控制台。
- 改标签：先测标签管理页表格、卡片、编辑、新增、合并、AI 标签跳转筛选。
- 改日期：先测 `readonly`、日期控件可选择、不能手填、提交值格式。
- 改分享/收集：先测创建链接、复制链接、过期时间、收集任务落地页。
- 改回收站：先测软删、恢复、硬删、清空、删除时间排序。

## 2026-06-22 补充

- 左侧主导航已删除“我收藏的组”功能模块入口；`favorite` 页面筛选、标题、面包屑已移除。素材组菜单中的收藏/取消收藏、订阅/取消订阅也已删除；这些字段没有有效业务使用。旧链接或旧状态如进入 `page=favorite`，会通过 `app-core.js` 的 `normalizePageState()` 按非法页面回退到 `all`。

### 筛选树形结构数据规范

- 树形节点增加 selectable 属性，true 表示可选中，false 表示仅作为分类标题（不可选中）
- 品牌筛选：品牌为可选中的顶级节点，无子节点
- 车系筛选：品牌为分类标题（不可选中），车系为可选中子节点
- 车型筛选：品牌为分类标题（不可选中），车系为子分类标题（不可选中），车型为可选中节点
- 文件格式筛选：格式类别为分类标题（不可选中），具体格式为可选中节点
- 标签筛选：所有标签节点均可选中
- 分类标题样式：加粗显示，hover背景色较浅

## 2026-06-29 修复筛选菜单屏蔽问题

- **问题**：选中某个筛选选项后，再次打开筛选菜单时其他选项被屏蔽，只显示已选中的选项
- **根因**：buildSeriesTree、buildModelTree、buildColorTree 函数错误地使用当前筛选值来过滤显示的选项
- **修复方案**：移除使用当前筛选值（如 brandFilter、seriesFilter、modelFilter）来过滤显示选项的逻辑
- **修改的函数**：
  - buildBrandTree()：始终显示所有品牌
  - buildSeriesTree()：始终显示所有品牌及其车系
  - buildModelTree()：始终显示所有品牌、车系及其车型
  - buildColorTree()：始终显示所有颜色
- **效果**：筛选菜单始终显示所有可用选项，选中状态只是高亮显示，不会屏蔽其他选项

## 2026-06-29 优化筛选菜单显示格式

- **问题**：车系和车型筛选显示了品牌/车系作为分类标题，用户要求界面上只显示可选中的选项，不显示分类标题
- **根因**：buildSeriesTree 和 buildModelTree 返回了树形结构，包含不可选中的品牌/车系父节点
- **修复方案**：
  - buildSeriesTree()：根据品牌筛选值过滤车系，返回扁平列表（无品牌分类标题）
  - buildModelTree()：根据品牌和车系筛选值过滤车型，返回扁平列表（无品牌/车系分类标题）
  - buildColorTree()：根据品牌、车系、车型筛选值过滤颜色，返回扁平列表
- **效果**：车系、车型、颜色筛选界面只显示可选中的选项，无分类标题，但仍保持联动筛选逻辑
- **保持树形结构的筛选**：文件格式（有格式类别）、业务标签、AI标签（多层级标签）

## 2026-06-29 修改筛选自定义配置

- 删除：筛选自定义配置中的文件高度和文件宽度选项
- 宽高比：改为下拉框，选项包括：1:1、3:4、9:16、4:3、3:2、16:9、21:9
- 文件大小：改为多选，选项包括：<=5MB、5MB～10MB、10MB～50MB、>50MB
- 宽高比筛选逻辑：根据素材的 aspectRatio 字段或 width/height 计算值进行匹配
- 文件大小筛选逻辑：根据素材的 sizeBytes 字段进行区间匹配

## 2026-06-29 修复筛选条件过多被遮挡问题

- 问题：当选择的筛选条件太多时，后面的筛选条件会被遮住
- 修复方案：为 .filters 容器添加 overflow-x: auto 属性，支持水平滚动
- 样式优化：设置滚动条为细样式，颜色为主题色

## 2026-06-29 修复业务标签分组层级不生效问题

- 问题：业务标签在标签管理页面中显示为扁平表格，没有层级展示
- 根因1：业务标签的数据中所有 parentId 都是 0
- 根因2：标签管理页面使用 businessTags（扁平列表）而不是 businessTagTree（树形结构）
- 根因3：handleAddTagSubmit 和 handleEditTagSubmit 中业务标签的 parentId 被强制设置为 0
- 修复方案：
  1. 修改标签管理页面使用 businessTagTree 并扁平化展示
  2. 移除业务标签 parentId 强制为 0 的限制
  3. 修改业务标签初始数据，添加父级关系
  4. 修改标签添加/编辑弹窗中父级标签的标题为通用名称
- 效果：业务标签现在支持多层级展示，与AI标签一致
## 2026-07-06 app-core/app-actions 格式报错排查

- `app-core.js`：重点排查 HTML 实体残留，确认 `=>`、`<`、`>`、`&&` 没有被写成 `=&gt;`、`&lt;`、`&gt;`、`&amp;&amp;`。
- `app-actions.js`：曾出现中文字符串损坏导致语法错误，后续禁止使用 PowerShell `Set-Content` 整文件重写，继续使用 `apply_patch` 做局部补丁。
- 素材编辑弹框 JS 已与当前 HTML 字段保持一致：品牌、车系、车型、内饰色、外饰色由值列表动态回填，并保存到 `asset.series / asset.interiorColors / asset.exteriorColors`。
- 本次验证：主要 JS 文件均已通过 `node --check`，`app-core.js` 与 `app-actions.js` 未检出 HTML 实体操作符残留。
## 2026-07-06 素材编辑候选下拉修复

- 素材编辑弹框不再使用原生 `datalist` 展示品牌、车系、车型、内饰色、外饰色和业务标签候选；原生 `datalist` 会按当前输入值过滤，导致已有值为“东风雪铁龙”时只能看到一个候选。
- `index.html` 中素材编辑字段改为 `.asset-edit-combo` 结构，输入框仍保留原 `name`，保存字段和表单提交结构不变。
- `app-actions.js` 的 `setupAssetEditDropdown()` 统一管理候选下拉：聚焦或点击箭头展示完整候选，输入时过滤；品牌/车系/车型继续按值列表 `refId` 级联，业务标签候选来自 `getTagSummary().businessTags`。
- `styles.css` 仅新增 `.asset-edit-combo*` 样式，限制在素材编辑弹框候选面板使用。
## 2026-07-06 素材编辑候选下拉细节修复

- 内饰色、外饰色在素材编辑弹框中是单选字段，不使用 `multiple: true`；保存时仍写入 `asset.interiorColors / asset.exteriorColors` 数组，但数组最多保留一个值以兼容既有展示逻辑。
- `.asset-edit-combo-panel` 背景不能使用未定义的 `--panel` 变量；已改为 `var(--surface, #fff)` 并提高 z-index，避免下拉面板透明或被表单字段文字压住。
