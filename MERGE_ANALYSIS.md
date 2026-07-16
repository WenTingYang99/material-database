# DPCA 素材库 & DPCA-AI 创意平台 — 数据库融合分析报告

> 最后核对日期：2026-07-15
> 本文与 `DATABASE_SCHEMA.md` 的关系（先读这段，避免混淆）：
> - `DATABASE_SCHEMA.md` 回答 **“素材库自身需要哪些表、字段长什么样”**——它是素材库的**目标态数据模型基准**（共 **26 张表**，含 RBAC 多角色、组织树、数据级 ACL、核心业务、协作、消息、配置），字段定义、ER 图、前端字段对照都在那里。
> - 本文回答 **“这 26 张表如何并入 DPCA-AI 创意平台（develop）现有的 SmartAdmin 库”**——它是**部署态融合策略**，逐表给出“新增 / 替换 / 扩展 / 合并”结论，并给出 SmartAdmin 命名规范下的建表 DDL。
> - 二者**不是同一份文档、也不是重复**：前者是源，后者是建立在前者之上的融合方案。本文的字段细节以 `DATABASE_SCHEMA.md` 为准，本文只补充“复用哪张现有表 / 怎么改名 / 怎么扩展”的部分。
> - 审计字段约定：所有素材库表均含创建时间 + 创建人；非纯追加表另含最后修改人。落地为 SmartAdmin 规范时表现为 `create_time`/`update_time`（时间）+ `created_by`/`updated_by`（人员，BIGINT FK→t_employee）；若表已有 `owner_id`/`creator_id`/`employee_id`/`publisher_id`/`granted_by`/`applicant_id` 等主体字段，该字段即充当 `created_by`，不再单列。纯追加表（`operation_logs`→`t_operate_log` 扩展、`user_sessions`→`t_login_log` 不复建）无 `updated_by`。
> - 现状：`just_html` 分支的素材库目前仍是 `localStorage` 纯前端原型，**本文与 `DATABASE_SCHEMA.md` 均未在前端实现**，属于后端落地规划。

---

## 总览矩阵（26 张表）

| # | 素材库表 | 融合策略 | develop 对应 | 说明 |
|---|---------|---------|-------------|------|
| 1 | `organizations` | 🔄 **替换** | **t_department** | 复用 SmartAdmin 部门树 |
| 2 | `users` | 🔄 **替换** | **t_employee** | 复用员工表 |
| 3 | `roles` | 🔄 **替换** | **t_role** | 复用角色表（新增 3 个素材库角色） |
| 4 | `user_roles` | 🔄 **复用** | **t_role_user** | 复用员工-角色关联 |
| 5 | `menus` | 🔄 **替换** | **t_menu** | 复用菜单表（新增素材库菜单树） |
| 6 | `role_menu_permissions` | 🔄 **替换** | **t_role_menu** | 复用角色-菜单权限 |
| 7 | `org_menu_permissions` | 🆕 **新增** | t_role_org_menu | 组织级叠加权限（SmartAdmin 无对应） |
| 8 | `user_menu_permissions` | 🆕 **新增** | t_role_user_menu | 用户级最高优先级权限 |
| 9 | `assets` | 🆕 **新增** | — | 素材库核心，无现成替代 |
| 10 | `tags` | 🆕 **新增** | — | 素材库标签（独立实体） |
| 11 | `asset_tags` | 🆕 **新增** | — | M:N 关联表 |
| 12 | `groups` | 🆕 **新增** | — | 素材组（树形） |
| 13 | `user_group_relations` | 🆕 **新增** | — | 用户-素材组收藏订阅 |
| 14 | `group_acl` | 🆕 **新增** | — | 素材组数据级 ACL（替代原 group_members 思路） |
| 15 | `asset_acl` | 🆕 **新增** | — | 素材数据级 ACL |
| 16 | `shares` | 🆕 **新增** | — | 素材库特有分享逻辑 |
| 17 | `collect_tasks` | 🆕 **新增** | — | 素材库特有收集任务 |
| 18 | `permission_requests` | 🔄 **替换** | warm-flow 工作流 | 用工作流引擎实现（删除独立 `approvals` 表） |
| 19 | `operation_logs` | 🔄 **扩展** | **t_operate_log** | 扩展字段复用 |
| 20 | `comments` | 🆕 **新增** | — | 素材评论（独立实体） |
| 21 | `system_notices` | 🔄 **替换** | **t_notice + t_notice_type** | 复用通知公告体系 |
| 22 | `notifications` | 🔄 **扩展** | **t_message** | 扩展消息类型复用 |
| 23 | `user_sessions` | 🔄 **替换** | **t_login_log + Sa-Token** | 复用现有登录体系（不复建） |
| 24 | `validity_reminders` | 🔄 **合并** | **t_config + t_smart_job** | 配置表+定时任务 |
| 25 | `upload_settings` | 🔄 **合并** | **t_config** | KV 配置化 |
| 26 | `filter_presets` | 🔄 **合并** | **t_table_column** | 复用列配置表 |

