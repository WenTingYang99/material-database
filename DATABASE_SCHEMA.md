# 素材库数据结构说明

更新时间：2026-06-22

当前实现使用 `data/db.json` 作为存储文件，并通过 Repository 层访问。本文档描述当前 JSON 表结构及后续 MySQL Repository 应遵守的业务语义。

## 全局规则

- 所有业务删除都是软删除：只能更新 `status` 或 `deleted_flag`，不得物理删除表记录。
- 业务代码不得直接读写 `data/db.json`，必须通过 Repository。
- 标签、日志、分享、收集等可变业务数据不放入素材主表，通过独立表和关联表维护。
- `legacy-static/` 仅作迁移参考，不属于当前运行数据结构。

## 当前核心表

### `t_employee`

用户表，用于登录和素材所有者展示。

- `EMPLOYEE_ID`：用户主键。
- `LOGIN_NAME`：登录名。
- `LOGIN_PWD`：当前 JSON 演示版密码字段。
- `ACTUAL_NAME`：显示姓名。
- `DEPARTMENT_ID`：部门 ID。
- `DISABLED_FLAG` / `DELETED_FLAG`：禁用和软删除标记。
- `ADMINISTRATOR_FLAG`：管理员标记。
- `CREATE_TIME` / `UPDATE_TIME`：创建和更新时间。

### `t_asset`

素材主表，只保存素材自身稳定字段和统计字段。

- `asset_id`：素材主键。
- `name`：素材名称。
- `file_path`：素材文件路径。当前上传文件保存到 `public/uploads/` 后写入相对路径。
- `thumbnail_path`：缩略图路径；没有独立缩略图时可复用文件路径。
- `original_name`：原始文件名。
- `format`：文件格式，大写，如 `JPG`、`MP4`、`PDF`。
- `media_type`：媒体类型，如 `图片`、`视频`、`文档`、`文件`。
- `file_size`：文件大小，单位字节。
- `width` / `height` / `aspect_ratio` / `duration`：媒体元信息；当前 JSON 演示版未做精确解析时可为空。
- `brand` / `model` / `dominant_color`：识别或编辑得到的品牌、车型、主色。
- `description`：素材描述。
- `permission`：权限范围展示字段。当前为演示字段，尚未接入真实权限校验。
- `status`：业务状态，如 `active`、`待入库`、`deleted`。
- `group_id`：所属素材组。
- `owner_id` / `department_id` / `created_by`：所有者、部门、创建人。
- `valid_from` / `valid_until`：生效和失效时间。
- `share_count` / `download_count` / `view_count`：统计字段。
- `created_from`：创建来源。
- `deleted_flag`：软删除标记，`1` 表示进入回收站。
- `create_time` / `update_time`：创建和更新时间。

业务语义：

- 普通删除和素材组删除都只能把素材标记为 `deleted_flag = 1` 或 `status = deleted`。
- 回收站恢复把 `deleted_flag` 恢复为 `0`，并将状态恢复为可用状态。
- 不允许从 `t_asset` 物理删除记录。

### `t_asset_group`

素材分组树。

- `group_id`：素材组主键。
- `group_name`：素材组名称。
- `parent_id`：父级素材组 ID；`0` 表示一级组。
- `depth`：层级深度。
- `description`：说明。
- `is_system`：是否系统组，系统组不能编辑或删除。
- `status`：状态，如 `active`、`deleted`。
- `asset_count`：冗余计数字段；当前展示以素材表实时聚合为准。
- `owner_id`：创建或拥有者。
- `deleted_flag`：软删除标记。
- `create_time` / `update_time`：创建和更新时间。

业务语义：

- 删除素材组为软删除，会把该组及子组标记删除。
- 删除素材组时，组内素材也进入回收站。
- 不允许物理删除素材组记录。

### `t_asset_tag`

标签表，包含业务标签和 AI 标签。

- `tag_id`：标签主键。
- `tag_name`：标签名称。
- `tag_code`：标签编码，由 Repository 自动生成。
- `parent_id` / `level`：树形标签字段；业务标签保持扁平，AI 标签可通过父级形成层级。
- `tag_type`：标签类型，当前使用 `custom` 和 `ai`。
- `ai_source`：AI 来源标记，业务标签为 `0`。
- `ai_recognition_enabled`：是否参与 AI 识别期望。
- `is_visible`：是否可见。
- `status`：启用状态。
- `sort_order`：排序。
- `description`：说明。
- `created_by`：创建人；AI 自动标签可为空。
- `deleted_flag`：软删除标记。
- `create_time` / `update_time`：创建和更新时间。

业务语义：

