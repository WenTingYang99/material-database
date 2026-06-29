# DPCA 素材库 & DPCA-AI 创意平台 — 数据库融合分析报告

> 素材库 19 张规划表 vs develop 项目 SmartAdmin 50+ 张已有表，逐表对比结论。

---

## 总览矩阵

| # | 素材库表 | 融合策略 | develop 对应 | 说明 |
|---|---------|---------|-------------|------|
| 1 | `assets` | 🆕 **新增** | — | 素材库核心，无现成替代 |
| 2 | `tags` | 🆕 **新增** | t_category(部分相似) | 语义不同，独立建表 |
| 3 | `asset_tags` | 🆕 **新增** | — | M:N 关联表 |
| 4 | `groups` | 🆕 **新增** | t_category(部分相似) | 语义不同，独立建表 |
| 5 | `user_group_relations` | 🆕 **新增** | — | 用户-素材组收藏订阅 |
| 6 | `users` | 🔄 **替换** | **t_employee** | 复用 SmartAdmin 员工表 |
| 7 | `user_sessions` | 🔄 **替换** | **t_login_log + Sa-Token** | 复用现有登录体系 |
| 8 | `permission_requests` | 🆕 **新增** | warm-flow(建模) | 用工作流引擎实现 |
| 9 | `shares` | 🆕 **新增** | — | 素材库特有分享逻辑 |
| 10 | `collect_tasks` | 🆕 **新增** | — | 素材库特有收集任务 |
| 11 | `group_members` | 🆕 **新增** | — | 素材组级协作权限 |
| 12 | `operation_logs` | 🔄 **扩展** | **t_operate_log** | 扩展字段复用 |
| 13 | `comments` | 🆕 **新增** | — | 素材评论（独立实体） |
| 14 | `system_notices` | 🔄 **替换** | **t_notice + t_notice_type** | 复用通知公告体系 |
| 15 | `notifications` | 🔄 **扩展** | **t_message** | 扩展消息类型复用 |
| 16 | `approvals` | 🔄 **替换** | **warm-flow 工作流** | 用专业引擎替代 |
| 17 | `validity_reminders` | 🔄 **合并** | **t_config + t_smart_job** | 配置表+定时任务 |
| 18 | `upload_settings` | 🔄 **合并** | **t_config** | KV 配置化 |
| 19 | `filter_presets` | 🔄 **合并** | **t_table_column** | 复用列配置表 |

**统计**: 🆕 新增 10 张 | 🔄 复用/扩展 9 张

---

## 一、🔄 可共用 — 替换/扩展已有表

### 1.1 users → t_employee（替换）

| 素材库字段 | develop 对应字段 | 匹配 | 处理方式 |
|-----------|-----------------|------|---------|
| `id` | `employee_id` (bigint) | ✅ | 类型从 VARCHAR→bigint |
| `name` | `actual_name` | ✅ | 字段改名映射 |
| `username` | `login_name` | ✅ | 一一对应 |
| `password_hash` | `login_pwd` | ✅ | 密码已有 SM4 加密 |
| `email` | `email` | ✅ | 一一对应 |
| `avatar_url` | `avatar` | ✅ | 一一对应 |
| `department` | `department_id` → FK t_department | ⚠️ | 需 JOIN，从字符串→外键 |
| `role` (admin/editor/viewer) | `t_role` + `administrator_flag` | ⚠️ | 从单字段→RBAC 多角色 |
| `language` | — | ❌ 缺失 | **需在 t_employee 新增** |
| `status` | `disabled_flag` | ✅ | disabled_flag=1 即 disabled |
| `created_at` | `create_time` | ✅ | 时间字段对齐 |

**t_employee 需扩展的字段**:
```sql
ALTER TABLE t_employee ADD COLUMN language VARCHAR(10) DEFAULT 'zh-CN' COMMENT '语言偏好';
```

**素材库角色 → SmartAdmin RBAC 映射方案**:
- `admin` → 新建 `素材库管理员` 角色（含素材库全部菜单+按钮权限）
- `editor` → 新建 `素材库编辑者` 角色（可上传/编辑/删除自己的素材）
- `viewer` → 新建 `素材库查看者` 角色（仅查看/下载/评论）

### 1.2 user_sessions → t_login_log + Sa-Token（替换）

develop 已有完整的 session 管理：
- `t_login_log` 记录每次登录（user_id, login_ip, login_result, user_agent）
- Sa-Token 管理 token 生命周期、踢人下线、多点登录控制
- `t_login_fail` 管理登录失败锁定策略

素材库的 `user_sessions` 表可以直接删除，token 验证逻辑全部接入 Sa-Token。