**统计**: 🆕 新增 12 张（含 RBAC 组织级/用户级权限矩阵 2 张）| 🔄 复用/替换/扩展/合并 14 张（合计 **26 张**，与 `DATABASE_SCHEMA.md` 一致）。

---

## 一、🔄 可共用 — 替换/扩展已有表

> 字段级定义（含类型、示例、枚举）见 `DATABASE_SCHEMA.md` 对应小节；本节只描述“复用方式 + 差异处理 + 审计字段落地”。

### 1.1 organizations → t_department（替换）

`organizations` 即 SmartAdmin 的 `t_department` 部门树，直接复用；素材库只需在 `t_department` 中标识出素材库使用的部门节点。

| 素材库字段 | develop 对应字段 | 匹配 | 处理方式 |
|-----------|-----------------|------|---------|
| `id` | `dept_id` | ✅ | 组织 ID 对齐 |
| `name` | `dept_name` | ✅ | 一一对应 |
| `parent_id` | `parent_id` | ✅ | 树形复用 |
| `manager` | `leader` / `charge_person` | ✅ | 负责人 |
| `status` | `status` | ✅ | enabled/disabled |
| `created_at`/`created_by` | `create_time`/`created_by` | ✅ | 审计字段对齐 |
| `updated_at`/`updated_by` | `update_time`/`updated_by` | ✅ | 审计字段对齐 |

> 素材库 ACL 的 `subject_type='department'`、`subject_id` 直接引用 `t_department.dept_id`；`getOrgAncestorIds()` 沿 `parent_id` 向上追溯实现“含子部门”。

### 1.2 users → t_employee（替换，多角色 RBAC + organization_id）

| 素材库字段 | develop 对应字段 | 匹配 | 处理方式 |
|-----------|-----------------|------|---------|
| `id` | `employee_id` (bigint) | ✅ | 类型从 VARCHAR→bigint |
| `name` | `actual_name` | ✅ | 字段改名映射 |
| `username` | `login_name` | ✅ | 一一对应 |
| `password_hash` | `login_pwd` | ✅ | 密码已有 SM4 加密 |
| `email` | `email` | ✅ | 一一对应 |
| `avatar_url` | `avatar` | ✅ | 一一对应 |
| `organization_id` | `dept_id` → FK t_department | ✅ | **对应 `DATABASE_SCHEMA.md` 的 `organization_id`（统一存组织 ID），不再是早期 `department` 字符串** |
| `primary_role_id` | `t_role_user` 主角色 | ✅ | 多角色中 `roleIds[0]` 冗余字段 |
| `roleIds`（多角色） | `t_role_user` + `t_role` | ✅ | **多角色 RBAC**：一个员工可挂多个角色，关联表 `user_roles`→`t_role_user` |
| `language` | — | ❌ 缺失 | **需在 t_employee 新增** |
| `status` | `disabled_flag` | ✅ | disabled_flag=1 即 disabled |
| `created_at`/`created_by` | `create_time`/`created_by` | ✅ | 审计字段对齐 |
| `updated_at`/`updated_by` | `update_time`/`updated_by` | ✅ | 审计字段对齐 |

**t_employee 需扩展的字段**:
```sql
ALTER TABLE t_employee ADD COLUMN language VARCHAR(10) DEFAULT 'zh-CN' COMMENT '语言偏好';
ALTER TABLE t_employee ADD COLUMN created_by BIGINT COMMENT '创建人 FK→t_employee';
ALTER TABLE t_employee ADD COLUMN updated_by BIGINT COMMENT '最后修改人 FK→t_employee';
```

**素材库角色 → SmartAdmin RBAC 映射方案**（写入 `t_role`，通过 `t_role_user` 关联员工）：
- `super_admin` → 新建 `素材库管理员` 角色（含素材库全部菜单+按钮权限）
- `material-operator` → 新建 `素材库编辑者` 角色（可上传/编辑/删除自己的素材）
- `tag-viewer` → 新建 `素材库查看者` 角色（仅查看/下载/评论）

### 1.3 roles / user_roles → t_role / t_role_user（替换/复用）

- `roles` 表对应 `t_role`：素材库新增上述 3 个角色记录；`roles.permissions` JSON 快照在建表时归一化为 `role_menu_permissions`（`t_role_menu`）。
- `user_roles` 对应 `t_role_user`（员工-角色关联表），证明“一个用户多个角色”。
- 两表均含 `created_by`/`updated_by` 审计字段（见 `DATABASE_SCHEMA.md` 1.3 / 1.4）。

### 1.4 menus + 权限矩阵 → t_menu / t_role_menu / t_role_org_menu / t_role_user_menu

| 素材库表 | develop 对应 | 说明 |
|---------|-------------|------|
| `menus` | `t_menu` | 复用菜单表，新增素材库菜单树节点（`page` 作为权限目标键） |
| `role_menu_permissions` | `t_role_menu` | 复用角色-菜单权限（visible/editable） |
| `org_menu_permissions` | `t_role_org_menu` 🆕 | SmartAdmin 无组织级叠加权限，新增表：`org_id`/`menu_id`/`visible`/`editable`/`created_by` |
| `user_menu_permissions` | `t_role_user_menu` 🆕 | 用户级最高优先级覆盖：`user_id`/`menu_id`/`visible`/`editable`/`created_by` |

