# DPCA 素材库平台 — 数据库表结构设计

> 基于 `index.html` + 6 个 JS 模块的完整字段梳理，从纯前端 localStorage 升级为关系型数据库。

---

## 目录
1. [核心业务表](#1-核心业务表)
2. [用户与权限表](#2-用户与权限表)
3. [协作与工作流表](#3-协作与工作流表)
4. [消息与通知表](#4-消息与通知表)
5. [系统配置表](#5-系统配置表)
6. [ER 关系图](#6-er-关系图)

---

## 1. 核心业务表

### 1.1 素材表 `assets`

| 字段 | 类型 | 说明 | 示例/枚举值 |
|------|------|------|-------------|
| `id` | VARCHAR(64) PK | 主键 | `"asset-1718523456789-a3f2"` |
| `name` | VARCHAR(512) NOT NULL | 素材名称（不含扩展名） | `"36a7d3e32e9b986cf"` |
| `file_path` | VARCHAR(2048) NOT NULL | 文件存储路径/OSS key | `"/assets/2026/06/asset-01.jpg"` |
| `thumbnail_path` | VARCHAR(2048) | 缩略图路径 | `"/thumbs/2026/06/asset-01.jpg"` |
| `original_name` | VARCHAR(512) | 原始上传文件名 | `"海报_final_v3.jpg"` |
| `format` | VARCHAR(20) | 文件格式（大写） | `JPEG`, `MP4`, `PDF`, `DOCX`, `PPT`, `XLSX`, `ZIP` |
| `mime_type` | VARCHAR(128) | MIME 类型 | `"image/jpeg"`, `"video/mp4"` |
| `media_type` | VARCHAR(20) | 大类 | `图片`, `视频`, `文件` |
| `file_size` | BIGINT UNSIGNED | 文件大小（字节） | `485919` |
| `width` | INT | 像素宽度（图片/视频） | `3000` |
| `height` | INT | 像素高度 | `2000` |
| `aspect_ratio` | DECIMAL(5,3) | 宽高比（计算字段） | `1.500` |
| `duration` | INT | 视频时长（秒） | `NULL` |
| `brand` | VARCHAR(64) | 品牌 | `东风标致`, `东风雪铁龙` |
| `model` | VARCHAR(64) | 车型 | `4008`, `408`, `5008`, `508L`, `凡尔赛C5X`, `天逸` |
| `dominant_color` | VARCHAR(32) | 主色调 | `蓝色`, `红色`, `绿色`, `黄色`, `浅色`, `综合色`, `未识别` |
| `desc` | TEXT | 描述 | `"活动素材"` |
| `permission` | VARCHAR(64) | 权限范围 | `企业内部 - 可下载`, `企业内部 - 可编辑/删除`, `企业外部 - 仅预览` |
| `status` | VARCHAR(20) NOT NULL | 状态 | `active`(已入库), `pending`(待入库), `deleted`(回收站) |
| `group_id` | VARCHAR(64) | 所属素材组 FK→groups | `"test"`, `"all"` |
| `owner_id` | VARCHAR(64) | 所有者 FK→users | — |
| `department` | VARCHAR(128) | 所属部门 | `"采购"`, `"市场部"` |
| `valid_from` | DATETIME | 生效时间 | `"2026-05-26 00:00"` |
| `valid_until` | DATETIME | 失效时间 | `"2027-05-26 23:59"` |
| `version` | VARCHAR(64) | 版本号 | `"202605261783847578"` |
| `share_count` | INT DEFAULT 0 | 分享次数 | `3` |
| `download_count` | INT DEFAULT 0 | 下载次数 | `15` |
| `view_count` | INT DEFAULT 0 | 浏览次数 | `128` |
| `created_by` | VARCHAR(64) | 创建者 FK→users | — |
| `created_at` | DATETIME NOT NULL | 创建时间 | `"2026/05/26 17:38"` |
| `updated_at` | DATETIME | 更新时间 | `"2026/06/17 10:00"` |
| `deleted_at` | DATETIME | 软删除时间 | `NULL`（回收站用） |

**索引**: `idx_assets_status`, `idx_assets_group`, `idx_assets_owner`, `idx_assets_brand_model`, `idx_assets_valid_until`, `idx_assets_created_at`, `idx_assets_deleted_at`, `FULLTEXT idx_assets_name(name, desc)`

---

### 1.2 素材标签关联表 `asset_tags`

素材和标签是多对多关系。

| 字段 | 类型 | 说明 |
|------|------|------|
| `asset_id` | VARCHAR(64) FK→assets | 素材ID |
| `tag_id` | VARCHAR(64) FK→tags | 标签ID |
| `tag_type` | ENUM('custom','ai','system') | 标签来源类型 |

**联合主键**: `(asset_id, tag_id, tag_type)`

---

### 1.3 标签表 `tags`

支持树形结构（业务标签可嵌套）。

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | VARCHAR(64) PK | `"tag-xxx"` |
| `name` | VARCHAR(128) NOT NULL | 标签名称 |
| `parent_id` | VARCHAR(64) FK→tags | 父级标签ID |
| `tag_type` | ENUM('custom','ai','system') | 标签类型 |
| `desc` | VARCHAR(512) | 描述 |
| `sort_order` | INT DEFAULT 0 | 排序 |
| `created_at` | DATETIME | 创建时间 |

**唯一约束**: `(name, tag_type)`

---

### 1.4 素材组表 `groups`

树形结构素材组。

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | VARCHAR(64) PK | `"group-xxx"` |
| `name` | VARCHAR(256) NOT NULL | 素材组名称 |
| `parent_id` | VARCHAR(64) FK→groups | 父级组ID |
| `depth` | INT DEFAULT 0 | 层级深度 |
| `desc` | TEXT | 素材组说明 |
| `is_system` | TINYINT(1) DEFAULT 0 | 系统内置 |
| `status` | VARCHAR(20) DEFAULT 'active' | `active`, `deleted` |
| `asset_count` | INT DEFAULT 0 | 素材数量（冗余缓存） |
| `owner_id` | VARCHAR(64) FK→users | 创建者 |
| `created_at` | DATETIME | 创建时间 |
| `updated_at` | DATETIME | 更新时间 |
| `deleted_at` | DATETIME | 软删除时间 |

---

### 1.5 用户素材组关联表 `user_group_relations`

| 字段 | 类型 | 说明 |
|------|------|------|
| `user_id` | VARCHAR(64) FK→users | — |
| `group_id` | VARCHAR(64) FK→groups | — |
| `is_favorite` | TINYINT(1) DEFAULT 0 | 收藏 |
| `is_subscribed` | TINYINT(1) DEFAULT 0 | 订阅 |

**联合主键**: `(user_id, group_id)`

---

## 2. 用户与权限表

### 2.1 用户表 `users`

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | VARCHAR(64) PK | — |
| `name` | VARCHAR(128) NOT NULL | 显示名称 |
| `username` | VARCHAR(64) UNIQUE | 登录账号 |
| `password_hash` | VARCHAR(256) | 密码哈希 |
| `email` | VARCHAR(256) | 邮箱 |
| `avatar_url` | VARCHAR(512) | 头像 URL |
| `department` | VARCHAR(128) | 部门 |
| `role` | ENUM('admin','editor','viewer') | 角色 |
| `language` | VARCHAR(10) DEFAULT 'zh-CN' | 语言偏好 |
| `status` | VARCHAR(20) DEFAULT 'active' | `active`, `disabled` |
| `created_at` | DATETIME | — |
| `updated_at` | DATETIME | — |

---

### 2.2 权限申请表 `permission_requests`

（对应前端的 `permissionRequest` 功能）

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | VARCHAR(64) PK | — |
| `asset_id` | VARCHAR(64) FK→assets | 目标素材 |
| `requester_id` | VARCHAR(64) FK→users | 申请人 |
| `requested_permission` | VARCHAR(64) | `可编辑/删除`, `仅编辑信息`, `可下载原文件` |
| `duration` | VARCHAR(20) | `7天`, `30天`, `90天`, `长期` |
| `reason` | TEXT | 申请理由 |
| `status` | VARCHAR(20) DEFAULT '待审批' | `待审批`, `已通过`, `已拒绝` |
| `reviewer_id` | VARCHAR(64) FK→users | 审批人 |
| `reviewed_at` | DATETIME | 审批时间 |
| `created_at` | DATETIME | — |

---

### 2.3 用户登录记录 `user_sessions`

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | VARCHAR(64) PK | — |
| `user_id` | VARCHAR(64) FK→users | — |
| `token` | VARCHAR(512) | Bearer Token |
| `ip_address` | VARCHAR(45) | — |
| `user_agent` | VARCHAR(512) | — |
| `expires_at` | DATETIME | — |
| `created_at` | DATETIME | — |

---

## 3. 协作与工作流表

### 3.1 分享记录表 `shares`

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | VARCHAR(64) PK | — |
| `name` | VARCHAR(256) | 分享名称 |
| `creator_id` | VARCHAR(64) FK→users | 分享人 |
| `target_type` | ENUM('group','asset','basket') | 分享目标类型 |
| `target_id` | VARCHAR(2048) | 目标ID（basket 时多个逗号分隔的 asset ID） |
| `access_level` | VARCHAR(64) | `企业内部成员可访问`, `互联网用户无需登录可访问`, `仅指定成员可访问` |
| `share_code` | VARCHAR(16) | 分享码 |
| `share_link` | VARCHAR(2048) | 分享链接 |
| `expires_at` | DATETIME | 过期时间 |
| `visit_count` | INT DEFAULT 0 | 访问人数 |
| `view_count` | INT DEFAULT 0 | 浏览次数 |
| `download_count` | INT DEFAULT 0 | 下载次数 |
| `status` | VARCHAR(20) DEFAULT 'active' | `active`, `expired`, `closed` |
| `shared_at` | DATETIME | — |
| `created_at` | DATETIME | — |

**索引**: `idx_shares_target`, `idx_shares_code`, `idx_shares_expires`

---

### 3.2 收集任务表 `collect_tasks`

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | VARCHAR(64) PK | — |
| `theme` | VARCHAR(256) NOT NULL | 任务主题 |
| `desc` | TEXT | 收集说明 |
| `group_name` | VARCHAR(256) | 存放素材组名称 |
| `group_id` | VARCHAR(64) FK→groups | 关联素材组 |
| `status` | VARCHAR(20) DEFAULT '生效中' | `生效中`, `已失效` |
| `access_code` | VARCHAR(8) | 访问密码 |
| `allowed_file_types` | JSON | 允许上传类型 `["图片","文档","视频"]` |
| `deadline` | DATE | 截止日期 |
| `creator_id` | VARCHAR(64) FK→users | 创建人 |
| `expires_at` | DATETIME | 失效时间 |
| `created_at` | DATETIME | — |
| `updated_at` | DATETIME | — |

---

### 3.3 协作成员表 `group_members`

（素材组级别的协作权限）

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | VARCHAR(64) PK | — |
| `group_id` | VARCHAR(64) FK→groups | — |
| `user_id` | VARCHAR(64) FK→users | — |
| `permission` | VARCHAR(64) | `可编辑/删除`, `仅编辑信息`, `可下载原文件`, `仅预览` |
| `created_at` | DATETIME | — |

**唯一约束**: `(group_id, user_id)`

---

### 3.4 操作日志表 `operation_logs`

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | BIGINT AUTO_INCREMENT PK | — |
| `asset_id` | VARCHAR(64) FK→assets | 关联素材 |
| `user_id` | VARCHAR(64) FK→users | 操作人 |
| `action` | VARCHAR(64) | `upload`, `download`, `share`, `edit`, `delete`, `restore`, `approve`, `view`, `comment`, `tag_merge`, `permission_change` |
| `message` | VARCHAR(1024) | 详细描述 |
| `metadata` | JSON | 附加信息（旧值/新值等） |
| `created_at` | DATETIME | — |

**索引**: `idx_logs_asset`, `idx_logs_user`, `idx_logs_created_at`

---

### 3.5 评论表 `comments`

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | VARCHAR(64) PK | — |
| `asset_id` | VARCHAR(64) FK→assets | — |
| `user_id` | VARCHAR(64) FK→users | — |
| `content` | TEXT | 评论内容 |
| `parent_id` | VARCHAR(64) FK→comments | 回复的评论ID（支持嵌套） |
| `created_at` | DATETIME | — |

---

## 4. 消息与通知表

### 4.1 系统公告表 `system_notices`

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | VARCHAR(64) PK | — |
| `title` | VARCHAR(256) | — |
| `content` | TEXT | — |
| `publisher_id` | VARCHAR(64) FK→users | — |
| `is_active` | TINYINT(1) DEFAULT 1 | — |
| `created_at` | DATETIME | — |
| `expires_at` | DATETIME | — |

---

### 4.2 通知表 `notifications`

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | VARCHAR(64) PK | — |
| `user_id` | VARCHAR(64) FK→users | 目标用户 |
| `type` | VARCHAR(64) | `upload_complete`, `share_created`, `approval_required`, `tag_recognition_done`, `permission_request`, `validity_expiring` |
| `title` | VARCHAR(256) | — |
| `content` | TEXT | — |
| `related_asset_id` | VARCHAR(64) | 关联素材 |
| `is_read` | TINYINT(1) DEFAULT 0 | — |
| `created_at` | DATETIME | — |

**索引**: `idx_notif_user_read`, `idx_notif_created_at`

---

### 4.3 审批表 `approvals`

（对应前端「待处理审批」功能）

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | VARCHAR(64) PK | — |
| `type` | VARCHAR(64) | `permission_request`, `asset_approval`（素材入库审批） |
| `requester_id` | VARCHAR(64) FK→users | 发起人 |
| `reviewer_id` | VARCHAR(64) FK→users | 审批人 |
| `target_id` | VARCHAR(64) | 目标ID（permission_requests.id 或 asset_id） |
| `status` | VARCHAR(20) DEFAULT 'pending' | `pending`, `approved`, `rejected` |
| `comment` | TEXT | 审批意见 |
| `created_at` | DATETIME | — |
| `reviewed_at` | DATETIME | — |

---

## 5. 系统配置表

### 5.1 素材有效期提醒配置 `validity_reminders`

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | VARCHAR(64) PK | — |
| `asset_id` | VARCHAR(64) FK→assets | — |
| `remind_days_before` | INT | 提前 N 天提醒 `7`, `15` |
| `is_enabled` | TINYINT(1) DEFAULT 1 | — |
| `last_reminded_at` | DATETIME | — |

---

### 5.2 上传配置 `upload_settings`

（用户级别默认设置）

| 字段 | 类型 | 说明 |
|------|------|------|
| `user_id` | VARCHAR(64) PK FK→users | — |
| `auto_thumbnail` | TINYINT(1) DEFAULT 1 | 自动生成缩略图 |
| `auto_tag` | TINYINT(1) DEFAULT 1 | 自动提取标签 |
| `default_valid_until` | DATETIME | 默认失效日期 |

---

### 5.3 筛选配置 `filter_presets`

| 字段 | 类型 | 说明 |
|------|------|------|
| `user_id` | VARCHAR(64) PK FK→users | — |
| `visible_filters` | JSON | 可见筛选字段列表 `["素材来源","文件格式","车型",...]` |

---

## 6. ER 关系图

```
┌──────────────┐       ┌──────────────────┐       ┌──────────────┐
│    users     │       │     assets       │       │    groups    │
│──────────────│       │──────────────────│       │──────────────│
│ id (PK)      │◄──┐   │ id (PK)          │   ┌──│ id (PK)      │
│ name         │   │   │ name             │   │  │ name         │
│ username     │   ├───│ owner_id (FK)     │   │  │ parent_id(FK)│──┐
│ role         │   │   │ group_id (FK) ───│───┘  │ status       │  │
│ department   │   │   │ created_by (FK) ──│──┐   │ owner_id(FK)─│──┤
└──────────────┘   │   │ status           │  │   └──────────────┘  │
                   │   │ permission       │  │                     │
┌──────────────┐   │   │ valid_from       │  │   ┌──────────────┐  │
│    tags      │   │   │ valid_until      │  │   │ group_members│  │
│──────────────│   │   │ file_path        │  │   │──────────────│  │
│ id (PK)      │   │   └──────────────────┘  │   │ group_id (FK)│──┘
│ name         │   │            │            │   │ user_id (FK) │──┐
│ parent_id(FK)│─┐ │            │ M:N        │   └──────────────┘  │
│ tag_type     │ │ │   ┌────────┴───────┐   │                     │
└──────────────┘ │ │   │  asset_tags    │   │   ┌──────────────┐  │
                 │ │   │────────────────│   │   │  shares      │  │
┌──────────────┐ │ │   │ asset_id (FK)  │   │   │──────────────│  │
│   comments   │ │ │   │ tag_id (FK) ───│───┘   │ creator_id ──│──┤
│──────────────│ │ │   │ tag_type      │       │ target_type  │  │
│ id (PK)      │ │ │   └───────────────┘       │ target_id    │  │
│ asset_id(FK)─│─┘ │                           └──────────────┘  │
│ user_id (FK) │───┤                                              │
│ content      │   │   ┌──────────────────┐                      │
└──────────────┘   │   │   operation_logs │                      │
                   │   │──────────────────│                      │
┌──────────────┐   │   │ asset_id (FK) ───│──┐                   │
│permission_   │   │   │ user_id (FK) ────│──┤                   │
│   requests   │   │   │ action           │  │                   │
│──────────────│   │   └──────────────────┘  │                   │
│ asset_id(FK)─│───┘                          │                   │
│ requester_id │──┤   ┌──────────────────┐   │                   │
└──────────────┘   │   │  collect_tasks  │   │                   │
                   │   │──────────────────│   │                   │
┌──────────────┐   │   │ creator_id (FK)─│───┤                   │
│ notifications│   │   │ group_id (FK) ──│───┘                   │
│──────────────│   │   └──────────────────┘                      │
│ user_id (FK)─│───┤                                              │
└──────────────┘   │   ┌──────────────────┐                      │
                   │   │user_group_       │                      │
                   │   │  relations       │                      │
                   │   │──────────────────│                      │
                   │   │ user_id (FK) ────│──┐                   │
                   │   │ group_id (FK) ───│──┘                   │
                   │   └──────────────────┘                      │
                   │                                              │
                   └──────────────────────────────────────────────┘
```

---

## 附录：字段来源清单（与前端代码对照）

### Asset 字段来源 (`app-core.js:39-77`, `app-actions.js:78-119`)
| 前端字段 | 数据库字段 | 来源 |
|----------|-----------|------|
| `id` | `id` | 自动生成 |
| `name` | `name` | 上传/编辑 |
| `src` | `file_path` | 上传 |
| `format` | `format` | 自动提取 |
| `mime` | `mime_type` | 文件元数据 |
| `type` | `media_type` | 由 mime 推导 |
| `sizeBytes` | `file_size` | 文件元数据 |
| `width/height` | `width/height` | 图片解析/视频元数据 |
| `desc` | `desc` | 上传/编辑 |
| `brand` | `brand` | 自动识别/编辑 |
| `model` | `model` | 自动识别/编辑 |
| `customTags` | tags (via asset_tags) | 上传/编辑 |
| `aiTags` | tags (via asset_tags) | AI 自动打标 |
| `color` | `dominant_color` | 图片解析 |
| `groupId` | `group_id` | 上传/移动 |
| `owner` | `owner_id` → users | 上传/修改所有者 |
| `department` | `department` | 上传/修改所有者 |
| `permission` | `permission` | 上传/权限修改 |
| `validStart` | `valid_from` | 编辑信息 |
| `validUntil` | `valid_until` | 上传/有效期管理 |
| `status` | `status` | 上传/入库/删除 |
| `share/download/view` | `share_count/download_count/view_count` | 操作计数 |
| `createdAt/updatedAt` | `created_at/updated_at` | 自动记录 |
| `deletedAt` | `deleted_at` | 软删除时记录 |
| `version` | `version` | 上传时生成 |
| `logs` | `operation_logs` 表 | 操作记录 |
| `comments` | `comments` 表 | 评论功能 |
| `permissionRequests` | `permission_requests` 表 | 权限申请 |

### Group 字段来源 (`app-core.js:3-11`, `app-actions.js:1163-1169`)
| 前端字段 | 数据库字段 |
|----------|-----------|
| `id` | `id` |
| `name` | `name` |
| `parentId` | `parent_id` |
| `depth` | `depth` |
| `count` | `asset_count`（计算/缓存） |
| `status` | `status` |
| `system` | `is_system` |
| `favorite` | user_group_relations.is_favorite |
| `subscribed` | user_group_relations.is_subscribed |
| `desc` | `desc` |
| `deletedAt` | `deleted_at` |

### Share 字段来源 (`app-core.js:332-333`, `app-workflows.js:128-203`)
| 前端字段 | 数据库字段 |
|----------|-----------|
| `group`(名称) | `name` |
| `user`(分享人) | `creator_id` |
| `access` | `access_level` |
| `targetType` | `target_type` |
| `targetId` | `target_id` |
| `code` | `share_code` |
| `link` | `share_link` |
| `visits` | `visit_count` |
| `views` | `view_count` |
| `downloads` | `download_count` |
| `sharedAt` | `shared_at` |
| `expiresAt` | `expires_at` |

### CollectTask 字段来源 (`app-core.js:327-331`)
| 前端字段 | 数据库字段 |
|----------|-----------|
| `theme` | `theme` |
| `desc` | `desc` |
| `group`(名称) | `group_name` |
| `status` | `status` |
| `code` | `access_code` |
| `deadline` | `deadline` |
| `creator` | `creator_id` |
| `types` | `allowed_file_types` |
| `createdAt` | `created_at` |
| `expiresAt` | `expires_at` |

---

**共计 17 张表**，覆盖了当前前端所有业务实体及其关系。核心 4 张表（assets / groups / tags / users），辅助 13 张表（关系、日志、协作、消息、配置）。