### 1.3 operation_logs → t_operate_log（扩展）

| 素材库字段 | develop 对应字段 | 处理方式 |
|-----------|-----------------|---------|
| `id` | `operate_log_id` | ✅ 一一对应 |
| `asset_id` | — | ❌ **需新增** |
| `user_id` | `operate_user_id` | ✅ |
| `action` | `module` + `content` | ⚠️ 用 module='素材库' 区分 |
| `message` | `content` | ✅ |
| `metadata` | `param` (JSON text) | ⚠️ param 存请求参数，语义不同 |

**t_operate_log 需扩展的字段**:
```sql
ALTER TABLE t_operate_log ADD COLUMN asset_id BIGINT COMMENT '关联素材ID';
ALTER TABLE t_operate_log ADD COLUMN action_type VARCHAR(50) COMMENT '操作类型: upload/download/share/edit/delete/restore/approve/view/comment/tag_merge/permission_change';
ALTER TABLE t_operate_log ADD COLUMN metadata JSON COMMENT '附加信息(old/new values)';
```

素材库操作日志记录在 module='素材库' 时写入，保留原有字段兼容其他模块日志。

### 1.4 system_notices → t_notice + t_notice_type（替换）

develop 的公告体系远更完善：

| 素材库字段 | develop 对应 | 差距 |
|-----------|-------------|------|
| `title` | `title` | ✅ |
| `content` | `content_text` + `content_html` | ✅ 更丰富（支持 HTML） |
| `publisher_id` | `create_user_id` | ✅ |
| `is_active` | `deleted_flag=0` + `publish_time` | ✅ |
| `created_at` | `create_time` | ✅ |
| `expires_at` | — | ❌ **需新增** |

**t_notice 需扩展的字段**:
```sql
ALTER TABLE t_notice ADD COLUMN expires_at DATETIME COMMENT '过期时间';
```

额外能力（素材库没有，develop 已有，可直接受益）:
- `t_notice_visible_range` 按员工/部门设置可见范围
- `t_notice_view_record` 查看记录追踪
- `scheduled_publish_flag` 定时发布
- `document_number` 公文文号

### 1.5 notifications → t_message（扩展）

| 素材库字段 | develop 对应 | 处理方式 |
|-----------|-------------|---------|
| `id` | `message_id` | ✅ |
| `user_id` | `receiver_user_id` | ✅ |
| `type` | `message_type` (smallint) | ⚠️ 从字符串→数字枚举 |
| `title` | `title` | ✅ |
| `content` | `content` | ✅ |
| `related_asset_id` | `data_id` | ⚠️ data_id 是通用字段 |
| `is_read` | `read_flag` | ✅ |
| `created_at` | `create_time` | ✅ |

**处理方案**: 为素材库分配新的 `message_type` 枚举值段（如 10-19），在 Java 后端定义 `AssetMessageTypeEnum`。素材库通知直接写入 `t_message`，通过 `receiver_user_type=1` (后管用户) 区分。

素材库通知类型 → message_type 编号映射:
- `upload_complete` → 10
- `share_created` → 11
- `approval_required` → 12
- `tag_recognition_done` → 13
- `permission_request` → 14
- `validity_expiring` → 15

### 1.6 approvals → warm-flow 工作流（替换）

develop 已有完整的 warm-flow 工作流引擎，素材库的审批场景可建模为工作流定义：

**审批场景一：素材权限申请审批**
```
流程定义: asset_permission_approval
节点: 发起申请 → 部门主管审批 → (通过)自动授权 / (拒绝)通知申请人
```

**审批场景二：素材入库审批**  
```
流程定义: asset_entry_approval  
节点: 上传提交 → 素材审核员审批 → (通过)入库 / (拒绝)退回修改
```

**映射关系**:
| 素材库 approvals 字段 | warm-flow 对应 |
|----------------------|---------------|
| `type` (permission_request/asset_approval) | `flow_definition.flow_code` |
| `requester_id` | `flow_instance.create_by` |
| `reviewer_id` | `flow_task` 中分配的审批人 |
| `status` (pending/approved/rejected) | `flow_instance.flow_status` + `flow_his_task.flow_status` |
| `comment` | `flow_his_task.message` |
| `created_at / reviewed_at` | `flow_instance.create_time` / `flow_his_task.update_time` |

**素材库的 `permission_requests` 表和 `approvals` 表都可以删除**，统一用 warm-flow 流程实例承载。

### 1.7 upload_settings / validity_reminders / filter_presets → t_config / t_table_column / t_smart_job（合并）