> 解析顺序见 `getMenuPermission()`：超管全开；否则取 `角色权限 ∪ 组织权限 ∪ 用户权限` 的并集。

### 1.5 user_sessions → t_login_log + Sa-Token（替换，不复建）

develop 已有完整的 session 管理：`t_login_log` 记录每次登录（user_id, login_ip, login_result, user_agent），Sa-Token 管理 token 生命周期、踢人下线、多点登录控制。素材库的 `user_sessions` 表可以直接删除，token 验证逻辑全部接入 Sa-Token。纯追加，`t_login_log` 本身无需 `updated_by`。

### 1.6 operation_logs → t_operate_log（扩展，纯追加）

| 素材库字段 | develop 对应字段 | 处理方式 |
|-----------|-----------------|---------|
| `id` | `operate_log_id` | ✅ 一一对应 |
| `asset_id` | — | ❌ **需新增** |
| `user_id`（=创建人） | `operate_user_id` | ✅ |
| `action` | `module` + `content` | ⚠️ 用 module='素材库' 区分 |
| `message` | `content` | ✅ |
| `metadata` | `param` (JSON text) | ⚠️ param 存请求参数，语义不同 |

**t_operate_log 需扩展的字段**:
```sql
ALTER TABLE t_operate_log ADD COLUMN asset_id BIGINT COMMENT '关联素材ID';
ALTER TABLE t_operate_log ADD COLUMN action_type VARCHAR(50) COMMENT '操作类型: upload/download/share/edit/delete/restore/approve/view/comment/tag_merge/permission_change';
ALTER TABLE t_operate_log ADD COLUMN metadata JSON COMMENT '附加信息(old/new values)';
```
素材库操作日志记录在 module='素材库' 时写入，保留原有字段兼容其他模块日志。纯追加，`t_operate_log` 不需 `updated_by`。

### 1.7 system_notices → t_notice + t_notice_type（替换）

develop 的公告体系更完善（`title` / `content_text`+`content_html` / `create_user_id`（=创建人）/ `deleted_flag`+`publish_time` 等均已覆盖；另含 `t_notice_visible_range` 可见范围、`t_notice_view_record` 查看记录、`scheduled_publish_flag` 定时发布、`document_number` 公文文号）。素材库 `system_notices` 缺 `expires_at`，需在 `t_notice` 新增：
```sql
ALTER TABLE t_notice ADD COLUMN expires_at DATETIME COMMENT '过期时间';
ALTER TABLE t_notice ADD COLUMN updated_by BIGINT COMMENT '最后修改人 FK→t_employee';
```

### 1.8 notifications → t_message（扩展）

| 素材库字段 | develop 对应 | 处理方式 |
|-----------|-------------|---------|
| `id` | `message_id` | ✅ |
| `user_id`（接收人） | `receiver_user_id` | ✅ |
| `created_by`（触发人/系统，=创建人） | `create_user_id` | ✅ |
| `type` | `message_type` (smallint) | ⚠️ 从字符串→数字枚举 |
| `title` | `title` | ✅ |
| `content` | `content` | ✅ |
| `related_asset_id` | `data_id` | ⚠️ data_id 是通用字段 |
| `is_read` | `read_flag` | ✅ |
| `created_at` | `create_time` | ✅ |
| `updated_at`/`updated_by` | `update_time`/`updated_by` | ✅（标记已读时更新） |

**处理方案**: 为素材库分配新的 `message_type` 枚举值段（如 10-19），在 Java 后端定义 `AssetMessageTypeEnum`。素材库通知直接写入 `t_message`，通过 `receiver_user_type=1` (后管用户) 区分。

素材库通知类型 → message_type 编号映射:
- `upload_complete` → 10
- `share_created` → 11
- `approval_required` → 12
- `tag_recognition_done` → 13
- `permission_request` → 14
- `validity_expiring` → 15

### 1.9 permission_requests → warm-flow 工作流（替换，删除独立 `approvals` 表）

develop 已有完整的 warm-flow 工作流引擎，素材库的审批场景可建模为工作流定义：
- **场景一：素材权限申请审批** `asset_permission_approval`：发起申请 → 部门主管审批 → (通过)自动授权 / (拒绝)通知申请人
- **场景二：素材入库审批** `asset_entry_approval`：上传提交 → 素材审核员审批 → (通过)入库 / (拒绝)退回修改

> 早期融合草稿里曾单列 `approvals` 表，现**删除**：`permission_requests` 与审批流程统一由 warm-flow 流程实例承载。

映射关系：`type`→`flow_definition.flow_code`；`applicant_id`（=创建人）→`flow_instance.create_by`；`reviewer_id`→`flow_task` 审批人；`status`→`flow_instance.flow_status`；`reviewed_at`→`flow_his_task.update_time`；`reason`→`flow_instance.variable` JSON。

### 1.10 upload_settings / validity_reminders / filter_presets → t_config / t_table_column / t_smart_job（合并）

