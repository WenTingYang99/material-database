# 素材库 Next.js 迁移版

当前主项目路径：`E:\material-database`

旧的纯前端静态 SPA 已作为迁移参考归档在 `legacy-static/`。Next.js 新项目不应引用、导入或依赖 `legacy-static/` 内的任何文件；该目录只用于对照旧交互和视觉表现。

## 技术栈

- Next.js `16.2.6` App Router
- React `19.2.4`
- TypeScript `5.x`
- TailwindCSS `4.x`
- JSON 文件存储 + Repository 抽象层
- JWT Cookie 登录守卫

## 运行方式

```bash
npm install
npm run dev
```

默认账号：

- 用户名：`admin`
- 密码：`admin`

## 环境变量

复制 `.env.example` 为 `.env.local`，按需调整：

```bash
DATA_STORE=json
JSON_DB_PATH=./data/db.json
AUTH_SECRET=replace-with-a-long-random-secret
```

## 当前数据结构

`data/db.json` 已按 PRD/Excel 字段拆成表结构，不再把标签、日志、分享、收集等可变业务数据塞进素材主表。

核心表：

- `t_employee`：用户表
- `t_asset`：素材主表
- `t_asset_group`：素材分组树表
- `t_asset_tag`：标签表
- `t_asset_tag_rel`：素材标签关联表
- `t_asset_operation_log`：用户操作日志表
- `t_share_record`：分享记录表
- `t_share_target_rel`：分享对象关联表
- `t_collect_task`：收集任务表
- `t_collect_submission`：收集提交记录表
- `t_collect_upload_file`：收集上传文件表

## 当前迁移进度

- 已搭建 Next.js App Router、TypeScript、TailwindCSS 基础结构。
- 已实现登录页、JWT Cookie、路由守卫。
- 已实现 JSON Repository 抽象层：用户、素材、素材组、标签、分享、收集。
- 已实现素材首页初版：顶部栏、侧边素材组、工具栏、素材卡片、基础选择。
- 已实现素材详情查看器初版：卡片点击预览、上一张/下一张、基础缩放、详情信息侧栏。
- 已实现素材基础编辑：可从查看器编辑名称、描述、品牌、车型、权限、素材组、生效时间、失效时间和业务标签。
- 已实现素材筛选初版：素材来源、文件格式、车型、品牌、权限范围、业务标签、AI 标签和素材失效日可筛选。
- 已实现顶部搜索、列表视图、素材篮、相似素材筛选、快速分享选中素材/素材篮。
- 已实现素材组基础管理：当前素材组可编辑名称/父级，可软删除素材组并将组内素材移入回收站。
- 已实现标签编辑与合并：标签可编辑名称/描述/状态，合并会转移关联并软删除源标签。
- 已实现公开分享页素材展示，并支持素材组分享展开组内素材。
- 已实现公开收集页提交记录和文件上传明细，文件保存到 `public/uploads/collect/`，暂不自动入库为正式素材。
- 已将标签和日志从素材主表拆出，通过关联表和日志表聚合。
- 已实现部分素材操作：上传文件入库、批量软删除、回收站批量恢复、批量更新失效时间、新建素材组。
- 已实现回收站页面初版，并接入 `mode="recycle"`。
- 已实现标签管理页的新增标签入口，标签编码由 Repository 自动生成。
- 已实现分享管理页、收集任务管理页、公开分享页、公开收集页的基础数据结构和入口。
- `npm run typecheck` 当前通过。

## 尚未迁移完的主要功能

1. 上传设置弹窗、精确媒体尺寸/时长读取、真实 AI 识别仍未接入；当前只有基于文件名和类型的模拟识别。
2. 素材详情查看器仍缺拖拽平移、完整详情标签页、下载行为、浏览计数持久化。
3. 权限体系仍是演示字段，未接入真实成员/部门权限校验。
4. 百度网盘导入入口按需求隐藏，功能保留但未接后端。
5. 有效期管理页、用户动态页、待入库页、我创建的组页面仍主要是列表/骨架。
6. MySQL Repository 尚未实现，目前只有 JSON 存储实现。

## 迁移注意事项

- 新功能应优先落在 `src/`、`data/`、`public/`，不要让 Next 代码依赖 `legacy-static/`。
- 业务页面不要直接读写 `data/db.json`，统一通过 Repository 访问。
- 删除策略统一为软删除：业务删除只能更新状态或 `deleted_flag`，不得从 JSON/数据库表中物理移除记录。
- 百度网盘导入功能保留为后续能力，但当前隐藏入口；需要时再恢复入口并补齐功能。
- 文档统一使用 UTF-8 保存。
- 每次代码、数据结构或数据语义变化后，需要同步更新 `README.md`、`CODE_MEMORY.md` 和 `DATABASE_SCHEMA.md`。

## 下一步迁移建议

1. 若要继续精修，优先接真实后端能力：媒体解析、AI 识别、权限校验、文件下载和网盘导入。
2. JSON 版剩余项主要是页面体验增强，不再阻塞主流程迁移。