| 素材库配置表 | 处理方式 |
|------------|---------|
| `upload_settings` | 写入 `t_config`，key=`asset_upload_auto_thumbnail` 等 |
| `validity_reminders` | 写入 `t_config` 存全局默认值 + `t_smart_job` 定时扫描即将过期素材 |
| `filter_presets` | 复用 `t_table_column`，table_name='asset_list' |

`validity_reminders` 的定时提醒逻辑:
1. 在 `t_smart_job` 中注册 `AssetValidityCheckJob`（每日 9:00 执行）
2. 扫描 `assets.valid_until` < NOW() + N 天的素材
3. 写入 `t_message` 通知素材所有者

---

## 二、🆕 必须新增 — 素材库专有表

### 2.1 assets（素材主表）

核心新表，develop 没有对应物。保持原设计字段，调整如下以融入 SmartAdmin 体系：

- `id` → `asset_id` BIGINT AUTO_INCREMENT（遵循 SmartAdmin 命名规范）
- `owner_id` → BIGINT FK → `t_employee.employee_id`
- `created_by` → BIGINT FK → `t_employee.employee_id`
- `department` → `department_id` BIGINT FK → `t_department.department_id`
- 增加 `deleted_flag` TINYINT DEFAULT 0（遵循 SmartAdmin 逻辑删除规范）
- 增加 `create_time` / `update_time` DATETIME（字段名对齐）

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
  brand           VARCHAR(64) COMMENT '品牌',
  model           VARCHAR(64) COMMENT '车型',
  dominant_color  VARCHAR(32) COMMENT '主色调',
  description     TEXT COMMENT '描述',
  permission      VARCHAR(64) COMMENT '权限范围',
  status          VARCHAR(20) NOT NULL DEFAULT 'active' COMMENT '状态',
  group_id        BIGINT COMMENT '所属素材组 FK→t_asset_group',
  owner_id        BIGINT COMMENT '所有者 FK→t_employee',
  department_id   BIGINT COMMENT '所属部门 FK→t_department',
  valid_from      DATETIME COMMENT '生效时间',
  valid_until     DATETIME COMMENT '失效时间',
  version         VARCHAR(64) COMMENT '版本号',
  share_count     INT DEFAULT 0 COMMENT '分享次数',
  download_count  INT DEFAULT 0 COMMENT '下载次数',
  view_count      INT DEFAULT 0 COMMENT '浏览次数',
  created_by      BIGINT COMMENT '创建者 FK→t_employee',
  deleted_flag    TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
  create_time     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  update_time     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_asset_status(status),
  INDEX idx_asset_group(group_id),
  INDEX idx_asset_owner(owner_id),
  INDEX idx_asset_brand_model(brand, model),
  INDEX idx_asset_valid_until(valid_until),
  FULLTEXT INDEX ft_asset_name_desc(name, description)
) COMMENT='素材表';
```

### 2.2 t_asset_tag（素材标签表）

树形结构 + 类型区分（custom/ai/system），与 develop 的 `t_category` 语义不同：

- `t_category` 是通用业务分类（商品分类、文档分类），`category_type` 仅做模块区分
- 素材标签有 AI 自动打标概念、自定义标签、系统标签三类，且需要 `asset_tags` M:N 关联

```sql
CREATE TABLE t_asset_tag (
  tag_id          BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '标签ID',
  tag_name        VARCHAR(128) NOT NULL COMMENT '标签名称',
  parent_id       BIGINT DEFAULT 0 COMMENT '父级标签ID FK→self',
  tag_type        ENUM('custom','ai','system') NOT NULL COMMENT '标签类型',
  description     VARCHAR(512) COMMENT '描述',
  sort_order      INT DEFAULT 0 COMMENT '排序',
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
  create_time     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE INDEX uk_asset_tag(asset_id, tag_id, tag_type)
) COMMENT='素材-标签关联表';
```

### 2.4 t_asset_group（素材组表）

与 `t_category` / `t_department` 类似但语义独立——素材组是素材的组织方式，有收藏/订阅/协作权限等特有功能。

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
  owner_id        BIGINT COMMENT '创建者 FK→t_employee',
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
  employee_id     BIGINT NOT NULL COMMENT 'FK→t_employee',
  is_favorite     TINYINT DEFAULT 0 COMMENT '收藏',
  is_subscribed   TINYINT DEFAULT 0 COMMENT '订阅',
  create_time     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE INDEX uk_group_user(group_id, employee_id)
) COMMENT='用户-素材组收藏/订阅表';
```

### 2.6 t_asset_share（分享记录表）

