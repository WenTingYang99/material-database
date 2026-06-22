# 素材库 Next.js 迁移版

本目录以 Next.js App Router 迁移版为主。原生静态 SPA 已集中存放在 `legacy-static/`，仅作为归档参考；新项目代码不引用、不导入、不依赖旧项目文件。

## 技术栈

- Next.js `16.2.6`
- React `19.2.4`
- TypeScript `5.x`
- TailwindCSS `4.x`
- JSON 文件存储 + Repository 抽象层
- JWT Cookie 登录守卫

## 运行

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

## 当前迁移进度

- 已搭建 Next.js App Router、TypeScript、TailwindCSS 配置。
- 已实现 JSON Repository 抽象：素材、素材组、标签、用户。
- `data/db.json` 已按 PRD/Excel 字段改为表结构模型：`t_employee`、`t_asset`、`t_asset_group`、`t_asset_tag`、`t_asset_tag_rel`、`t_asset_operation_log`。
- 素材操作日志已拆成独立 `t_asset_operation_log`，标签通过 `t_asset_tag_rel` 关联，不再存放在素材主表属性里。
- 已实现登录页、JWT Cookie、Middleware 路由守卫。
- 已实现首页素材列表初版：顶部栏、侧栏素材组、工具栏、素材卡片。
- 原静态版本保留在 `legacy-static/index.html` 和 `legacy-static/app-*.js` 中，仅作为归档参考；Next 迁移版的运行文件只来自根目录配置、`src/`、`data/`、`public/`。

## 后续阶段

1. 继续迁移筛选、排序、多选、素材查看器。
2. 迁移上传、素材编辑、素材组 CRUD。
3. 迁移标签管理、分享/收集、素材篮、回收站、有效期管理。
4. 在 Repository 接口下增加 MySQL 实现。
