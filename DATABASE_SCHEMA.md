# DPCA 素材库平台 — 数据库表结构设计（目标态）

> 最后核对日期：2026-07-15
> 定位：本文是素材库**自身**的关系型表结构设计，作为后端落地的“数据模型基准”。当前前端（just_html 分支）用 `localStorage` 模拟，并未实现这些表；本文描述**未来**接入关系库时的目标结构。
> 与融合分析的关系：本文给出“素材库需要哪些表、字段长什么样”；`MERGE_ANALYSIS.md` 在此基础上给出“这些表如何并入 DPCA-AI 创意平台（develop）现有库”的策略与 DDL。两者互补，不是同一份文档。
> 实现状态图例：✅ 已实现 = 前端 `localStorage` 已建模该实体（`db.xxx` 存在、逻辑跑通）；📋 规划 = 目标态，前端暂未落地数据实体（仅 UI 占位或后续需求）。带 ✅ 的实体若当前以数组/JSON 形态存储，建表时按“归一化为关联表”落地。
> **审计要求**：所有表均含“创建时间 + 创建人 + 最后修改时间 + 最后修改人 + 删除时间 + 删除人”六元审计记录，详见第 0 节规范。

---

## 目录
0. [通用设计规范（所有表）](#0-通用设计规范所有表)
1. [组织与身份（RBAC）](#1-组织与身份rbac)
2. [核心业务表](#2-核心业务表)
3. [数据级访问控制（ABAC）](#3-数据级访问控制abac)
4. [协作与工作流表](#4-协作与工作流表)
5. [消息与通知表](#5-消息与通知表)
6. [系统配置表](#6-系统配置表)
7. [ER 关系图](#7-er-关系图)
8. [附录：字段对照与值列表（系统字典）](#8-附录字段对照与值列表系统字典)

---

## 0. 通用设计规范（所有表）

> 本节是所有 27 张表的统一约定。任何单表定义若未特别说明，均默认遵守本节。

**0.1 字符集与存储引擎（企业级落地必备）**
- 所有表统一：`ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`。
- `utf8mb4` 支持完整 emoji 与 4 字节字符（如素材名、评论内容中的特殊字符）；`InnoDB` 支持事务与外键。

**0.2 时间类型与时区**
- 全部时间列统一使用 **`DATETIME`**（非 `TIMESTAMP`）。`DATETIME` 不自动时区转换，语义稳定、范围更大。
- **时区策略**：所有时间按**应用服务器时区（中国标准时间 GMT+8）** 存储与比较，展示层如需再转换。禁止混用 `TIMESTAMP`（会自动转 UTC，导致与 `DATETIME` 语义不一致）。

**0.3 主键策略**
- 25 张业务表主键为 `VARCHAR(64)`（雪花 ID / UUID / 业务 code），保证跨系统、跨表可移植、可读。
- 仅 `operation_logs` 用 `BIGINT AUTO_INCREMENT` 自增主键（高频追加日志，自增性能更优）。

**0.4 外键删除动作（ON DELETE）**
- 审计列（`created_by` / `updated_by` / `deleted_by`）→ `FK→users ON DELETE SET NULL`：人员被删时保留记录，仅置空操作人。
- 业务外键默认 `ON DELETE RESTRICT`：禁止产生孤儿数据（如 `organization_id`、`owner_id`、`group_id`、`asset_id` 等）。
- 逻辑从属的子表用 `ON DELETE CASCADE`：父记录删除时级联清除（如 `asset_tags`、`user_roles`、`*_menu_permissions`、`asset_acl`、`group_acl`、`user_group_relations`、`comments`、`validity_reminders`）。
- 不可变审计日志（`operation_logs.asset_id`、`notifications.related_asset_id`）→ `ON DELETE SET NULL`：素材删了，日志仍保留。

**0.5 审计字段规范（创建 / 修改 / 删除 三态完整追溯）**
> 任何数据的“谁在何时创建 / 谁最后修改 / 谁何时删除”都必须可追溯。完整六元：
> 1. **`created_at` DATETIME NOT NULL** — 创建时间。**所有表必含**。
> 2. **创建人**：若表已有业务主体字段（`user_id` / `creator_id` / `owner_id` / `publisher_id` / `granted_by` / `applicant_id`），该字段即充当 `created_by`（正文中以“（=创建人）”标注）；否则统一补 **`created_by` VARCHAR(64) FK→users ON DELETE SET NULL**。
> 3. **`updated_at` DATETIME** — 最后修改时间。**所有“可被修改”的表必含**（与 `updated_by` 成对，缺一不可）。
> 4. **`updated_by` VARCHAR(64) FK→users ON DELETE SET NULL** — 最后修改人。仅出现在可被修改的表。
> 5. **`deleted_at` DATETIME** — 软删除时间。**所有表必含**（NULL = 未删除；非 NULL = 已软删）。这是全库统一的“删除标记”，替代此前分散在 `status` 枚举里的 `deleted`/`disabled` 删除语义。
> 6. **`deleted_by` VARCHAR(64) FK→users ON DELETE SET NULL** — 删除人（触发软删者；系统级删除记为系统账号）。**所有表必含**，与 `deleted_at` 成对。
>
> 软删除统一规则：表若另有 `status` 枚举（如 `active`/`revoked`/`expired`/`completed`），`status` 仅表达**业务生命周期**（如分享“撤销/过期”、任务“完成”），**不再承担删除语义**；逻辑删除一律置 `deleted_at = NOW()`、`deleted_by = 操作人`。历史数据中用 `status='deleted'/'disabled'` 表达删除的，迁移为目标态的 `deleted_at`。
>
> 例如：`assets.created_by`（创建者）+ `assets.updated_by`（最后修改人）+ `assets.deleted_at`/`deleted_by`（软删记录）；`operation_logs.user_id` 本身是操作人即创建人，故不再单列 `created_by`，但仍有 `updated_by`/`deleted_at`/`deleted_by` 占位（日志实际不修改/不删，列恒为空）。

**0.6 值列表即系统字典（唯一枚举源）**
- 本库**不存在独立的“系统字典”表与“值列表”表之分**：二者统一为一张 **`value_list` 表**（对应前端 `db.valueListTree`，详见 1.0 节）。
- 所有 `status` / `permission` / `type` / `scope` / `subject_type` / `action` 等枚举列，其取值均来自 `value_list` 的 `code`（如 `asset_status`、`group_permission_level`、`share_access_scope`）。业务代码只存 `code`，展示时按 `code` 映射 `name`。
- 严禁在列注释里硬编码枚举值清单却无字典支撑；新增枚举走 `value_list` 插入，不改动表结构。

---

## 1. 组织与身份（RBAC）

> **重要更正（相对早期版本）**：权限模型是**多角色 RBAC + 组织树 + 数据级 ABAC** 的混合架构，并非“用户挂一个 `role` 字段”。
> - 一个用户可拥有**多个角色**（`users.roleIds` 数组），通过 `user_roles` 关联表归一化。
> - 角色对菜单/功能的权限定义在 `role_menu_permissions`；组织级、用户级还可叠加 `org_menu_permissions` / `user_menu_permissions`。
> - 组织是树形结构（`organizations`），用于归属、ACL 部门主体与“含子部门”继承。
> - 素材/素材组的**数据级**可见/可编辑/可下载，由 `group_acl` / `asset_acl` 控制，权限等级来自 `value_list` 维度 `group_permission_level` / `asset_permission_level`（带权重，高包含低）。

### 1.0 值列表 / 系统字典表 `value_list` ✅

**全库唯一枚举源**（前端 `db.valueListTree`，`SEED_VALUE_LIST_TREE` 种子）。树形结构：`type='dimension'` 为维度根，`type='value'`/`type='group'` 为取值/子分组，`parent_id` 指向上级维度。

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | VARCHAR(64) PK | 节点 ID（如 `"vl_dim_brand"` / `"vl_b1"`） |
| `parent_id` | VARCHAR(64) FK→value_list ON DELETE CASCADE | 父节点（维度根 `parent_id=""`，取值节点指向所属维度） |
| `code` | VARCHAR(64) NOT NULL | 业务 code（如 `peugeot` / `group_permission_level`） |
| `name` | VARCHAR(128) NOT NULL | 展示名（如 `"东风标致"` / `"素材组权限等级"`） |
| `type` | VARCHAR(20) NOT NULL | `dimension` / `value` / `group` |
| `ref_id` | VARCHAR(64) | 跨维度引用（如 series 引用所属 brand 的 value id） |
| `attr1` | VARCHAR(64) | 扩展属性 1（权限等级权重数值存此，如 `"1"`~`"4"`） |
| `attr2` | VARCHAR(64) | 扩展属性 2（预留） |
| `description` | VARCHAR(512) | 描述 |
| `sort_order` | INT DEFAULT 0 | 排序 |
| `status` | VARCHAR(20) DEFAULT 'enabled' | `enabled` / `disabled`（业务启用状态；逻辑删除统一走 `deleted_at`） |
| `created_at` | DATETIME NOT NULL | 创建时间 |
| `created_by` | VARCHAR(64) FK→users ON DELETE SET NULL | 创建人 |
| `updated_at` | DATETIME | 更新时间 |
| `updated_by` | VARCHAR(64) FK→users ON DELETE SET NULL | 最后修改人 |
| `deleted_at` | DATETIME | 软删除时间 |
| `deleted_by` | VARCHAR(64) FK→users ON DELETE SET NULL | 删除人 |

**唯一约束**：`UNIQUE(parent_id, code)`（同维度内 code 唯一）
**索引**：`idx_vl_parent(parent_id)`、`idx_vl_code(code)`、`idx_vl_type(type)`

> 维度清单见附录 8.4。所有业务的 `status`/`permission`/`type`/`scope`/`subject_type`/`action` 列均引用本表 `code`，是“值列表 = 系统字典”的唯一定义源。

### 1.1 组织表 `organizations` ✅

树形组织结构（品牌中心 / 市场部 / 经销商支持 …），同时作为素材归属部门、分享责任部门、ACL 的“部门”主体。

| 字段 | 类型 | 说明 | 示例 |
|------|------|------|------|
| `id` | VARCHAR(64) PK | 组织 ID | `"org-market"` |
| `name` | VARCHAR(128) NOT NULL | 组织/部门名称 | `"市场部"` |
| `parent_id` | VARCHAR(64) FK→organizations ON DELETE RESTRICT | 上级组织（`""` 为根，支持树形） | `""` |
| `manager` | VARCHAR(128) | 负责人姓名 | `"陈然"` |
| `status` | VARCHAR(20) DEFAULT 'enabled' | 业务启用状态（`value_list` 维度 `org_status`：enabled/disabled；**删除统一走 `deleted_at`**） | `"enabled"` |
| `sort_order` | INT DEFAULT 0 | 排序 | `1` |
| `created_at` | DATETIME NOT NULL | 创建时间 | — |
| `created_by` | VARCHAR(64) FK→users ON DELETE SET NULL | 创建人 | — |
| `updated_at` | DATETIME | 更新时间 | — |
| `updated_by` | VARCHAR(64) FK→users ON DELETE SET NULL | 最后修改人 | — |
| `deleted_at` | DATETIME | 软删除时间 | — |
| `deleted_by` | VARCHAR(64) FK→users ON DELETE SET NULL | 删除人 | — |

**索引**：`idx_orgs_parent(parent_id)`、`idx_orgs_status(status)`

> 关联：`users.organization_id`→本表；`assets.organization_id`（原 `department`）→本表；`shares.owned_by_org_id`（原 `owned_by_dept`）→本表；`group_acl`/`asset_acl` 的 `subject_type='department'` 时 `subject_id`→本表 `id`。`getOrgAncestorIds()` 沿 `parent_id` 向上追溯，支撑 ACL “含子部门”。

### 1.2 用户表 `users` ✅（已重构）

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | VARCHAR(64) PK | 用户 ID |
| `name` | VARCHAR(128) NOT NULL | 显示名称 |
| `username` | VARCHAR(64) UNIQUE | 登录账号 |
| `password_hash` | VARCHAR(256) | 密码哈希 |
| `email` | VARCHAR(256) | 邮箱 |
| `avatar_url` | VARCHAR(512) | 头像 URL |
| `organization_id` | VARCHAR(64) FK→organizations ON DELETE RESTRICT | **所属组织**（替代早期 `department` 字符串；统一存组织 ID） |
| `primary_role_id` | VARCHAR(64) FK→roles ON DELETE SET NULL | 主角色（= `roleIds[0]`，冗余便利字段；权威来源是 `user_roles`） |
| `language` | VARCHAR(10) DEFAULT 'zh-CN' | 语言偏好 |
| `status` | VARCHAR(20) DEFAULT 'enabled' | 业务启用状态（`value_list` 维度 `user_status`：enabled/disabled；**删除统一走 `deleted_at`**） |
| `last_login` | DATETIME | 最近登录 |
| `created_at` | DATETIME NOT NULL | 创建时间 |
| `created_by` | VARCHAR(64) FK→users ON DELETE SET NULL | 创建人（管理员开通 / 自助注册则记为系统账号） |
| `updated_at` | DATETIME | 更新时间 |
| `updated_by` | VARCHAR(64) FK→users ON DELETE SET NULL | 最后修改人 |
| `deleted_at` | DATETIME | 软删除时间 |
| `deleted_by` | VARCHAR(64) FK→users ON DELETE SET NULL | 删除人 |

> **注意**：早期文档的 `role ENUM('admin','editor','viewer')` 字段**已删除**。多角色通过 `user_roles` 关联表表达，`roleIds` 数组是其前端形态。`department` 字符串字段也已改为 `organization_id` 外键（与组织树统一，不再 ID/名称混用）。

### 1.3 角色表 `roles` ✅

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | VARCHAR(64) PK | 角色 ID（code，如 `super_admin`/`material-operator`/`tag-viewer`） |
| `name` | VARCHAR(128) NOT NULL | 角色名称（`"素材运营"`） |
| `description` | VARCHAR(512) | 描述 |
| `status` | VARCHAR(20) DEFAULT 'enabled' | 业务启用状态（`value_list` 维度 `role_status`：enabled/disabled；**删除统一走 `deleted_at`**） |
| `sort_order` | INT DEFAULT 0 | 排序 |
| `permissions` | JSON | 菜单权限快照 `{ "<menu.page>": { "visible": bool, "editable": bool } }`（前端当前形态；建表归一化为 `role_menu_permissions`） |
| `created_at` | DATETIME NOT NULL | 创建时间 |
| `created_by` | VARCHAR(64) FK→users ON DELETE SET NULL | 创建人 |
| `updated_at` | DATETIME | 更新时间 |
| `updated_by` | VARCHAR(64) FK→users ON DELETE SET NULL | 最后修改人 |
| `deleted_at` | DATETIME | 软删除时间 |
| `deleted_by` | VARCHAR(64) FK→users ON DELETE SET NULL | 删除人 |

**种子角色**：
- `super_admin` 超级管理员：全部菜单 `visible+editable`
- `material-operator` 素材运营：素材与标签日常维护（tags/collect/share/validity 可见可编辑）
- `tag-viewer` 标签只读：仅 `tags` 可见不可编辑

### 1.4 用户-角色关联表 `user_roles` ✅（多角色核心）

归一化 `users.roleIds` 数组，证明“一个用户多个角色”。

| 字段 | 类型 | 说明 |
|------|------|------|
| `user_id` | VARCHAR(64) FK→users ON DELETE CASCADE | 用户 |
| `role_id` | VARCHAR(64) FK→roles ON DELETE CASCADE | 角色 |
| `created_at` | DATETIME NOT NULL | 关联创建时间 |
| `created_by` | VARCHAR(64) FK→users ON DELETE SET NULL | 授权人（将角色授予该用户者，=创建人） |
| `updated_at` | DATETIME | 更新时间 |
| `updated_by` | VARCHAR(64) FK→users ON DELETE SET NULL | 最后修改人 |
| `deleted_at` | DATETIME | 软删除时间 |
| `deleted_by` | VARCHAR(64) FK→users ON DELETE SET NULL | 删除人（解除授权者） |

**联合主键**：`(user_id, role_id)`

### 1.5 菜单表 `menus` ✅

功能导航树，同时是**权限的目标标识**（角色/组织/用户权限都以 `menu.page` 为键）。

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | VARCHAR(64) PK | 菜单 ID（`"menu_tags"`） |
| `code` | VARCHAR(64) | 菜单编码（`"tags"`） |
| `name` | VARCHAR(128) NOT NULL | 菜单名称（`"标签管理"`） |
| `category` | VARCHAR(20) | `root` / `group` / `page` |
| `page` | VARCHAR(64) | **权限目标键**（与 `roles.permissions` / `*_menu_permissions` 对应，如 `"tags"`、`"share"`） |
| `parent_id` | VARCHAR(64) FK→menus ON DELETE RESTRICT | 父菜单（支持树形） |
| `layout` | VARCHAR(20) | `home` / `asset` / `manage` |
| `icon` | VARCHAR(32) | 图标 |
| `order` | INT DEFAULT 0 | 排序 |
| `hidden` | TINYINT(1) DEFAULT 0 | 是否隐藏 |
| `valid` | TINYINT(1) DEFAULT 1 | 是否有效 |
| `description` | VARCHAR(512) | 描述 |
| `created_at` | DATETIME NOT NULL | 创建时间 |
| `created_by` | VARCHAR(64) FK→users ON DELETE SET NULL | 创建人 |
| `updated_at` | DATETIME | 更新时间 |
| `updated_by` | VARCHAR(64) FK→users ON DELETE SET NULL | 最后修改人 |
| `deleted_at` | DATETIME | 软删除时间 |
| `deleted_by` | VARCHAR(64) FK→users ON DELETE SET NULL | 删除人 |

**索引**：`idx_menus_parent(parent_id)`、`idx_menus_page(page)`

### 1.6 角色菜单权限表 `role_menu_permissions` ✅

归一化 `roles.permissions` JSON，表达每个角色对每个菜单的可见/可编辑。

| 字段 | 类型 | 说明 |
|------|------|------|
| `role_id` | VARCHAR(64) FK→roles ON DELETE CASCADE | 角色 |
| `menu_id` | VARCHAR(64) FK→menus ON DELETE CASCADE | 菜单（逻辑键为 `menus.page`） |
| `visible` | TINYINT(1) DEFAULT 0 | 是否可见 |
| `editable` | TINYINT(1) DEFAULT 0 | 是否可编辑 |
| `created_at` | DATETIME NOT NULL | 授权时间 |
| `created_by` | VARCHAR(64) FK→users ON DELETE SET NULL | 授权人（=创建人） |
| `updated_at` | DATETIME | 更新时间 |
| `updated_by` | VARCHAR(64) FK→users ON DELETE SET NULL | 最后修改人 |
| `deleted_at` | DATETIME | 软删除时间 |
| `deleted_by` | VARCHAR(64) FK→users ON DELETE SET NULL | 删除人（撤销授权者） |

**联合主键**：`(role_id, menu_id)`

> 解析顺序见 `getMenuPermission()`：超管全开；否则取 `当前用户所有角色的权限 ∪ 组织权限 ∪ 用户权限`，任一源 `editable` 即为可编辑，任一源 `visible` 即为可见。

### 1.7 组织菜单权限表 `org_menu_permissions` ✅

组织级叠加权限（`db.orgPermissions[orgId][menuId]`），优先级介于角色与个人之间。

| 字段 | 类型 | 说明 |
|------|------|------|
| `org_id` | VARCHAR(64) FK→organizations ON DELETE CASCADE | 组织 |
| `menu_id` | VARCHAR(64) FK→menus ON DELETE CASCADE | 菜单（逻辑键为 `menus.page`） |
| `visible` | TINYINT(1) DEFAULT 0 | — |
| `editable` | TINYINT(1) DEFAULT 0 | — |
| `created_at` | DATETIME NOT NULL | 授权时间 |
| `created_by` | VARCHAR(64) FK→users ON DELETE SET NULL | 授权人（=创建人） |
| `updated_at` | DATETIME | 更新时间 |
| `updated_by` | VARCHAR(64) FK→users ON DELETE SET NULL | 最后修改人 |
| `deleted_at` | DATETIME | 软删除时间 |
| `deleted_by` | VARCHAR(64) FK→users ON DELETE SET NULL | 删除人 |

**联合主键**：`(org_id, menu_id)`

### 1.8 用户菜单权限表 `user_menu_permissions` ✅

用户级直接授权（`db.userPermissions[userId][menuId]`），最高优先级覆盖。

| 字段 | 类型 | 说明 |
|------|------|------|
| `user_id` | VARCHAR(64) FK→users ON DELETE CASCADE | 用户 |
| `menu_id` | VARCHAR(64) FK→menus ON DELETE CASCADE | 菜单（逻辑键为 `menus.page`） |
| `visible` | TINYINT(1) DEFAULT 0 | — |
| `editable` | TINYINT(1) DEFAULT 0 | — |
| `created_at` | DATETIME NOT NULL | 授权时间 |
| `created_by` | VARCHAR(64) FK→users ON DELETE SET NULL | 授权人（=创建人） |
| `updated_at` | DATETIME | 更新时间 |
| `updated_by` | VARCHAR(64) FK→users ON DELETE SET NULL | 最后修改人 |
| `deleted_at` | DATETIME | 软删除时间 |
| `deleted_by` | VARCHAR(64) FK→users ON DELETE SET NULL | 删除人 |

**联合主键**：`(user_id, menu_id)`

### 1.9 用户登录记录 `user_sessions` ✅

> 对应前端 `db.loginLogs`（已实现：`app-core.js:2669-2678`，纯追加登录流水，记录 `username` / `name` / `loginAt` / `ip` / `entry`）。
> `user_id` 即创建人（登录用户本人）；本表为不可变登录流水，`updated_at`/`updated_by` 实际恒空，`deleted_at`/`deleted_by` 预留（异常会话清理）。
> **登录渠道**：原型以 `entry` 自由文本记录（默认 `"网页登录"`，未来企微/飞书单点登录可传入 `"企微单点登录"` / `"飞书单点登录"`）；目标态归一化为 `login_channel` 值列表 code（见附录 8.4 `login_channel` 维度）。

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | VARCHAR(64) PK | — |
| `user_id` | VARCHAR(64) FK→users ON DELETE SET NULL | 登录用户（=创建人；原型现以 `username`/`name` 快照，目标态归一化） |
| `login_channel` | VARCHAR(64) FK→value_list（code） | **登录渠道**：`web_password` 网页密码 / `wecom_sso` 企微单点 / `feishu_sso` 飞书单点（原型 `entry` 字段归一化） |
| `ip_address` | VARCHAR(45) | 登录 IP（原型 `ip`） |
| `user_agent` | VARCHAR(512) | 浏览器/客户端标识（目标态建议补采；原型未采集） |
| `login_at` | DATETIME NOT NULL | 登录时间（原型 `loginAt`） |
| `created_at` | DATETIME NOT NULL | 创建时间 |
| `created_by` | VARCHAR(64) FK→users ON DELETE SET NULL | 创建人（=登录用户，冗余标注） |
| `updated_at` | DATETIME | 更新时间（登录流水通常不改） |
| `updated_by` | VARCHAR(64) FK→users ON DELETE SET NULL | 最后修改人（通常空） |
| `deleted_at` | DATETIME | 软删除时间（异常清理用） |
| `deleted_by` | VARCHAR(64) FK→users ON DELETE SET NULL | 删除人 |

---

## 2. 核心业务表

### 2.1 素材表 `assets` ✅

> 状态模型为 **`asset_status`（资产主状态）+ `audit_status`（审核链路状态）** 双字段，与前端 `getAssetStatusConfig()`/`getAuditStatusConfig()` 对齐。两字段取值均来自 `value_list` 维度。

| 字段 | 类型 | 说明 | 示例/枚举值 |
|------|------|------|-------------|
| `id` | VARCHAR(64) PK | 主键 | `"asset-1718523456789-a3f2"` |
| `name` | VARCHAR(512) NOT NULL | 素材名称（不含扩展名） | — |
| `file_path` | VARCHAR(2048) NOT NULL | 文件存储路径/OSS key | `"/assets/2026/06/asset-01.jpg"` |
| `thumbnail_path` | VARCHAR(2048) | 缩略图路径 | — |
| `original_name` | VARCHAR(512) | 原始上传文件名 | `"海报_final_v3.jpg"` |
| `format` | VARCHAR(20) | 文件格式（大写，= `value_list` `file_format` code） | `JPEG`, `MP4`, `PDF` |
| `mime_type` | VARCHAR(128) | MIME 类型 | `"image/jpeg"` |
| `media_type` | VARCHAR(20) | 大类（`value_list` `file_format` 顶层 group：图片/视频/文件） | `图片`, `视频`, `文件` |
| `file_size` | BIGINT UNSIGNED | 文件大小（字节） | `485919` |
| `width` | INT | 像素宽度 | `3000` |
| `height` | INT | 像素高度 | `2000` |
| `aspect_ratio` | DECIMAL(5,3) | 宽高比 | `1.500` |
| `duration` | INT | 视频时长（秒） | `NULL` |
| `brand` | VARCHAR(64) | 品牌（`value_list` `brand` code，如 `peugeot`/`citroen`） | `peugeot`, `citroen` |
| `series` | VARCHAR(64) | 车系（`value_list` `series` code） | `4008`, `c5-aircross` |
| `model` | VARCHAR(64) | 车型（`value_list` `model` code） | — |
| `interior_colors` | JSON | 内饰色数组（`value_list` `interior_color` code 数组） | — |
| `exterior_colors` | JSON | 外饰色数组（`value_list` `exterior_color` code 数组） | — |
| `dominant_color` | VARCHAR(64) | 主色调（`value_list` `exterior_color`/`interior_color` code，如 `exterior-v8fa5-6bfd`；**目标存 code 而非中文**，与全局枚举规范一致） | `exterior-v8fa5-6bfd` |
| `desc` | TEXT | 描述 | — |
| `permission` | VARCHAR(64) | 权限范围（`value_list` `asset_permission_level` code，如 `download`） | `view`, `edit`, `download`, `full` |
| `asset_status` | VARCHAR(20) NOT NULL | 资产主状态（`value_list` 维度 `asset_status`：active/deleted/disabled/pending） | `active` |
| `audit_status` | VARCHAR(20) | 审核链路状态（`value_list` 维度 `audit_status`：pending_submit…human_pass） | `machine_pass` |
| `group_id` | VARCHAR(64) FK→groups ON DELETE SET NULL | 所属素材组 | `"all"` |
| `owner_id` | VARCHAR(64) FK→users ON DELETE SET NULL | 所有者（=创建人） | — |
| `organization_id` | VARCHAR(64) FK→organizations ON DELETE RESTRICT | **所属组织**（替代早期 `department` 字符串，统一存组织 ID） | `"org-market"` |
| `valid_from` | DATETIME | 生效时间 | — |
| `valid_until` | DATETIME | 失效时间（NULL 不限；是否过期由 `value_list` `asset_validity` 维度派生） | — |
| `version` | VARCHAR(64) | 版本号 | — |
| `share_count` | INT DEFAULT 0 | 分享次数 | — |
| `download_count` | INT DEFAULT 0 | 下载次数 | — |
| `view_count` | INT DEFAULT 0 | 浏览次数 | — |
| `created_by` | VARCHAR(64) FK→users ON DELETE SET NULL | 创建者 | — |
| `created_at` | DATETIME NOT NULL | 创建时间 | — |
| `updated_at` | DATETIME | 更新时间 | — |
| `updated_by` | VARCHAR(64) FK→users ON DELETE SET NULL | 最后修改人 | — |
| `deleted_at` | DATETIME | 软删除时间（原 `asset_status='deleted'` 语义迁移至此） | `NULL` |
| `deleted_by` | VARCHAR(64) FK→users ON DELETE SET NULL | 删除人（移入回收站/彻底删除者） | — |

**索引**：`idx_assets_asset_status`, `idx_assets_audit_status`, `idx_assets_group`, `idx_assets_owner`, `idx_assets_org`, `idx_assets_brand_model`, `idx_assets_valid_until`, `idx_assets_created_at`, `idx_assets_updated_at`, `idx_assets_deleted_at`, `FULLTEXT idx_assets_name(name, desc)`

> 字段命名说明：原单一 `status` 列已拆为 `asset_status`+`audit_status`；`brand`/`series`/`model`/`permission`/`dominant_color` 目标统一存 `value_list` code（前端当前部分种子已改 code，运行时本就存 code）；`department` 字符串改为 `organization_id` 外键，与组织树统一。删除语义统一由 `deleted_at` 承担。

### 2.2 素材标签关联表 `asset_tags` ✅

素材和标签多对多。

| 字段 | 类型 | 说明 |
|------|------|------|
| `asset_id` | VARCHAR(64) FK→assets ON DELETE CASCADE | 素材 |
| `tag_id` | VARCHAR(64) FK→tags ON DELETE CASCADE | 标签 |
| `tag_type` | ENUM('custom','ai','system') | 标签来源（`value_list` 维度 `tag_type` 预留） |
| `created_at` | DATETIME NOT NULL | 关联创建时间 |
| `created_by` | VARCHAR(64) FK→users ON DELETE SET NULL | 打标人（=创建人） |
| `updated_at` | DATETIME | 更新时间 |
| `updated_by` | VARCHAR(64) FK→users ON DELETE SET NULL | 最后修改人 |
| `deleted_at` | DATETIME | 软删除时间 |
| `deleted_by` | VARCHAR(64) FK→users ON DELETE SET NULL | 删除人（去标签者） |

**联合主键**：`(asset_id, tag_id, tag_type)`

### 2.3 标签表 `tags` ✅

支持树形（业务标签可嵌套）。

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | VARCHAR(64) PK | `"tag-xxx"` |
| `name` | VARCHAR(128) NOT NULL | 标签名称 |
| `parent_id` | VARCHAR(64) FK→tags ON DELETE SET NULL | 父级标签 |
| `tag_type` | ENUM('custom','ai','system') | 标签类型 |
| `desc` | VARCHAR(512) | 描述 |
| `sort_order` | INT DEFAULT 0 | 排序 |
| `created_at` | DATETIME NOT NULL | 创建时间 |
| `created_by` | VARCHAR(64) FK→users ON DELETE SET NULL | 创建人 |
| `updated_at` | DATETIME | 更新时间 |
| `updated_by` | VARCHAR(64) FK→users ON DELETE SET NULL | 最后修改人 |
| `deleted_at` | DATETIME | 软删除时间（原 `status='deleted'` 语义迁移至此） |
| `deleted_by` | VARCHAR(64) FK→users ON DELETE SET NULL | 删除人 |

**唯一约束**：`(name, tag_type)`

### 2.4 素材组表 `groups` ✅

树形素材组。

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | VARCHAR(64) PK | `"group-xxx"` |
| `name` | VARCHAR(256) NOT NULL | 素材组名称 |
| `parent_id` | VARCHAR(64) FK→groups ON DELETE SET NULL | 父级组（ACL 向上继承） |
| `depth` | INT DEFAULT 0 | 层级深度 |
| `desc` | TEXT | 说明 |
| `is_system` | TINYINT(1) DEFAULT 0 | 系统内置 |
| `status` | VARCHAR(20) DEFAULT 'active' | 业务状态（`value_list` 维度 `group_status`：active/deleted/disabled；**删除统一走 `deleted_at`**） |
| `asset_count` | INT DEFAULT 0 | 素材数量（冗余缓存） |
| `owner_id` | VARCHAR(64) FK→users ON DELETE SET NULL | 创建者（=创建人） |
| `created_at` | DATETIME NOT NULL | 创建时间 |
| `updated_at` | DATETIME | 更新时间 |
| `updated_by` | VARCHAR(64) FK→users ON DELETE SET NULL | 最后修改人 |
| `deleted_at` | DATETIME | 软删除时间（原 `status='deleted'` 语义迁移至此） |
| `deleted_by` | VARCHAR(64) FK→users ON DELETE SET NULL | 删除人 |

### 2.5 用户素材组关联表 `user_group_relations` ✅

> 前端 `db` 当前以 `user.favorites` / `user.subscriptions` 等数组形态存在，建表归一化为本关联表（见 `app-render.js` 收藏/订阅逻辑）。

| 字段 | 类型 | 说明 |
|------|------|------|
| `user_id` | VARCHAR(64) FK→users ON DELETE CASCADE | 用户 |
| `group_id` | VARCHAR(64) FK→groups ON DELETE CASCADE | 素材组 |
| `is_favorite` | TINYINT(1) DEFAULT 0 | 收藏 |
| `is_subscribed` | TINYINT(1) DEFAULT 0 | 订阅 |
| `created_at` | DATETIME NOT NULL | 关联创建时间 |
| `created_by` | VARCHAR(64) FK→users ON DELETE SET NULL | 操作人（=创建人） |
| `updated_at` | DATETIME | 更新时间 |
| `updated_by` | VARCHAR(64) FK→users ON DELETE SET NULL | 最后修改人 |
| `deleted_at` | DATETIME | 软删除时间 |
| `deleted_by` | VARCHAR(64) FK→users ON DELETE SET NULL | 删除人 |

**联合主键**：`(user_id, group_id)`

---

## 3. 数据级访问控制（ABAC）

> 早期文档用一张不存在的 `group_members` 表描述素材组协作权限；实际模型是 **ACL 记录表**（`group_acl`/`asset_acl`），支持主体类型 `user`/`company`/`department`、权限等级权重、含子部门继承、有效期，且素材组 ACL 沿 `parent_id` 向上继承（`getGroupEffectiveAcl`）。

### 3.1 素材组访问控制表 `group_acl` ✅

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | VARCHAR(64) PK | `"group-acl-..."` |
| `group_id` | VARCHAR(64) FK→groups ON DELETE CASCADE | 目标素材组 |
| `subject_type` | VARCHAR(20) | 主体类型（`value_list` 维度 `permission_subject_type`：user/company/department） |
| `subject_id` | VARCHAR(64) | `user.id` / `"all"`(company) / `organization_id`(department) |
| `subject_name` | VARCHAR(128) | 主体显示名 |
| `permission` | VARCHAR(20) | 权限等级（`value_list` 维度 `group_permission_level`：view/download/contribute/manage） |
| `include_sub_dept` | TINYINT(1) DEFAULT 0 | 部门主体是否含子组织 |
| `expires_at` | DATETIME | 过期时间（NULL 不限） |
| `granted_by` | VARCHAR(64) FK→users ON DELETE SET NULL | 授权人（=创建人） |
| `granted_at` | DATETIME | 授权时间 |
| `created_at` | DATETIME NOT NULL | 创建时间 |
| `updated_at` | DATETIME | 更新时间（撤销/改权限等级时记录，原缺，已补） |
| `updated_by` | VARCHAR(64) FK→users ON DELETE SET NULL | 最后修改人 |
| `deleted_at` | DATETIME | 软删除时间（撤销 ACL 时记录） |
| `deleted_by` | VARCHAR(64) FK→users ON DELETE SET NULL | 删除人（撤销授权者） |

**索引**：`idx_group_acl_group(group_id)`、`idx_group_acl_subject(subject_type, subject_id)`

### 3.2 素材访问控制表 `asset_acl` ✅

结构与 `group_acl` 相同，仅目标外键为 `asset_id`→assets（无 `parent_id` 继承）。

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | VARCHAR(64) PK | `"asset-acl-..."` |
| `asset_id` | VARCHAR(64) FK→assets ON DELETE CASCADE | 目标素材 |
| `subject_type` | VARCHAR(20) | `value_list` 维度 `permission_subject_type`：user/company/department |
| `subject_id` | VARCHAR(64) | 同 `group_acl` |
| `subject_name` | VARCHAR(128) | — |
| `permission` | VARCHAR(20) | 权限等级（`value_list` 维度 `asset_permission_level`：view/edit/download/full） |
| `include_sub_dept` | TINYINT(1) DEFAULT 0 | — |
| `expires_at` | DATETIME | — |
| `granted_by` | VARCHAR(64) FK→users ON DELETE SET NULL | 授权人（=创建人） |
| `granted_at` | DATETIME | 授权时间 |
| `created_at` | DATETIME NOT NULL | 创建时间 |
| `updated_at` | DATETIME | 更新时间（原缺，已补） |
| `updated_by` | VARCHAR(64) FK→users ON DELETE SET NULL | 最后修改人 |
| `deleted_at` | DATETIME | 软删除时间 |
| `deleted_by` | VARCHAR(64) FK→users ON DELETE SET NULL | 删除人 |

**索引**：`idx_asset_acl_asset(asset_id)`、`idx_asset_acl_subject(subject_type, subject_id)`

> 判定链路：`canViewAsset`/`canEditAsset` 综合「所有者 / 素材组权限(`canViewGroup` 经 `group_acl` 权重) / 素材 ACL」三者；`aclMatchesCurrentUser` 处理主体匹配与部门含子部门；`getPermissionWeight` 从 `value_list` 维度取 `attr1` 数值权重比较高低。

---

## 4. 协作与工作流表

### 4.1 分享记录表 `shares` ✅

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | VARCHAR(64) PK | — |
| `name` | VARCHAR(256) | 分享名称 |
| `creator_id` | VARCHAR(64) FK→users ON DELETE SET NULL | 分享人（=创建人） |
| `target_type` | ENUM('group','asset','basket') | 分享目标类型 |
| `target_id` | VARCHAR(2048) | 目标 ID（basket 为逗号分隔的 asset ID；**目标态建议拆 `share_assets(share_id, asset_id)` 关联表**，避免逗号串存多值） |
| `access_scope` | VARCHAR(20) | `value_list` 维度 `share_access_scope`：internal(仅公司内部) / public(公开) |
| `content_permission` | VARCHAR(20) | `value_list` 维度 `share_content_permission`：view / download |
| `require_password` | TINYINT(1) DEFAULT 0 | 是否密码保护 |
| `password_hash` | VARCHAR(256) | 访问密码哈希（**目标态存哈希，不存明文 `password`**） |
| `share_code` | VARCHAR(16) | 分享码 |
| `share_link` | VARCHAR(2048) | 分享链接 |
| `expires_at` | DATETIME | 过期时间 |
| `max_visits` | INT | 最大访问次数（NULL 不限） |
| `visit_count` | INT DEFAULT 0 | 访问人数 |
| `view_count` | INT DEFAULT 0 | 浏览次数 |
| `download_count` | INT DEFAULT 0 | 下载次数 |
| `status` | VARCHAR(20) DEFAULT 'active' | 业务状态（`value_list` 维度 `share_status`：active/revoked/expired；**删除统一走 `deleted_at`**） |
| `owned_by` | VARCHAR(64) | 责任人展示名（username/name；**建议改为 `owned_by_user_id` FK→users**，与全局“组织/人员统一存 ID”一致） |
| `owned_by_org_id` | VARCHAR(64) FK→organizations ON DELETE RESTRICT | **责任部门**（替代早期 `owned_by_dept` 字符串，统一存组织 ID） |
| `shared_at` | DATETIME | 分享时间 |
| `created_at` | DATETIME NOT NULL | 创建时间 |
| `updated_at` | DATETIME | 更新时间（撤销/改密码/改有效期时记录，原缺，已补） |
| `updated_by` | VARCHAR(64) FK→users ON DELETE SET NULL | 最后修改人 |
| `deleted_at` | DATETIME | 软删除时间（撤销分享时记录） |
| `deleted_by` | VARCHAR(64) FK→users ON DELETE SET NULL | 删除人 |

**索引**：`idx_shares_target`, `idx_shares_code`, `idx_shares_expires`

### 4.2 收集任务表 `collect_tasks` ✅

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | VARCHAR(64) PK | — |
| `theme` | VARCHAR(256) NOT NULL | 任务主题 |
| `desc` | TEXT | 收集说明 |
| `group_name` | VARCHAR(256) | 存放素材组名称 |
| `group_id` | VARCHAR(64) FK→groups ON DELETE SET NULL | 关联素材组 |
| `status` | VARCHAR(20) DEFAULT 'active' | 业务状态（`value_list` 维度 `collect_task_status`：active/completed/expired；**删除统一走 `deleted_at`**） |
| `audit_status` | VARCHAR(20) | `value_list` 维度 `audit_status`：pending_submit / pending_audit / human_pass … |
| `access_code` | VARCHAR(8) | 访问密码 |
| `allowed_file_types` | JSON | 允许类型（file_format group code 数组） |
| `deadline` | DATE | 截止日期 |
| `creator_id` | VARCHAR(64) FK→users ON DELETE SET NULL | 创建人（=创建人） |
| `owned_by` | VARCHAR(64) | 责任人展示名（建议改 `owned_by_user_id` FK→users） |
| `owned_by_org_id` | VARCHAR(64) FK→organizations ON DELETE RESTRICT | 责任部门 |
| `expires_at` | DATETIME | 失效时间 |
| `created_at` | DATETIME NOT NULL | 创建时间 |
| `updated_at` | DATETIME | 更新时间 |
| `updated_by` | VARCHAR(64) FK→users ON DELETE SET NULL | 最后修改人 |
| `deleted_at` | DATETIME | 软删除时间 |
| `deleted_by` | VARCHAR(64) FK→users ON DELETE SET NULL | 删除人 |

### 4.3 权限申请表 `permission_requests` ✅

对应前端「权限申请 / 待处理审批」功能（素材入库审批走 `assets.audit_status` 状态机，权限审批走本表）。

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | VARCHAR(64) PK | — |
| `target_type` | ENUM('asset','group') | 目标类型 |
| `target_id` | VARCHAR(64) | 目标 ID |
| `applicant` | VARCHAR(128) | 申请人显示名 |
| `applicant_id` | VARCHAR(64) FK→users ON DELETE SET NULL | 申请人（=创建人） |
| `requested_permission` | VARCHAR(64) | `value_list` 维度权限等级 code：`view`/`edit`/`download`/`manage` |
| `duration` | VARCHAR(20) | `value_list` 维度预留：7天 / 30天 / 90天 / 长期 |
| `reason` | TEXT | 申请理由 |
| `status` | VARCHAR(20) DEFAULT 'pending' | 业务状态（`value_list` 维度 `permission_request_status`：pending/approved/rejected；**删除统一走 `deleted_at`**） |
| `reviewer_id` | VARCHAR(64) FK→users ON DELETE SET NULL | 审批人 |
| `reviewed_at` | DATETIME | 审批时间 |
| `created_at` | DATETIME NOT NULL | 创建时间 |
| `updated_at` | DATETIME | 更新时间（审批/驳回时记录，原缺，已补） |
| `updated_by` | VARCHAR(64) FK→users ON DELETE SET NULL | 最后修改人（审批人） |
| `deleted_at` | DATETIME | 软删除时间 |
| `deleted_by` | VARCHAR(64) FK→users ON DELETE SET NULL | 删除人 |

### 4.4 操作日志表 `operation_logs` ✅

> `user_id` 即操作人（=创建人）；本表为不可变审计日志，`updated_at`/`updated_by`/`deleted_at`/`deleted_by` 依第 0.5 节统一保留，实际恒为空（日志不修改、不删除，仅追加）。`asset_id` 在素材删除后置空（`ON DELETE SET NULL`）以保留流水。

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | BIGINT AUTO_INCREMENT PK | — |
| `asset_id` | VARCHAR(64) FK→assets ON DELETE SET NULL | 关联素材（可空） |
| `user_id` | VARCHAR(64) FK→users ON DELETE SET NULL | 操作人（=创建人） |
| `action` | VARCHAR(64) | `value_list` 维度 `operation_action_type` code：upload/download/share/edit/delete/restore/approve/view/comment/tag_merge/permission_change/asset.acl.add … |
| `message` | VARCHAR(1024) | 描述 |
| `metadata` | JSON | 附加信息 |
| `created_at` | DATETIME NOT NULL | 创建时间 |
| `created_by` | VARCHAR(64) FK→users ON DELETE SET NULL | 创建人（=操作人，冗余标注） |
| `updated_at` | DATETIME | 更新时间（恒空） |
| `updated_by` | VARCHAR(64) FK→users ON DELETE SET NULL | 最后修改人（恒空） |
| `deleted_at` | DATETIME | 软删除时间（恒空） |
| `deleted_by` | VARCHAR(64) FK→users ON DELETE SET NULL | 删除人（恒空） |

**索引**：`idx_logs_asset`, `idx_logs_user`, `idx_logs_created_at`

### 4.5 评论表 `comments` 📋

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | VARCHAR(64) PK | — |
| `asset_id` | VARCHAR(64) FK→assets ON DELETE CASCADE | — |
| `user_id` | VARCHAR(64) FK→users ON DELETE SET NULL | 评论人（=创建人） |
| `content` | TEXT | 评论内容 |
| `parent_id` | VARCHAR(64) FK→comments ON DELETE CASCADE | 回复的评论（支持嵌套） |
| `created_at` | DATETIME NOT NULL | 创建时间 |
| `updated_at` | DATETIME | 更新时间（评论被编辑时记录，原缺，已补） |
| `updated_by` | VARCHAR(64) FK→users ON DELETE SET NULL | 最后修改人（评论编辑者） |
| `deleted_at` | DATETIME | 软删除时间（评论删除时记录） |
| `deleted_by` | VARCHAR(64) FK→users ON DELETE SET NULL | 删除人 |

---

## 5. 消息与通知表

### 5.1 系统公告表 `system_notices` 📋

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | VARCHAR(64) PK | — |
| `title` | VARCHAR(256) | — |
| `content` | TEXT | — |
| `publisher_id` | VARCHAR(64) FK→users ON DELETE SET NULL | 发布人（=创建人） |
| `is_active` | TINYINT(1) DEFAULT 1 | 是否生效中 |
| `created_at` | DATETIME NOT NULL | 创建时间 |
| `expires_at` | DATETIME | 过期时间 |
| `updated_at` | DATETIME | 更新时间（公告被编辑时记录，原缺，已补） |
| `updated_by` | VARCHAR(64) FK→users ON DELETE SET NULL | 最后修改人（公告编辑者） |
| `deleted_at` | DATETIME | 软删除时间 |
| `deleted_by` | VARCHAR(64) FK→users ON DELETE SET NULL | 删除人 |

### 5.2 通知表 `notifications` 📋

> 注意：`user_id` 是**接收人**，并非创建人；因此额外保留 `created_by` 记录触发通知的人/系统。

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | VARCHAR(64) PK | — |
| `user_id` | VARCHAR(64) FK→users ON DELETE CASCADE | **接收人**（非创建人） |
| `created_by` | VARCHAR(64) FK→users ON DELETE SET NULL | 触发人 / 系统（=创建人） |
| `updated_at` | DATETIME | 更新时间（`is_read` 翻转时记录） |
| `updated_by` | VARCHAR(64) FK→users ON DELETE SET NULL | 最后修改人（标记已读者） |
| `deleted_at` | DATETIME | 软删除时间（接收人删除通知时记录） |
| `deleted_by` | VARCHAR(64) FK→users ON DELETE SET NULL | 删除人 |
| `type` | VARCHAR(64) | `value_list` 维度预留：upload_complete/share_created/approval_required/tag_recognition_done/permission_request/validity_expiring |
| `title` | VARCHAR(256) | — |
| `content` | TEXT | — |
| `related_asset_id` | VARCHAR(64) FK→assets ON DELETE SET NULL | 关联素材 |
| `is_read` | TINYINT(1) DEFAULT 0 | — |
| `created_at` | DATETIME NOT NULL | 创建时间 |

**索引**：`idx_notif_user_read`, `idx_notif_created_at`

---

## 6. 系统配置表

### 6.1 素材有效期提醒配置 `validity_reminders` 📋

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | VARCHAR(64) PK | — |
| `asset_id` | VARCHAR(64) FK→assets ON DELETE CASCADE | — |
| `remind_days_before` | INT | 提前 N 天（`7`/`15`） |
| `is_enabled` | TINYINT(1) DEFAULT 1 | — |
| `last_reminded_at` | DATETIME | 上次提醒时间 |
| `created_at` | DATETIME NOT NULL | 创建时间 |
| `created_by` | VARCHAR(64) FK→users ON DELETE SET NULL | 创建人 |
| `updated_at` | DATETIME | 更新时间 |
| `updated_by` | VARCHAR(64) FK→users ON DELETE SET NULL | 最后修改人 |
| `deleted_at` | DATETIME | 软删除时间 |
| `deleted_by` | VARCHAR(64) FK→users ON DELETE SET NULL | 删除人 |

### 6.2 上传配置 `upload_settings` 📋

| 字段 | 类型 | 说明 |
|------|------|------|
| `user_id` | VARCHAR(64) PK FK→users ON DELETE CASCADE | 用户（=创建人） |
| `auto_thumbnail` | TINYINT(1) DEFAULT 1 | 自动生成缩略图 |
| `auto_tag` | TINYINT(1) DEFAULT 1 | 自动提取标签 |
| `default_valid_until` | DATETIME | 默认失效日期 |
| `created_at` | DATETIME NOT NULL | 创建时间 |
| `created_by` | VARCHAR(64) FK→users ON DELETE SET NULL | 创建人 |
| `updated_at` | DATETIME | 更新时间 |
| `updated_by` | VARCHAR(64) FK→users ON DELETE SET NULL | 最后修改人 |
| `deleted_at` | DATETIME | 软删除时间 |
| `deleted_by` | VARCHAR(64) FK→users ON DELETE SET NULL | 删除人 |

### 6.3 筛选配置 `filter_presets` 📋

| 字段 | 类型 | 说明 |
|------|------|------|
| `user_id` | VARCHAR(64) PK FK→users ON DELETE CASCADE | 用户（=创建人） |
| `visible_filters` | JSON | 可见筛选字段 `["素材来源","文件格式","车型",...]` |
| `created_at` | DATETIME NOT NULL | 创建时间 |
| `created_by` | VARCHAR(64) FK→users ON DELETE SET NULL | 创建人 |
| `updated_at` | DATETIME | 更新时间 |
| `updated_by` | VARCHAR(64) FK→users ON DELETE SET NULL | 最后修改人 |
| `deleted_at` | DATETIME | 软删除时间 |
| `deleted_by` | VARCHAR(64) FK→users ON DELETE SET NULL | 删除人 |

---

## 7. ER 关系图

> 图中省略审计字段（`created_at`/`created_by`/`updated_at`/`updated_by`/`deleted_at`/`deleted_by`），所有表均按第 0 节规范包含六元审计，详见各表。

```
┌────────────────┐         ┌──────────────────┐         ┌────────────────┐
│  organizations │◄──┐     │      users       │◄──┐     │     roles      │
│────────────────│   │     │──────────────────│   │     │────────────────│
│ id (PK)        │   │     │ id (PK)          │   │     │ id (PK)        │
│ name           │   ├───► │ organization_id(FK)│  │     │ name           │
│ parent_id (FK)─┼─┐ │     │ primary_role_id(FK)│  │     │ permissions(JSON)│
│ manager        │ │ │     │ status           │  │     └───────┬────────┘
│ status         │ │ │     └──────────────────┘  │     ┌───────▼────────┐
└────────────────┘ │ │            │  *..*          │     │  user_roles   │
                   │ │            └────────────────┼─────│────────────────│
                   │ │                  │ 1..*     │     │ user_id (FK)  │
                   │ │     ┌────────────▼──────┐  │     │ role_id (FK)  │
                   │ │     │   menus           │  │     └────────────────┘
                   │ │     │──────────────────│  │     ┌────────────────────────────┐
                   │ │     │ id (PK)          │  │     │ role_menu_permissions      │
                   │ │     │ page (权限键)    │  │     │────────────────────────────│
                   │ │     │ parent_id (FK)───┼──┘     │ role_id (FK)               │
                   │ │     └──────────────────┘        │ menu_id (FK)               │
                   │ │        ▲  *..*                   │ visible / editable         │
                   │ │  ┌─────┴──────────────────────┐ └────────────────────────────┘
                   │ │  │ org_menu_permissions       │ ┌────────────────────────────┐
                   │ │  │────────────────────────────│ │ user_menu_permissions      │
                   │ │  │ org_id (FK)──┐             │ │────────────────────────────│
                   │ │  │ menu_id (FK) │             │ │ user_id (FK)               │
                   │ │  │ visible/editable          │ │ menu_id (FK)               │
                   │ │  └──────────────┼────────────┘ │ visible/editable            │
                   │ │                 │ org_id        └────────────────────────────┘
                   │ │                 ▼
                   │ │     ┌──────────────────┐        ┌──────────────────┐
                   │ │     │     assets       │        │     groups       │
                   │ │     │──────────────────│        │──────────────────│
                   │ │     │ id (PK)          │◄──┐    │ id (PK)          │
                   │ │     │ organization_id(FK)      │ name             │
                   │ │     │ group_id (FK)───│──┐    │ parent_id (FK)──┐│
                   │ │     │ owner_id (FK)    │  │    │ status          ││
                   │ │     │ asset_status     │  │    └────────────────┘│
                   │ │     │ audit_status     │  │         ▲           │
                   │ │     └──────────────────┘  │         │ parent_id │
                   │ │            │ M:N          │         │ (ACL 继承)│
                   │ │     ┌──────┴───────┐      │    ┌────┴───────────┴────┐
                   │ │     │  asset_tags  │      │    │   group_acl         │
                   │ │     │──────────────│      │    │────────────────────│
                   │ │     │ asset_id (FK)│      │    │ id (PK)            │
                   │ │     │ tag_id (FK)──│──────┼────│ group_id (FK)      │
                   │ │     └──────────────┘      │    │ subject_type       │
                   │ │     ┌──────────────┐      │    │ subject_id         │
                   │ │     │    tags      │      │    │ permission(等级)   │
                   │ │     │──────────────│      │    │ include_sub_dept  │
                   │ │     │ id (PK)      │      │    └────────────────────┘
                   │ │     │ parent_id(FK)│      │    ┌────────────────────┐
                   │ │     └──────────────┘      │    │   asset_acl        │
                   │ │                           │    │────────────────────│
                   │ │     ┌──────────────┐      │    │ asset_id (FK)      │
                   │ │     │   shares     │      │    │ subject_type/Id    │
                   │ │     │──────────────│      │    │ permission(等级)   │
                   │ │     │ creator_id(FK)      │    └────────────────────┘
                   │ │     │ owned_by_org_id(FK)─┘
                   │ │     │ target_type  │
                   │ │     └──────────────┘
                   │ │
                   │ └─ user_group_relations (user_id, group_id, fav/sub)
                   └─ value_list (id, parent_id, code, name, type, ref_id, attr1, attr2, status)
                      collect_tasks / permission_requests / operation_logs / comments
                      (分别 FK→ groups / assets·users / assets·users / assets·users)
```

---

## 8. 附录：字段对照与值列表（系统字典）

### 8.1 Asset 字段来源（`app-core.js` `seedAssets` / `createAssetFromFile`）
| 前端字段 | 数据库字段 | 来源 |
|----------|-----------|------|
| `id` | `id` | 自动生成 |
| `name` | `name` | 上传/编辑 |
| `src` | `file_path` | 上传 |
| `format`/`mime`/`type`/`sizeBytes`/`width`/`height` | `format`/`mime_type`/`media_type`/`file_size`/`width`/`height` | 文件元数据 |
| `brand`/`series`/`model` | `brand`/`series`/`model` | 自动识别/编辑（存 `value_list` code） |
| `interiorColors`/`exteriorColors` | `interior_colors`/`exterior_colors` | 编辑（code 数组） |
| `customTags`/`aiTags` | tags（via `asset_tags`） | 上传/编辑 |
| `color` | `dominant_color` | 图片解析（**目标存 `value_list` code，非中文**） |
| `groupId` | `group_id` | 上传/移动 |
| `owner` | `owner_id`→users（=创建人） | 上传/修改所有者 |
| `organizationId` | `organization_id`→organizations | 上传/修改所有者（**替代 `department`**） |
| `permission` | `permission` | 上传/权限修改（存 `value_list` `asset_permission_level` code） |
| `assetStatus`+`auditStatus` | `asset_status`+`audit_status` | 双状态模型（均取 `value_list` 维度） |
| `share/download/view` | `share_count`/`download_count`/`view_count` | 操作计数 |
| `createdAt`/`updatedAt`/`deletedAt` | `created_at`/`updated_at`/`deleted_at` | 自动记录 |
| `createdBy`/`updatedBy`/`deletedBy` | `created_by`/`updated_by`/`deleted_by`→users | 自动记录（=操作人） |

### 8.2 User 字段来源（`app-core.js` `seedUsers` / `getUserSessionInfo`）
| 前端字段 | 数据库字段 |
|----------|-----------|
| `id`/`username`/`name`/`password` | `id`/`username`/`name`/`password_hash` |
| `organizationId` | `organization_id`→organizations（**替代 `department` 字符串**） |
| `roleIds`（数组） | `user_roles`（关联表，归一化多角色）；`primary_role_id`=`roleIds[0]` |
| `role`（展示串） | 由 `user_roles`→`roles.name` 聚合得到 |
| `status` | `status`（`value_list` 维度 `user_status`；删除走 `deleted_at`） |
| 开通/修改/删除人 | `created_by`/`updated_by`/`deleted_by`→users |

### 8.3 Share 字段来源（`app-workflows.js`）
| 前端字段 | 数据库字段 |
|----------|-----------|
| `group`(名称)/`user`(分享人) | `name` / `creator_id`（=创建人） |
| `accessScope`/`contentPermission`/`requirePassword`/`password` | `access_scope`/`content_permission`/`require_password`/`password_hash`（**目标态存哈希**） |
| `targetType`/`targetId`/`code`/`link` | `target_type`/`target_id`/`share_code`/`share_link` |
| `maxVisits`/`visits`/`views`/`downloads` | `max_visits`/`visit_count`/`view_count`/`download_count` |
| `sharedAt`/`expiresAt`/`status` | `shared_at`/`expires_at`/`status`（删除走 `deleted_at`） |
| `ownedBy` / `ownedByDept` | `owned_by`（建议改 `owned_by_user_id`）/ `owned_by_org_id`→organizations（**替代 `owned_by_dept` 字符串**） |

### 8.4 值列表（系统字典）维度总览 — 唯一的枚举 code 源

全部来自前端 `db.valueListTree`（`SEED_VALUE_LIST_TREE`，`app-core.js:28` 起）。**所有 `status`/`permission`/`type`/`scope`/`subject_type`/`action` 列的取值均在此定义**，是“值列表 = 系统字典”的唯一定义源。维度（dimension）与取值（value）通过 `parent_id` 关联：

**A. 素材库筛选维度（`vl_dim_matlib` 下）**
- `brand`（品牌）：`peugeot` 东风标致 / `citroen` 东风雪铁龙 / `jeep` Jeep
- `series`（车系）：`4008-import`/`4008`/`5008`/`408`/`508`/`new-408`（标致）；`sarah-picasso`/`c5-aircross`/`elysee`/`c6`/`c5`/`versailles-c5x`（雪铁龙）
- `model`（车型）：`c5-2.0-manual`/`c5-2011-2.0-manual`（C5）、`versailles-25-n2`/`versailles-24-n2p`（凡尔赛 C5X）等
- `interior_color`（内饰色）、`exterior_color`（外饰色）：按车型细分，code 形如 `exterior-v8fa5-6bfd`
- `file_format`（文件格式）：顶层 group `image`/`video`/`document`/`design`/`text`/`spreadsheet`/`font`/`audio`/`archive`/`3d-model`，下含 `jpg`/`png`/`mp4`/`pdf`/`psd`/`xlsx` … 等 value（均存小写 code）

**B. 素材管理维度（`vl_dim_matmanage` 下，权限/状态核心）**
- `asset_status`（素材状态）：`active` 正常 / `deleted` 已删除 / `disabled` 已禁用 / `pending` 待审核
- `audit_status`（审核链路状态，带权重 attr1）：`pending_submit`(1) 待提交 → `pending_audit`(2) 待审核 → `machine_auditing`(3) 机审中 → `machine_pass`(4) 机审通过 → `machine_reject`(5) 机审拒绝 → `pending_human`(6) 待人审 → `human_auditing`(7) 人审中 → `human_pass`(8) 人审通过 → `human_reject`(9) 人审拒绝
- `manage_status`（旧 manage 状态机，历史兼容）：`ms_pending` … `ms_human_pass` / `ms_not_in_library` 等 10 个
- `group_permission_level`（素材组权限等级，高包含低，权重 attr1）：`view`(1) 可见 / `download`(2) 下载 / `contribute`(3) 素材维护 / `manage`(4) 组管理
- `asset_permission_level`（素材权限等级，正交平行）：`view` 仅预览 / `edit` 可编辑 / `download` 可下载 / `full` 全部权限
- `share_access_scope`（分享访问范围）：`internal` 仅公司内部 / `public` 公开互联网
- `share_content_permission`（分享内容权限）：`view` 仅预览 / `download` 可下载
- `permission_subject_type`（授权主体类型）：`user` 人员 / `department` 部门 / `company` 公司
- `permission_request_status`（权限申请状态）：`pending` 待审批 / `approved` 已通过 / `rejected` 已拒绝
- `asset_validity`（素材有效期状态）：`pending` 待生效 / `valid` 有效 / `expired` 已失效
- `share_status`（分享状态，业务生命周期）：`active` 生效中 / `revoked` 已撤销 / `expired` 已过期
- `collect_task_status`（收集任务状态）：`active` 生效中 / `completed` 已完成 / `expired` 已失效
- `group_status`（素材组状态）：`active` 正常 / `deleted` 已删除 / `disabled` 已禁用
- `user_status`（用户状态）：`enabled` 启用 / `disabled` 停用
- `role_status`（角色状态）：`enabled` 启用 / `disabled` 停用
- `org_status`（组织状态）：`enabled` 启用 / `disabled` 停用
- `operation_action_type`（操作日志动作类型）：`asset.upload`/`asset.edit`/`asset.delete`/`asset.restore`/`asset.move`/`asset.download`/`asset.tag`/`group.acl.add`/`group.acl.remove`/`group.acl.update`/`group.owner.transfer`/`asset.acl.add`/`asset.acl.remove`/`share.create`/`share.revoke`/`share.update`/`collect.create`/`collect.close`/`request.submit`/`request.approve`/`request.reject`/`tag.create`/`tag.edit`/`tag.delete`/`group.create`/`group.rename`/`group.move`/`group.delete` 等 28 个

**C. 登录与鉴权维度**
- `login_channel`（登录渠道）：`web_password` 网页密码登录 / `wecom_sso` 企微单点登录 / `feishu_sso` 飞书单点登录（目标态；原型以 `entry` 自由文本记录 `"网页登录"`，未来 SSO 直接复用此维度扩展 code，不改表结构）

> 权重数值取自 `value_list` 节点的 `attr1` 字段（`getPermissionWeight(code, dimCode)`）。新增枚举只插 `value_list` 节点，不改动任何表结构。

---

## 表数量与构成

**共计 27 张表**（早期版本误写为 17 / 19，且缺失 RBAC、组织、值列表相关表；本版已修正）：

- ✅ 已实现（前端 `localStorage` 已建模，建表时按需归一化）：`value_list`（系统字典/值列表）、`organizations`、`users`、`roles`、`user_roles`、`menus`、`role_menu_permissions`、`org_menu_permissions`、`user_menu_permissions`、`assets`、`asset_tags`、`tags`、`groups`、`user_group_relations`、`group_acl`、`asset_acl`、`shares`、`collect_tasks`、`permission_requests`、`operation_logs`、`user_sessions`（共 21 张）
- 📋 规划（目标态，前端暂未落地实体）：`comments`、`system_notices`、`notifications`、`validity_reminders`、`upload_settings`、`filter_presets`（共 6 张）

> 所有 27 张表均按第 0 节“通用设计规范”包含六元审计字段（创建时间 + 创建人 + 更新时间 + 修改人 + 删除时间 + 删除人），时间列统一 `DATETIME`（GMT+8），外键均声明 `ON DELETE` 动作，删除统一由 `deleted_at` 承载。
> 融合策略与 DDL 见 `MERGE_ANALYSIS.md`（该文档建立在本文 27 表结构之上）。