```sql
CREATE TABLE t_asset_share (
  share_id        BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '分享ID',
  share_name      VARCHAR(256) COMMENT '分享名称',
  creator_id      BIGINT NOT NULL COMMENT 'FK→t_employee',
  target_type     ENUM('group','asset','basket') NOT NULL,
  target_id       TEXT COMMENT '目标ID(basket时多ID逗号分隔)',
  access_level    VARCHAR(64) COMMENT '访问级别',
  share_code      VARCHAR(16) COMMENT '分享码',
  share_link      VARCHAR(2048) COMMENT '分享链接',
  expires_at      DATETIME COMMENT '过期时间',
  visit_count     INT DEFAULT 0,
  view_count      INT DEFAULT 0,
  download_count  INT DEFAULT 0,
  status          VARCHAR(20) DEFAULT 'active',
  shared_at       DATETIME,
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
  status          VARCHAR(20) DEFAULT '生效中',
  access_code     VARCHAR(8) COMMENT '访问密码',
  allowed_file_types JSON COMMENT '允许上传类型',
  deadline        DATE COMMENT '截止日期',
  creator_id      BIGINT COMMENT 'FK→t_employee',
  expires_at      DATETIME,
  deleted_flag    TINYINT NOT NULL DEFAULT 0,
  create_time     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  update_time     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_collect_creator(creator_id),
  INDEX idx_collect_group(group_id)
) COMMENT='素材收集任务表';
```

### 2.8 t_asset_group_member（素材组协作成员）

```sql
CREATE TABLE t_asset_group_member (
  member_id       BIGINT AUTO_INCREMENT PRIMARY KEY,
  group_id        BIGINT NOT NULL COMMENT 'FK→t_asset_group',
  employee_id     BIGINT NOT NULL COMMENT 'FK→t_employee',
  permission      VARCHAR(64) COMMENT '可编辑/删除|仅编辑信息|可下载原文件|仅预览',
  deleted_flag    TINYINT NOT NULL DEFAULT 0,
  create_time     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE INDEX uk_group_member(group_id, employee_id)
) COMMENT='素材组协作成员表';
```

### 2.9 t_asset_comment（素材评论）

```sql
CREATE TABLE t_asset_comment (
  comment_id      BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '评论ID',
  asset_id        BIGINT NOT NULL COMMENT 'FK→t_asset',
  employee_id     BIGINT NOT NULL COMMENT 'FK→t_employee',
  content         TEXT NOT NULL COMMENT '评论内容',
  parent_id       BIGINT DEFAULT NULL COMMENT '回复的评论ID FK→self',
  deleted_flag    TINYINT NOT NULL DEFAULT 0,
  create_time     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_comment_asset(asset_id)
) COMMENT='素材评论表';
```

### 2.10 权限申请表 → warm-flow 流程实例承载

素材库的 `permission_requests` 表不单独建表。在 warm-flow 中为素材权限申请创建一个流程定义 `asset_permission_approval`，申请数据存储在 `flow_instance.variable` JSON 字段中：

```json
{
  "assetId": 12345,
  "requestedPermission": "可编辑/删除",
  "duration": "30天",
  "reason": "需要更新素材的车型信息"
}
```

**需要新建的 warm-flow 流程定义**:
- `asset_permission_approval` — 素材编辑权限申请审批
- `asset_entry_approval` — 素材入库审批（可选，看业务需求）

---

## 三、🧩 AI 图像任务表 — 与素材库的关系

develop 已有的 AI 图像业务表 (`img_task_info`, `img_task_result`) 产出物料与素材库天然关联：

| AI 表 | 与素材库的关系 | 建议 |
|-------|-------------|------|
| `img_task_info` | AI 生成任务 → 产生图像文件 | **新增 `target_group_id` 字段**，关联 `t_asset_group`，生成完成后自动入库 |
| `img_task_result` | 任务结果文件 | **新增 `asset_id` 字段**，生成文件入库后关联素材ID |

这样 AI 生成的图片可以直接"一键入库"到素材库的指定素材组中，打通两个系统的数据流。

---

## 四、素材库项目的调整清单

### 4.1 前端（素材库纯前端项目 → 接入 DPCA-AI 后端）

