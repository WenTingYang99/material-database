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
- 已将标签和日志从素材主表拆出，通过关联表和日志表聚合。
- 已实现部分素材操作：批量软删除、回收站批量恢复、回收站彻底删除、批量更新失效时间、新建素材组。
- 已实现回收站页面初版，并接入 `mode="recycle"`。
- 已实现标签管理页的新增标签入口，标签编码由 Repository 自动生成。
- 已实现分享管理页、收集任务管理页、公开分享页、公开收集页的基础数据结构和入口。
- `npm run typecheck` 当前通过。

## 尚未迁移完的主要功能

1. 文件上传、上传设置、文件格式白名单校验、媒体信息读取、AI 标签识别模拟、车型识别、百度网盘导入。
2. 素材详情查看器：预览大图/视频、上一张/下一张、缩放、平移、详情侧栏、自适应布局。
3. 素材编辑弹窗：名称、描述、权限、有效期、标签、分组等完整编辑能力。
4. 完整筛选与排序：多选筛选菜单、筛选配置、相似搜索、显示全部素材组开关、列表视图。
5. 素材组完整管理：编辑、移动、删除、层级调整、折叠状态、组菜单。
6. 标签完整管理：编辑、禁用/启用、合并、AI 标签字段、标签使用统计、点击标签跳转筛选。
7. 素材篮：加入/移除、计数、批量有效期、批量分享、篮内操作。
8. 分享完整流程：从素材/素材组/素材篮发起分享、权限校验、密码访问、过期状态流转、下载权限、访问统计。
9. 收集完整流程：公开提交表单、文件上传、提交记录、上传文件明细、入库/拒收状态流转。
10. 权限与所有者相关弹窗：修改权限、申请权限、所有者查看，以及后续真实权限校验。
11. 有效期管理页、用户动态页、待入库页、我创建的组页面仍主要是列表/骨架，需要补齐旧版交互。
12. MySQL Repository 尚未实现，目前只有 JSON 存储实现。

## 迁移注意事项

- 新功能应优先落在 `src/`、`data/`、`public/`，不要让 Next 代码依赖 `legacy-static/`。
- 业务页面不要直接读写 `data/db.json`，统一通过 Repository 访问。
- 文档统一使用 UTF-8 保存。
- 当前部分 Next 源码中的中文文案也存在乱码显示风险，后续迁移 UI 时应顺手修复对应页面/组件文案。