| 素材库配置表 | 处理方式 |
|------------|---------|
| `upload_settings` | 写入 `t_config`，key=`asset_upload_auto_thumbnail` 等（含 `created_by`/`updated_by`） |
| `validity_reminders` | 写入 `t_config` 存全局默认值 + `t_smart_job` 定时扫描即将过期素材 |
| `filter_presets` | 复用 `t_table_column`，table_name='asset_list' |

`validity_reminders` 的定时提醒逻辑：在 `t_smart_job` 注册 `AssetValidityCheckJob`（每日 9:00），扫描 `assets.valid_until` < NOW()+N 天的素材，写入 `t_message` 通知素材所有者。

---

## 二、🆕 必须新增 — 素材库专有表（含 DDL）

> 以下 DDL 字段定义与 `DATABASE_SCHEMA.md` 第 1~6 节逐一对应；命名改为 SmartAdmin 规范（bigint 主键、`deleted_flag` 逻辑删除、`create_time`/`update_time` + `created_by`/`updated_by`）。如字段语义有疑问，以 `DATABASE_SCHEMA.md` 为准。所有非纯追加表均含 `created_by`/`updated_by` 审计字段。

### 2.1 t_asset（素材主表）

```sql
CREATE TABLE t_asset (
  asset_id        BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '素材ID',
  name            VARCHAR(512) NOT NULL COMMENT '素材名称',
  file_path       VARCHAR(2048) NOT NULL COMMENT '文件存储路径',
  thumbnail_path  VARCHAR(2048) COMMENT '缩略图路径',
  original_name   VARCHAR(512) COMMENT '原始文件名',
  format          VARCHAR(20) COMMENT '文件格式',
  mime_type       VARCHAR(128) COMMENT 'MIME类型',
  media_type      VARCHAR(20) COMMENT '大类: 图片/视频/文件',
  file_size       BIGINT UNSIGNED COMMENT '文件大小(字节)',
  width           INT COMMENT '像素宽度',
  height          INT COMMENT '像素高度',
  aspect_ratio    DECIMAL(5,3) COMMENT '宽高比',
  duration        INT COMMENT '视频时长(秒)',
  brand           VARCHAR(64) COMMENT '品牌(存值列表 code)',
  series          VARCHAR(64) COMMENT '车系(存 code)',
  model           VARCHAR(64) COMMENT '车型(存 code)',
  interior_colors JSON COMMENT '内饰色数组',
  exterior_colors JSON COMMENT '外饰色数组',
  dominant_color  VARCHAR(32) COMMENT '主色调',
  description     TEXT COMMENT '描述',
  permission      VARCHAR(64) COMMENT '权限范围(存 code, 如 downloadable)',
  asset_status    VARCHAR(20) NOT NULL DEFAULT 'active' COMMENT '资产主状态: active/pending/deleted/disabled',
  audit_status    VARCHAR(20) COMMENT '审核链路: pending_submit/pending_audit/machine_*/human_*',
  group_id        BIGINT COMMENT '所属素材组 FK→t_asset_group',
  owner_id        BIGINT COMMENT '所有者(=创建人) FK→t_employee',
  organization_id BIGINT COMMENT '所属组织 FK→t_department (替代早期 department)',
  valid_from      DATETIME COMMENT '生效时间',
  valid_until     DATETIME COMMENT '失效时间',
  version         VARCHAR(64) COMMENT '版本号',
  share_count     INT DEFAULT 0 COMMENT '分享次数',
  download_count  INT DEFAULT 0 COMMENT '下载次数',
  view_count      INT DEFAULT 0 COMMENT '浏览次数',
  created_by      BIGINT COMMENT '创建者 FK→t_employee',
  updated_by      BIGINT COMMENT '最后修改人 FK→t_employee',
  deleted_flag    TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
  create_time     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  update_time     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_asset_asset_status(asset_status),
  INDEX idx_asset_audit_status(audit_status),
  INDEX idx_asset_group(group_id),
  INDEX idx_asset_owner(owner_id),
  INDEX idx_asset_org(organization_id),
  INDEX idx_asset_brand_model(brand, model),
  INDEX idx_asset_valid_until(valid_until),
  FULLTEXT INDEX ft_asset_name_desc(name, description)
) COMMENT='素材表';
```

### 2.2 t_asset_tag（素材标签表）

```sql
CREATE TABLE t_asset_tag (
  tag_id          BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '标签ID',
  tag_name        VARCHAR(128) NOT NULL COMMENT '标签名称',
  parent_id       BIGINT DEFAULT 0 COMMENT '父级标签ID FK→self',
  tag_type        ENUM('custom','ai','system') NOT NULL COMMENT '标签类型',
  description     VARCHAR(512) COMMENT '描述',
  sort_order      INT DEFAULT 0 COMMENT '排序',
  created_by      BIGINT COMMENT '创建人 FK→t_employee',
  updated_by      BIGINT COMMENT '最后修改人 FK→t_employee',
  deleted_flag    TINYINT NOT NULL DEFAULT 0,
  create_time     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  update_time     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE INDEX uk_tag_name_type(tag_name, tag_type)
) COMMENT='素材标签表';
```

### 2.3 t_asset_tag_rel（素材-标签关联表）