| 调整项 | 说明 |
|-------|------|
| **登录体系** | 删除 localStorage 的用户模拟，接入 SmartAdmin 登录页 + Sa-Token |
| **用户信息** | 从 `appCore.currentUser` 改为通过 API 获取当前登录员工信息 |
| **API 层** | 新建 `api/asset/` 目录，封装素材库所有接口调用（参考 develop 的 `api/business/` 写法） |
| **ID 类型** | 全部 ID 从字符串 `"asset-xxx"` 改为 bigint 数字 |
| **角色权限** | 页面级权限接入 SmartAdmin 菜单体系；操作级权限接入按钮级 `web_perms` |
| **通知消息** | 页面右上角通知改用 `t_message` API 获取 |
| **系统公告** | 公告看板接入 `t_notice` API |
| **审批流程** | 权限申请改为提交 warm-flow 流程实例 + 审批操作 API |
| **操作日志** | 前端不再本地存日志数组，每次操作通过 API 记录到 `t_operate_log` |
| **数据持久化** | 删除所有 `localStorage` 降级逻辑，全部走后端 API |
| **文件上传** | 接入 develop 已有的 `t_file` 上传接口，上传后关联 `t_asset` |

### 4.2 后端（DPCA-AI Server 需要新增的模块）

| 新增模块 | 内容 |
|---------|------|
| **smart-biz 新增包** | `module/business/asset/` — 素材库业务模块 |
| Controller | `AssetController`, `AssetGroupController`, `AssetTagController`, `AssetShareController`, `AssetCollectController`, `AssetCommentController` |
| Service | 每个 Controller 对应 Service + ServiceImpl |
| DAO/Mapper | MyBatis Plus Mapper 接口（10 张新表的 CRUD） |
| Entity | 10 个实体类（见上表） |
| **工作流定义** | warm-flow 新增 `asset_permission_approval` 流程定义 |
| **定时任务** | `AssetValidityCheckJob` 素材有效期检查 |
| **消息类型** | `t_message` 新增 message_type 枚举值 10-15 |
| **操作日志** | `t_operate_log` 扩展 `module='素材库'` 的日志记录 AOP |
| **菜单权限** | `t_menu` 新增素材库菜单树 + 按钮权限点 |
| **角色** | `t_role` 新增 3 个素材库角色 |
| **字典** | `t_dict_key/value` 新增素材库枚举字典（品牌、车型、色调、权限级别等） |
| **数据库 DDL** | 新增 `03-init-asset-tables.sql` 建表脚本 |

### 4.3 素材库前端代码改造范围

**涉及文件**（按优先级）:

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

## 五、数据库融合后的 ER 关系总图

```
                    ┌─────────────────┐
                    │   t_department  │
                    │   (SmartAdmin)  │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐       ┌──────────────────┐
                    │   t_employee    │       │     t_role       │
                    │   (SmartAdmin)  │◄──────│   (SmartAdmin)   │
                    └──┬──────┬───┬───┘       └──────────────────┘
                       │      │   │
         ┌─────────────┘      │   └──────────────┐
         │                    │                  │
  ┌──────▼──────┐   ┌────────▼────────┐  ┌──────▼──────────┐
  │  t_asset    │   │ t_asset_group   │  │  t_asset_share  │
  │  (NEW)      │   │ (NEW)           │  │  (NEW)          │
  └──┬───┬──┬───┘   └──┬──────┬───────┘  └─────────────────┘
     │   │  │          │      │
     │   │  │  ┌───────┘      └──────────┐
     │   │  │  │                         │
     │   │  │  ▼                         ▼
     │   │  │  ┌──────────────────┐  ┌──────────────────────┐
     │   │  │  │t_asset_group_user│  │t_asset_group_member  │
     │   │  │  │(NEW)             │  │(NEW)                 │
     │   │  │  └──────────────────┘  └──────────────────────┘
     │   │  │
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
│ +action_type │  │   10-15          │  │  _approval flow      │
│ +metadata    │  │                  │  │ +asset_entry_approval│
└──────────────┘  └──────────────────┘  └──────────────────────┘
```

---

## 六、实施建议分阶段

### Phase 1 — 数据库层（DDL）
1. 执行 10 张新表的建表 DDL
2. 执行 `t_employee`、`t_operate_log`、`t_notice`、`t_message` 的 ALTER 扩展
3. 新增字典数据（品牌/车型/色调/权限级别）
4. 新增菜单元数据（素材库左侧导航 + 各个操作按钮权限点）
5. 新增 3 个角色 + 权限分配

### Phase 2 — 后端 API
1. `smart-biz` 新增素材库 CRUD 模块（10 张新表）
2. 操作日志 AOP 切面扩展（module='素材库'）
3. warm-flow 流程定义部署
4. 定时任务注册

### Phase 3 — 前端改造
1. 接入 SmartAdmin 登录体系
2. API 层替换 localStorage
3. 审批/通知/日志接入后端

### Phase 4 — AI 集成
1. `img_task_result` 扩展 asset_id 字段
2. AI 生成结果一键入库功能
3. AI 自动打标（素材上传后调用标签识别服务）