- 新增业务标签或 AI 标签时自动生成 `tag_code`。
- 标签管理页按旧静态页弹框语义写入 `tag_type`、`parent_id` 和 `ai_recognition_enabled`；业务标签保存为 `custom`，AI 标签保存为 `ai`。
- 素材编辑业务标签时，若标签不存在，会自动补齐业务标签。
- 标签合并会把源标签关联转移到目标标签，然后将源标签 `status = 0`、`deleted_flag = 1`。
- 不允许物理删除标签记录。

### `t_asset_tag_rel`

素材和标签的多对多关联表。

- `rel_id`：关联主键。
- `asset_id`：素材 ID。
- `tag_id`：标签 ID。
- `tag_type`：关联类型，`custom` 或 `ai`。
- `create_time`：创建时间。

业务语义：

- 素材业务标签编辑会重建该素材的 `custom` 标签关联。
- AI 标签关联不受业务标签编辑影响。
- 标签合并时需要去重，避免同一素材重复关联同一标签。

### `t_asset_operation_log`

素材操作日志表。

- `log_id`：日志主键。
- `asset_id`：关联素材，可为空。
- `user_id`：操作用户。
- `action`：动作类型，如 `upload`、`edit`、`delete`、`restore`、`share`、`view`。
- `message`：展示文案。
- `metadata`：附加信息。
- `create_time`：创建时间。

业务语义：

- 上传、编辑、删除、恢复等操作写入日志。
- 日志不再嵌入素材主表，展示时由 Repository 聚合。

### `t_share_record`

分享记录表。

- `share_id`：分享主键。
- `share_name`：分享名称。
- `creator_id`：创建人。
- `target_type`：分享目标类型，`asset`、`group` 或 `basket`。
- `access_level`：访问范围，`internal`、`public`、`specified`。
- `allow_download`：是否允许下载。
- `include_attachment`：是否包含附件。
- `password`：访问密码；当前公开页尚未接入密码校验。
- `share_code`：分享码。
- `share_link`：分享链接。
- `expires_at`：过期时间。
- `visit_count` / `view_count` / `download_count`：统计字段。
- `status`：`active`、`expired`、`closed`。
- `create_time` / `update_time`：创建和更新时间。

业务语义：

- 快速分享选中素材或素材篮时写入本表。
- 公开分享页会校验 `status` 和 `expires_at`。
- 访问统计、下载统计、密码校验仍属于后续真实后端能力。

### `t_share_target_rel`

分享目标关联表。

- `rel_id`：关联主键。
- `share_id`：分享 ID。
- `target_type`：目标类型，当前保存 `asset` 或 `group`。
- `target_id`：目标 ID。
- `create_time`：创建时间。

业务语义：

- 分享单素材写入 `asset` 目标。
- 分享素材组写入 `group` 目标，公开页会展开组内素材。
- 分享素材篮会拆成多条 `asset` 目标。

### `t_collect_task`

收集任务表。

- `task_id`：任务主键。
- `theme`：任务主题。
- `description`：任务说明。
- `group_id`：收集后预期存放素材组。
- `status`：`active`、`expired`、`closed`。
- `access_code`：访问码。
- `allowed_file_types`：允许文件类型数组。
- `expires_at`：失效时间。
- `creator_id`：创建人。
- `create_time` / `update_time`：创建和更新时间。

业务语义：

- 收集任务管理页创建任务。
- 公开收集页通过 `access_code` 查询任务。

### `t_collect_submission`

收集提交记录表。

- `submission_id`：提交主键。
- `task_id`：收集任务 ID。
- `uploader_name`：提交人。
- `contact`：联系方式。
- `remark`：备注。
- `status`：`submitted`、`stored`、`rejected`。
- `create_time`：提交时间。

业务语义：

- 公开收集页提交表单时写入本表。
- 当前只实现提交记录，入库/拒收流转为后续后台工作流。

### `t_collect_upload_file`

收集上传文件明细表。

- `file_id`：文件主键。
- `submission_id`：提交记录 ID。
- `asset_id`：入库后关联的素材 ID；当前未自动入库时为空。
- `file_name`：原始文件名。
- `file_path`：文件保存路径。当前保存到 `public/uploads/collect/`。
- `format`：文件格式。
- `file_size`：文件大小。
- `upload_status`：`uploaded`、`stored`、`failed`。
- `create_time`：创建时间。

业务语义：

- 公开收集页上传文件时写入本表。
- 当前不自动转为正式素材；后续入库时再回填 `asset_id` 和 `upload_status = stored`。

## 当前未接入或仅演示的能力

- MySQL Repository 尚未实现，本文档作为未来 MySQL 表结构和语义依据。
- 百度网盘导入入口已隐藏，功能保留但未接后端。
- 权限校验、密码访问、访问统计、下载统计仍为后续真实后端能力。
- 媒体宽高、视频时长、主色识别、真实 AI 识别当前未做精确解析。