```sql
CREATE TABLE t_asset_tag_rel (
  rel_id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  asset_id        BIGINT NOT NULL COMMENT 'FK→t_asset',
  tag_id          BIGINT NOT NULL COMMENT 'FK→t_asset_tag',
  tag_type        ENUM('custom','ai','system') NOT NULL COMMENT '标签来源',
  created_by      BIGINT COMMENT '打标人(=创建人) FK→t_employee',
  updated_by      BIGINT COMMENT '最后修改人 FK→t_employee',
  create_time     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  update_time     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE INDEX uk_asset_tag(asset_id, tag_id, tag_type)
) COMMENT='素材-标签关联表';
```

### 2.4 t_asset_group（素材组表）

```sql
CREATE TABLE t_asset_group (
  group_id        BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '素材组ID',
  group_name      VARCHAR(256) NOT NULL COMMENT '名称',
  parent_id       BIGINT DEFAULT 0 COMMENT '父级ID FK→self',
  depth           INT DEFAULT 0 COMMENT '层级深度',
  description     TEXT COMMENT '说明',
  is_system       TINYINT DEFAULT 0 COMMENT '系统内置',
  status          VARCHAR(20) DEFAULT 'active',
  asset_count     INT DEFAULT 0 COMMENT '素材数量缓存',
  owner_id        BIGINT COMMENT '创建者(=创建人) FK→t_employee',
  updated_by      BIGINT COMMENT '最后修改人 FK→t_employee',
  deleted_flag    TINYINT NOT NULL DEFAULT 0,
  create_time     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  update_time     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) COMMENT='素材组表';
```

### 2.5 t_asset_group_user（用户-素材组关联）

```sql
CREATE TABLE t_asset_group_user (
  id              BIGINT AUTO_INCREMENT PRIMARY KEY,
  group_id        BIGINT NOT NULL COMMENT 'FK→t_asset_group',
  employee_id     BIGINT NOT NULL COMMENT 'FK→t_employee(=创建人)',
  is_favorite     TINYINT DEFAULT 0 COMMENT '收藏',
  is_subscribed   TINYINT DEFAULT 0 COMMENT '订阅',
  created_by      BIGINT COMMENT '操作人(=创建人) FK→t_employee',
  updated_by      BIGINT COMMENT '最后修改人 FK→t_employee',
  create_time     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  update_time     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE INDEX uk_group_user(group_id, employee_id)
) COMMENT='用户-素材组收藏/订阅表';
```

### 2.6 t_asset_share（分享记录表）

```sql
CREATE TABLE t_asset_share (
  share_id        BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '分享ID',
  share_name      VARCHAR(256) COMMENT '分享名称',
  creator_id      BIGINT NOT NULL COMMENT '分享人(=创建人) FK→t_employee',
  target_type     ENUM('group','asset','basket') NOT NULL,
  target_id       TEXT COMMENT '目标ID(basket时多ID逗号分隔)',
  access_scope    VARCHAR(20) COMMENT 'internal(仅公司内部)/public(公开互联网)',
  content_permission VARCHAR(20) COMMENT 'view(仅预览)/download(可下载)',
  require_password TINYINT DEFAULT 0 COMMENT '是否密码保护',
  password        VARCHAR(64) COMMENT '访问密码',
  share_code      VARCHAR(16) COMMENT '分享码',
  share_link      VARCHAR(2048) COMMENT '分享链接',
  expires_at      DATETIME COMMENT '过期时间',
  max_visits      INT COMMENT '最大访问次数',
  visit_count     INT DEFAULT 0,
  view_count      INT DEFAULT 0,
  download_count  INT DEFAULT 0,
  status          VARCHAR(20) DEFAULT 'active',
  owned_by        VARCHAR(64) COMMENT '责任人(前端存 username/name)',
  owned_by_org_id BIGINT COMMENT '责任部门(=DATABASE_SCHEMA owned_by_org_id, 统一存组织 ID) FK→t_department',
  shared_at       DATETIME,
  updated_by      BIGINT COMMENT '最后修改人(撤销/改密码) FK→t_employee',
  deleted_flag    TINYINT NOT NULL DEFAULT 0,
  create_time     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  update_time     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_share_creator(creator_id),
  INDEX idx_share_code(share_code),
  INDEX idx_share_expires(expires_at)
) COMMENT='素材分享记录表';
```

### 2.7 t_asset_collect_task（收集任务表）

```sql
CREATE TABLE t_asset_collect_task (
  task_id         BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '任务ID',
  theme           VARCHAR(256) NOT NULL COMMENT '任务主题',
  description     TEXT COMMENT '收集说明',
  group_name      VARCHAR(256) COMMENT '存放素材组名称',
  group_id        BIGINT COMMENT 'FK→t_asset_group',
  status          VARCHAR(20) DEFAULT 'active',
  audit_status    VARCHAR(20) COMMENT 'pending_submit/pending_audit/human_pass',
  access_code     VARCHAR(8) COMMENT '访问密码',
  allowed_file_types JSON COMMENT '允许上传类型',
  deadline        DATE COMMENT '截止日期',
  creator_id      BIGINT COMMENT '创建人(=创建人) FK→t_employee',
  owned_by        VARCHAR(64) COMMENT '责任人',
  owned_by_org_id BIGINT COMMENT '责任部门 FK→t_department',
  expires_at      DATETIME,
  updated_by      BIGINT COMMENT '最后修改人 FK→t_employee',
  deleted_flag    TINYINT NOT NULL DEFAULT 0,
  create_time     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  update_time     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_collect_creator(creator_id),
  INDEX idx_collect_group(group_id)
) COMMENT='素材收集任务表';
```

