# JSON 到 MySQL 迁移预留方案

当前业务代码只依赖 `src/lib/db/repositories/interfaces.ts` 中的 Repository 接口。开发期使用 `src/lib/db/json/*`，后续切换 MySQL 时不需要改组件和 Server Actions。

原生静态 SPA 已迁入 `legacy-static/`。迁移时只把它当作归档参考；Next 新项目不得 `import`、复制运行时引用或依赖 `legacy-static/` 中的文件。

## 切换步骤

1. 新增 `src/lib/db/mysql/MysqlAssetRepository.ts` 等实现类。
2. 所有实现类保持与 `IAssetRepository`、`IGroupRepository`、`ITagRepository`、`IUserRepository` 一致。
3. 修改 `src/lib/db/repositories/factory.ts`，根据 `DATA_STORE=mysql` 返回 MySQL 实例。
4. 根据 `DATABASE_SCHEMA.md` 和 PRD Excel 字段编写 SQL 迁移脚本，把 `data/db.json` 中的 `t_asset`、`t_asset_group`、`t_asset_tag`、`t_asset_tag_rel`、`t_employee`、`t_asset_operation_log` 写入数据库。

## 注意

- JSON 存储适合开发演示，不适合多人高并发写入。
- 文件上传生产环境建议接入对象存储，数据库中只保存 URL 和元信息。
- 页面所需的 `customTags`、`aiTags`、`logs` 由 Repository 聚合生成，数据库主表不要反向塞这些数组字段。