### 2.8 t_asset_group_acl（素材组数据级访问控制，替代原 group_members 思路）

```sql
CREATE TABLE t_asset_group_acl (
  acl_id          BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'ACL ID',
  group_id        BIGINT NOT NULL COMMENT '目标素材组 FK→t_asset_group',
  subject_type    VARCHAR(20) COMMENT 'user/company/department',
  subject_id      BIGINT COMMENT 'user.employee_id / 0(company 全部) / department.dept_id',
  subject_name    VARCHAR(128) COMMENT '主体显示名',
  permission      VARCHAR(20) COMMENT '权限等级(group_permission_level: view/download/contribute/manage)',
  include_sub_dept TINYINT DEFAULT 0 COMMENT '部门主体是否含子组织',
  expires_at      DATETIME COMMENT '过期时间(NULL 不限)',
  granted_by      BIGINT COMMENT '授权人(=创建人) FK→t_employee',
  updated_by      BIGINT COMMENT '最后修改人(撤销/改等级) FK→t_employee',
  granted_at      DATETIME COMMENT '授权时间',
  create_time     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  update_time     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_group_acl_group(group_id),
  INDEX idx_group_acl_subject(subject_type, subject_id)
) COMMENT='素材组访问控制表';
```

### 2.9 t_asset_acl（素材数据级访问控制）

```sql
CREATE TABLE t_asset_acl (
  acl_id          BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'ACL ID',
  asset_id        BIGINT NOT NULL COMMENT '目标素材 FK→t_asset',
  subject_type    VARCHAR(20) COMMENT 'user/company/department',
  subject_id      BIGINT COMMENT '同 t_asset_group_acl',
  subject_name    VARCHAR(128) COMMENT '主体显示名',
  permission      VARCHAR(20) COMMENT '权限等级(asset_permission_level: view/edit/download/full)',
  include_sub_dept TINYINT DEFAULT 0 COMMENT '部门主体是否含子组织',
  expires_at      DATETIME COMMENT '过期时间',
  granted_by      BIGINT COMMENT '授权人(=创建人) FK→t_employee',
  updated_by      BIGINT COMMENT '最后修改人 FK→t_employee',
  granted_at      DATETIME COMMENT '授权时间',
  create_time     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  update_time     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_asset_acl_asset(asset_id),
  INDEX idx_asset_acl_subject(subject_type, subject_id)
) COMMENT='素材访问控制表';
```

### 2.10 t_asset_comment（素材评论）

```sql
CREATE TABLE t_asset_comment (
  comment_id      BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '评论ID',
  asset_id        BIGINT NOT NULL COMMENT 'FK→t_asset',
  employee_id     BIGINT NOT NULL COMMENT '评论人(=创建人) FK→t_employee',
  content         TEXT NOT NULL COMMENT '评论内容',
  parent_id       BIGINT DEFAULT NULL COMMENT '回复的评论ID FK→self',
  updated_by      BIGINT COMMENT '最后修改人(评论被编辑) FK→t_employee',
  deleted_flag    TINYINT NOT NULL DEFAULT 0,
  create_time     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  update_time     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_comment_asset(asset_id)
) COMMENT='素材评论表';
```

### 2.11 t_role_org_menu（组织级菜单权限，🆕）

```sql
CREATE TABLE t_role_org_menu (
  id              BIGINT AUTO_INCREMENT PRIMARY KEY,
  org_id          BIGINT NOT NULL COMMENT '组织 FK→t_department',
  menu_id         BIGINT NOT NULL COMMENT '菜单 FK→t_menu(page 为权限键)',
  visible         TINYINT DEFAULT 0 COMMENT '是否可见',
  editable        TINYINT DEFAULT 0 COMMENT '是否可编辑',
  created_by      BIGINT COMMENT '授权人(=创建人) FK→t_employee',
  create_time     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE INDEX uk_org_menu(org_id, menu_id)
) COMMENT='组织级菜单权限表(素材库 RBAC 组织叠加)';
```

### 2.12 t_role_user_menu（用户级菜单权限，🆕）

```sql
CREATE TABLE t_role_user_menu (
  id              BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id         BIGINT NOT NULL COMMENT '用户 FK→t_employee',
  menu_id         BIGINT NOT NULL COMMENT '菜单 FK→t_menu(page 为权限键)',
  visible         TINYINT DEFAULT 0 COMMENT '是否可见',
  editable        TINYINT DEFAULT 0 COMMENT '是否可编辑',
  created_by      BIGINT COMMENT '授权人(=创建人) FK→t_employee',
  create_time     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE INDEX uk_user_menu(user_id, menu_id)
) COMMENT='用户级菜单权限表(素材库 RBAC 最高优先级覆盖)';
```

> 说明：`permission_requests` 不单独建表，统一由 warm-flow 流程实例承载（见 1.9）。

---

## 三、🧩 AI 图像任务表 — 与素材库的关系

develop 已有的 AI 图像业务表 (`img_task_info`, `img_task_result`) 产出物料与素材库天然关联：

| AI 表 | 与素材库的关系 | 建议 |
|-------|-------------|------|
| `img_task_info` | AI 生成任务 → 产生图像文件 | **新增 `target_group_id` 字段**，关联 `t_asset_group`，生成完成后自动入库 |
| `img_task_result` | 任务结果文件 | **新增 `asset_id` 字段**，生成文件入库后关联素材ID |

这样 AI 生成的图片可以直接“一键入库”到素材库的指定素材组中，打通两个系统的数据流。

---

## 四、素材库项目的调整清单

### 4.1 前端（素材库纯前端项目 → 接入 DPCA-AI 后端）

| 调整项 | 说明 |
|-------|------|
| **登录体系** | 删除 localStorage 的用户模拟，接入 SmartAdmin 登录页 + Sa-Token |
| **用户信息** | 从 `currentUser` 改为通过 API 获取当前登录员工信息（含 `roleIds` 多角色、`organizationId`） |
| **API 层** | 新建 `api/asset/` 目录，封装素材库所有接口调用 |
| **ID 类型** | 全部 ID 从字符串 `"asset-xxx"` 改为 bigint 数字 |
| **角色权限** | 页面级权限接入 SmartAdmin 菜单体系（menus/role_menu_permissions/org_menu_permissions/user_menu_permissions）；操作级权限接入按钮级 `web_perms` |
| **通知消息** | 页面右上角通知改用 `t_message` API 获取 |
| **系统公告** | 公告看板接入 `t_notice` API |
| **审批流程** | 权限申请改为提交 warm-flow 流程实例 + 审批操作 API（不再用 `approvals` 表） |
| **操作日志** | 前端不再本地存日志数组，每次操作通过 API 记录到 `t_operate_log` |
| **数据持久化** | 删除所有 `localStorage` 降级逻辑，全部走后端 API |
| **文件上传** | 接入 develop 已有的 `t_file` 上传接口，上传后关联 `t_asset` |
| **枚举规范化** | 新建/运行时写入统一存 code 或组织 ID（解决 `permission`/`brand`/`department` 存展示串/ID 混用；`department`→`organization_id`、`owned_by_dept`→`owned_by_org_id`） |
| **审计字段** | 所有写操作后端自动填充 `created_by`/`updated_by`（或复用 `owner_id`/`creator_id` 等主体字段） |

### 4.2 后端（DPCA-AI Server 需要新增的模块）

| 新增模块 | 内容 |
|---------|------|
| **smart-biz 新增包** | `module/business/asset/` — 素材库业务模块 |
| Controller | `AssetController`, `AssetGroupController`, `AssetTagController`, `AssetShareController`, `AssetCollectController`, `AssetCommentController`, `AssetAclController` |
| Service | 每个 Controller 对应 Service + ServiceImpl |
| DAO/Mapper | MyBatis Plus Mapper 接口（12 张素材库新增表 CRUD：见总览矩阵 🆕） |
| Entity | 12 个新增实体类（见第二节） |
| **工作流定义** | warm-flow 新增 `asset_permission_approval`、`asset_entry_approval` 流程定义 |
| **定时任务** | `AssetValidityCheckJob` 素材有效期检查 |
| **消息类型** | `t_message` 新增 message_type 枚举值 10-15 |
| **操作日志** | `t_operate_log` 扩展 `module='素材库'` 的日志记录 AOP |
| **菜单权限** | `t_menu` 新增素材库菜单树 + 按钮权限点；`t_role_menu`/`t_role_org_menu`/`t_role_user_menu` 配置 |
| **角色** | `t_role` 新增 3 个素材库角色；`t_role_user` 关联员工 |
| **字典** | `t_dict_key/value` 新增素材库枚举字典（品牌、车型、色调、权限级别等） |
| **数据库 DDL** | 新增 `03-init-asset-tables.sql` 建表脚本（含审计字段） |

### 4.3 素材库前端代码改造范围

| 文件 | 改造内容 |
|------|---------|
| `app.js` | `bootstrap()` 改为从 API 拉取初始数据，而非 localStorage |
| `app-core.js` | 删除 `saveState()` / `loadState()`，改 `state` 为响应式 API 数据 |
| `app-infra.js` | `httpGet/httpPost/httpDelete` 改为调用 develop 项目的 `lib/request.js` (带 token) |
| `app-render.js` | 数据源从 `window.assets` 改为 API 分页数据 |
| `app-actions.js` | 所有操作改为异步 API 调用 + loading 态 |
| `app-workflows.js` | 分享/收集改为 API |
| `index.html` | 删除内联数据模拟，增加登录守卫 |

---

## 五、融合后 ER 关系总图

```
                    ┌─────────────────┐
                    │   t_department  │  (organizations)
                    │   (SmartAdmin)  │
                    └────────┬────────┘
                             │
        ┌────────────┬───────┼───────────────┬──────────────┐
        │            │       │               │              │
 ┌──────▼──────┐ ┌───▼───────▼───┐  ┌─────────▼────────┐ ┌────▼──────────┐
 │  t_employee │ │   t_role      │  │   t_menu         │ │ t_role_user   │
 │  (users)    │ │   (roles)     │  │   (menus)        │ │ (user_roles)  │
 └──┬──┬──┬────┘ └───┬────────────┘  └──┬──────┬────────┘ └───────────────┘
    │  │  │          │                  │      │
    │  │  │   ┌──────▼──────┐   ┌───────▼──┐ ┌─▼──────────────┐
    │  │  │   │ t_role_menu │   │t_role_org│ │t_role_user_menu│
    │  │  │   │(role_menu_  │   │_menu     │ │(user_menu_     │
    │  │  │   │ permissions)│   │(org_menu_│ │ permissions)   │
    │  │  │   └─────────────┘   │permissions│ └────────────────┘
    │  │  │                     └──────────┘
    │  │  │
    │  │  └──────────────┐
    │  │                 │
 ┌──▼─▼────────┐  ┌──────▼────────┐  ┌──────────────────┐
 │  t_asset    │  │ t_asset_group │  │  t_asset_share   │
 │  (NEW)      │  │ (NEW)         │  │  (NEW)           │
 └──┬───┬──┬───┘  └──┬──────┬─────┘  └──────────────────┘
    │   │  │          │      │
    │   │  │  ┌───────┘      └──────────┐
    │   │  │  │                         │
    │   │  │  ▼                         ▼
    │   │  │  ┌──────────────────┐  ┌──────────────────────┐
    │   │  │  │t_asset_group_user│  │t_asset_group_acl      │
    │   │  │  │(NEW)             │  │(NEW, 替代group_members)│
    │   │  │  └──────────────────┘  └──────────────────────┘
    │   │  │                              │
    │   │  │  ┌──────────────────┐        │
    │   │  │  │ t_asset_acl      │◄───────┘
    │   │  │  │ (NEW)            │
    │   │  │  └──────────────────┘
    │   │  └──────────────┐
    │   │                 │
    │   │  ┌──────────────▼──────┐  ┌──────────────────┐
    │   │  │  t_asset_tag_rel    │  │   t_asset_tag    │
    │   │  │  (NEW)              │──│   (NEW)          │
    │   │  └─────────────────────┘  └──────────────────┘
    │   │
    │   └───────────────────┐
    │                       │
    │   ┌───────────────────▼──────┐  ┌──────────────────┐
    │   │  t_asset_comment         │  │ t_asset_collect  │
    │   │  (NEW)                   │  │ _task (NEW)      │
    │   └──────────────────────────┘  └──────────────────┘
    │
    ├────────────────────────────────────────────────────┐
    │                                                    │
    ▼                                                    ▼
┌──────────────┐  ┌──────────────────┐  ┌──────────────────────┐
│ t_operate_log│  │   t_message      │  │   warm-flow          │
│ (EXTENDED)   │  │   (EXTENDED)     │  │   (EXISTING)         │
│ +asset_id    │  │ +message_type    │  │ +asset_permission    │
│ +action_type │  │   10-15          │  │ _approval flow      │
│ +metadata    │  │ +created_by      │  │ +asset_entry_approval│
└──────────────┘  └──────────────────┘  └──────────────────────┘
```

---

## 六、实施建议分阶段

### Phase 1 — 数据库层（DDL）
1. 执行 12 张素材库新增表的建表 DDL（见第二节）
2. 执行 `t_employee`、`t_operate_log`、`t_notice`、`t_message` 的 ALTER 扩展（含审计字段）
3. 新增字典数据（品牌/车型/色调/权限级别）
4. 新增菜单元数据（素材库左侧导航 + 各个操作按钮权限点，含 `t_role_menu`/`t_role_org_menu`/`t_role_user_menu`）
5. 新增 3 个角色 + `t_role_user` 权限分配

### Phase 2 — 后端 API
1. `smart-biz` 新增素材库 CRUD 模块（12 张新增表）
2. 操作日志 AOP 切面扩展（module='素材库'）
3. warm-flow 流程定义部署（`permission_requests` 承载，无独立 `approvals`）
4. 定时任务注册（`AssetValidityCheckJob`）
5. 所有写接口统一填充 `created_by`/`updated_by`

### Phase 3 — 前端改造
1. 接入 SmartAdmin 登录体系（多角色 `roleIds`）
2. API 层替换 localStorage
3. 审批/通知/日志接入后端

### Phase 4 — AI 集成
1. `img_task_result` 扩展 asset_id 字段
2. AI 生成结果一键入库功能
3. AI 自动打标（素材上传后调用标签识别服务）

---

> 配套文档：`DATABASE_SCHEMA.md`（素材库目标态表结构，**26 张表**，含 RBAC 多角色/组织树/数据级 ACL/审计字段、ER/前端对照）；`CODE_MEMORY.md`（前端代码结构、状态机与已知问题）；`PROJECT_BASELINE.md`（前端框架与定位说明）。
