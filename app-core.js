const STORAGE_KEY = "dp-material-library-state-v2";

const defaultGroups = [
  { id: "all", name: "全部素材", count: 0, depth: 0, system: true, status: "active", createdBy: "system", createdAt: "2026-01-01T00:00:00", ownedBy: "system", ownedByDept: "", updatedAt: "2026-01-01T00:00:00" },
  { id: "smart", name: "杨文婷的智能内容素材", count: 0, depth: 0, status: "active", createdBy: "yangwt", createdAt: "2026-03-01T09:00:00", ownedBy: "yangwt", ownedByDept: "org-market", updatedAt: "2026-03-01T09:00:00" },
  { id: "redbook", name: "小红书平台素材", count: 3, depth: 0, status: "active", createdBy: "yangwt", createdAt: "2026-05-01T10:00:00", ownedBy: "yangwt", ownedByDept: "org-market", updatedAt: "2026-05-01T10:00:00" },
  { id: "shanghai", name: "上海车展活动素材", count: 1, depth: 0, status: "active", createdBy: "yangwt", createdAt: "2026-06-01T14:00:00", ownedBy: "yangwt", ownedByDept: "org-market", updatedAt: "2026-06-01T14:00:00" },
  { id: "test", name: "凡尔赛素材-测试", count: 2, depth: 0, active: true, status: "active", createdBy: "kerry", createdAt: "2026-05-20T16:00:00", ownedBy: "kerry", ownedByDept: "org-market", updatedAt: "2026-05-20T16:00:00" },
  { id: "versailles", name: "凡尔赛 618车展", count: 2, depth: 1, parentId: "test", status: "active", createdBy: "kerry", createdAt: "2026-05-22T17:00:00", ownedBy: "kerry", ownedByDept: "org-market", updatedAt: "2026-05-22T17:00:00" },
  { id: "aaa", name: "AAA", count: 0, depth: 0, status: "active", createdBy: "kerry", createdAt: "2026-05-25T09:00:00", ownedBy: "kerry", ownedByDept: "org-market", updatedAt: "2026-05-25T09:00:00" },
];

const seedNames = [
  "36a7d3e32e9b986cfcbd57615feb3581",
  "164011bfc089218e4b1198e84b7f5ac0",
  "b5705b3f21c00ce2b51156d9b77cd24d",
  "874a2397b52a68fc1aaa4ce44ca329c0",
  "07a317c06ae89c27a30fbd9b18091fd3",
  "f847ff391e646206fc197c53befa2b6b",
  "f76fcff8eb086627f74396840040aa7c",
  "ea6d963b2033f743fd877c40d80a7d3d",
  "c626bd5f118614e8f93c7238aa06342e",
  "e5966dff97c0892db999dd3e45cc4f6f",
  "c5388969f15a10e49c6e78ef2b97c077",
  "a2f6b7922b18cdcfc56152b6712deb46",
];

const SEED_VALUE_LIST_TREE = [
  { id: "vl_root", code: "root", name: "值列表", type: "root", parentId: null, refId: null, description: "值列表管理根节点", attr1: "", attr2: "", status: "enabled", sortOrder: 0 },
  { id: "vl_dim_matlib", code: "material_lib", name: "素材库筛选", type: "dimension", parentId: "vl_root", refId: null, description: "素材库筛选条件集合", attr1: "", attr2: "", status: "enabled", sortOrder: 0 },
  { id: "vl_dim_matmanage", code: "material_manage", name: "素材管理", type: "dimension", parentId: "vl_root", refId: null, description: "素材管理相关维度", attr1: "", attr2: "", status: "enabled", sortOrder: 1 },
  { id: "vl_dim_manage_status", code: "manage_status", name: "审核状态", type: "dimension", parentId: "vl_dim_matmanage", refId: null, description: "素材审核流程状态", attr1: "", attr2: "", status: "enabled", sortOrder: 1 },
  { id: "vl_dim_subject_type", code: "permission_subject_type", name: "授权主体类型", type: "dimension", parentId: "vl_dim_matmanage", refId: null, description: "ACL授权主体类型", attr1: "", attr2: "", status: "enabled", sortOrder: 2 },
  { id: "vl_st1", code: "user", name: "人员", type: "value", parentId: "vl_dim_subject_type", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 1 },
  { id: "vl_st2", code: "department", name: "部门", type: "value", parentId: "vl_dim_subject_type", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 2 },
  { id: "vl_st3", code: "company", name: "公司", type: "value", parentId: "vl_dim_subject_type", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 3 },
  { id: "vl_dim_group_perm", code: "group_permission_level", name: "素材组权限等级", type: "dimension", parentId: "vl_dim_matmanage", refId: null, description: "素材组权限等级（高包含低）", attr1: "", attr2: "", status: "enabled", sortOrder: 3 },
  { id: "vl_gp1", code: "view", name: "可见", type: "value", parentId: "vl_dim_group_perm", refId: null, description: "仅查看素材组", attr1: "1", attr2: "", status: "enabled", sortOrder: 1 },
  { id: "vl_gp2", code: "download", name: "下载", type: "value", parentId: "vl_dim_group_perm", refId: null, description: "查看+下载", attr1: "2", attr2: "", status: "enabled", sortOrder: 2 },
  { id: "vl_gp3", code: "contribute", name: "素材维护", type: "value", parentId: "vl_dim_group_perm", refId: null, description: "查看+下载+上传/编辑", attr1: "3", attr2: "", status: "enabled", sortOrder: 3 },
  { id: "vl_gp4", code: "manage", name: "组管理", type: "value", parentId: "vl_dim_group_perm", refId: null, description: "完整管理权限", attr1: "4", attr2: "", status: "enabled", sortOrder: 4 },
  { id: "vl_dim_asset_perm", code: "asset_permission_level", name: "素材权限等级", type: "dimension", parentId: "vl_dim_matmanage", refId: null, description: "素材权限等级（正交平行）", attr1: "", attr2: "", status: "enabled", sortOrder: 4 },
  { id: "vl_ap1", code: "view", name: "仅预览", type: "value", parentId: "vl_dim_asset_perm", refId: null, description: "看缩略图、基本信息、进详情页", attr1: "", attr2: "", status: "enabled", sortOrder: 1 },
  { id: "vl_ap2", code: "edit", name: "可编辑", type: "value", parentId: "vl_dim_asset_perm", refId: null, description: "预览+修改元数据/标签/描述", attr1: "", attr2: "", status: "enabled", sortOrder: 2 },
  { id: "vl_ap3", code: "download", name: "可下载", type: "value", parentId: "vl_dim_asset_perm", refId: null, description: "预览+下载原始文件（不含编辑）", attr1: "", attr2: "", status: "enabled", sortOrder: 3 },
  { id: "vl_ap4", code: "full", name: "全部权限", type: "value", parentId: "vl_dim_asset_perm", refId: null, description: "预览+编辑+下载（全套使用权限）", attr1: "", attr2: "", status: "enabled", sortOrder: 4 },
  { id: "vl_dim_share_scope", code: "share_access_scope", name: "分享访问范围", type: "dimension", parentId: "vl_dim_matmanage", refId: null, description: "分享链接访问范围", attr1: "", attr2: "", status: "enabled", sortOrder: 5 },
  { id: "vl_ss1", code: "internal", name: "仅公司内部", type: "value", parentId: "vl_dim_share_scope", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 1 },
  { id: "vl_ss2", code: "public", name: "公开互联网", type: "value", parentId: "vl_dim_share_scope", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 2 },
  { id: "vl_dim_share_perm", code: "share_content_permission", name: "分享内容权限", type: "dimension", parentId: "vl_dim_matmanage", refId: null, description: "分享链接内容权限", attr1: "", attr2: "", status: "enabled", sortOrder: 6 },
  { id: "vl_sp1", code: "view", name: "仅预览", type: "value", parentId: "vl_dim_share_perm", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 1 },
  { id: "vl_sp2", code: "download", name: "可下载", type: "value", parentId: "vl_dim_share_perm", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 2 },
  { id: "vl_dim_request_status", code: "permission_request_status", name: "权限申请状态", type: "dimension", parentId: "vl_dim_matmanage", refId: null, description: "权限申请状态", attr1: "", attr2: "", status: "enabled", sortOrder: 7 },
  { id: "vl_rs1", code: "pending", name: "待审批", type: "value", parentId: "vl_dim_request_status", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 1 },
  { id: "vl_rs2", code: "approved", name: "已通过", type: "value", parentId: "vl_dim_request_status", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 2 },
  { id: "vl_rs3", code: "rejected", name: "已拒绝", type: "value", parentId: "vl_dim_request_status", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 3 },
  { id: "vl_dim_operation_type", code: "operation_action_type", name: "操作类型", type: "dimension", parentId: "vl_dim_matmanage", refId: null, description: "操作日志动作类型", attr1: "", attr2: "", status: "enabled", sortOrder: 8 },
  { id: "vl_ot1", code: "asset.upload", name: "素材上传", type: "value", parentId: "vl_dim_operation_type", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 1 },
  { id: "vl_ot2", code: "asset.edit", name: "素材编辑", type: "value", parentId: "vl_dim_operation_type", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 2 },
  { id: "vl_ot3", code: "asset.delete", name: "素材删除", type: "value", parentId: "vl_dim_operation_type", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 3 },
  { id: "vl_ot4", code: "asset.restore", name: "素材恢复", type: "value", parentId: "vl_dim_operation_type", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 4 },
  { id: "vl_ot5", code: "asset.move", name: "素材移动", type: "value", parentId: "vl_dim_operation_type", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 5 },
  { id: "vl_ot6", code: "asset.download", name: "素材下载", type: "value", parentId: "vl_dim_operation_type", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 6 },
  { id: "vl_ot7", code: "asset.tag", name: "素材打标签", type: "value", parentId: "vl_dim_operation_type", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 7 },
  { id: "vl_ot8", code: "group.acl.add", name: "组权限添加", type: "value", parentId: "vl_dim_operation_type", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 8 },
  { id: "vl_ot9", code: "group.acl.remove", name: "组权限移除", type: "value", parentId: "vl_dim_operation_type", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 9 },
  { id: "vl_ot10", code: "group.acl.update", name: "组权限更新", type: "value", parentId: "vl_dim_operation_type", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 10 },
  { id: "vl_ot11", code: "group.owner.transfer", name: "组所有权转移", type: "value", parentId: "vl_dim_operation_type", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 11 },
  { id: "vl_ot12", code: "asset.acl.add", name: "素材权限添加", type: "value", parentId: "vl_dim_operation_type", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 12 },
  { id: "vl_ot13", code: "asset.acl.remove", name: "素材权限移除", type: "value", parentId: "vl_dim_operation_type", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 13 },
  { id: "vl_ot14", code: "share.create", name: "分享创建", type: "value", parentId: "vl_dim_operation_type", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 14 },
  { id: "vl_ot15", code: "share.revoke", name: "分享撤销", type: "value", parentId: "vl_dim_operation_type", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 15 },
  { id: "vl_ot16", code: "share.update", name: "分享更新", type: "value", parentId: "vl_dim_operation_type", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 16 },
  { id: "vl_ot17", code: "collect.create", name: "收集任务创建", type: "value", parentId: "vl_dim_operation_type", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 17 },
  { id: "vl_ot18", code: "collect.close", name: "收集任务关闭", type: "value", parentId: "vl_dim_operation_type", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 18 },
  { id: "vl_ot19", code: "request.submit", name: "权限申请提交", type: "value", parentId: "vl_dim_operation_type", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 19 },
  { id: "vl_ot20", code: "request.approve", name: "权限申请通过", type: "value", parentId: "vl_dim_operation_type", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 20 },
  { id: "vl_ot21", code: "request.reject", name: "权限申请拒绝", type: "value", parentId: "vl_dim_operation_type", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 21 },
  { id: "vl_ot22", code: "tag.create", name: "标签创建", type: "value", parentId: "vl_dim_operation_type", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 22 },
  { id: "vl_ot23", code: "tag.edit", name: "标签编辑", type: "value", parentId: "vl_dim_operation_type", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 23 },
  { id: "vl_ot24", code: "tag.delete", name: "标签删除", type: "value", parentId: "vl_dim_operation_type", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 24 },
  { id: "vl_ot25", code: "group.create", name: "组创建", type: "value", parentId: "vl_dim_operation_type", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 25 },
  { id: "vl_ot26", code: "group.rename", name: "组重命名", type: "value", parentId: "vl_dim_operation_type", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 26 },
  { id: "vl_ot27", code: "group.move", name: "组移动", type: "value", parentId: "vl_dim_operation_type", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 27 },
  { id: "vl_ot28", code: "group.delete", name: "组删除", type: "value", parentId: "vl_dim_operation_type", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 28 },
  { id: "vl_dim_audit_status", code: "audit_status", name: "审核状态", type: "dimension", parentId: "vl_dim_matmanage", refId: null, description: "素材审核流程状态", attr1: "", attr2: "", status: "enabled", sortOrder: 7 },
  { id: "vl_au1", code: "pending_submit", name: "待提交", type: "value", parentId: "vl_dim_audit_status", refId: null, description: "素材刚刚上传还没有进入素材库", attr1: "1", attr2: "", status: "enabled", sortOrder: 1 },
  { id: "vl_au2", code: "pending_audit", name: "待审核", type: "value", parentId: "vl_dim_audit_status", refId: null, description: "内容已提交，等待机审", attr1: "2", attr2: "", status: "enabled", sortOrder: 2 },
  { id: "vl_au3", code: "machine_auditing", name: "机审中", type: "value", parentId: "vl_dim_audit_status", refId: null, description: "内容正在进行机审", attr1: "3", attr2: "", status: "enabled", sortOrder: 3 },
  { id: "vl_au4", code: "machine_pass", name: "机审通过", type: "value", parentId: "vl_dim_audit_status", refId: null, description: "机审结果为通过，可进入待人审状态", attr1: "4", attr2: "", status: "enabled", sortOrder: 4 },
  { id: "vl_au5", code: "machine_reject", name: "机审拒绝", type: "value", parentId: "vl_dim_audit_status", refId: null, description: "机审结果为拒绝，内容被拦截", attr1: "5", attr2: "", status: "enabled", sortOrder: 5 },
  { id: "vl_au6", code: "pending_human", name: "待人审", type: "value", parentId: "vl_dim_audit_status", refId: null, description: "机审通过，等待人工审核", attr1: "6", attr2: "", status: "enabled", sortOrder: 6 },
  { id: "vl_au7", code: "human_auditing", name: "人审中", type: "value", parentId: "vl_dim_audit_status", refId: null, description: "内容正在进行人工审核", attr1: "7", attr2: "", status: "enabled", sortOrder: 7 },
  { id: "vl_au8", code: "human_pass", name: "人审通过", type: "value", parentId: "vl_dim_audit_status", refId: null, description: "人审结果为通过，素材可以正常使用", attr1: "8", attr2: "", status: "enabled", sortOrder: 8 },
  { id: "vl_au9", code: "human_reject", name: "人审拒绝", type: "value", parentId: "vl_dim_audit_status", refId: null, description: "人审结果为拒绝，内容被拒绝", attr1: "9", attr2: "", status: "enabled", sortOrder: 9 },
  { id: "vl_dim_asset_status_flag", code: "asset_status", name: "素材状态", type: "dimension", parentId: "vl_dim_matmanage", refId: null, description: "素材软删除标记", attr1: "", attr2: "", status: "enabled", sortOrder: 8 },
  { id: "vl_asf1", code: "active", name: "正常", type: "value", parentId: "vl_dim_asset_status_flag", refId: null, description: "素材正常可用", attr1: "", attr2: "", status: "enabled", sortOrder: 1 },
  { id: "vl_asf2", code: "deleted", name: "已删除", type: "value", parentId: "vl_dim_asset_status_flag", refId: null, description: "素材已移入回收站", attr1: "", attr2: "", status: "enabled", sortOrder: 2 },
  { id: "vl_asf3", code: "disabled", name: "已禁用", type: "value", parentId: "vl_dim_asset_status_flag", refId: null, description: "素材已彻底删除，数据库保留但不可见", attr1: "", attr2: "", status: "enabled", sortOrder: 3 },
  { id: "vl_asf4", code: "pending", name: "待审核", type: "value", parentId: "vl_dim_asset_status_flag", refId: null, description: "素材待审核", attr1: "", attr2: "", status: "enabled", sortOrder: 4 },
  { id: "vl_dim_asset_validity", code: "asset_validity", name: "素材有效期状态", type: "dimension", parentId: "vl_dim_matmanage", refId: null, description: "素材有效期状态：待生效/有效/已失效", attr1: "", attr2: "", status: "enabled", sortOrder: 10 },
  { id: "vl_av1", code: "pending", name: "待生效", type: "value", parentId: "vl_dim_asset_validity", refId: null, description: "素材尚未到达生效时间", attr1: "", attr2: "", status: "enabled", sortOrder: 1 },
  { id: "vl_av2", code: "valid", name: "有效", type: "value", parentId: "vl_dim_asset_validity", refId: null, description: "素材在有效期内", attr1: "", attr2: "", status: "enabled", sortOrder: 2 },
  { id: "vl_av3", code: "expired", name: "已失效", type: "value", parentId: "vl_dim_asset_validity", refId: null, description: "素材已超过有效期", attr1: "", attr2: "", status: "enabled", sortOrder: 3 },
  { id: "vl_ms1", code: "ms_pending", name: "待提交", type: "value", parentId: "vl_dim_manage_status", refId: null, description: "素材刚刚上传还没有进入素材库", attr1: "1", attr2: "", status: "enabled", sortOrder: 1 },
  { id: "vl_ms2", code: "ms_pending_audit", name: "待审核", type: "value", parentId: "vl_dim_manage_status", refId: null, description: "内容已提交，等待机审", attr1: "2", attr2: "", status: "enabled", sortOrder: 2 },
  { id: "vl_ms3", code: "ms_machine_auditing", name: "机审中", type: "value", parentId: "vl_dim_manage_status", refId: null, description: "内容正在进行机审", attr1: "3", attr2: "", status: "enabled", sortOrder: 3 },
  { id: "vl_ms4", code: "ms_machine_pass", name: "机审通过", type: "value", parentId: "vl_dim_manage_status", refId: null, description: "机审结果为通过，可进入待人审状态", attr1: "4", attr2: "", status: "enabled", sortOrder: 4 },
  { id: "vl_ms5", code: "ms_machine_reject", name: "机审拒绝", type: "value", parentId: "vl_dim_manage_status", refId: null, description: "机审结果为拒绝，内容被拦截", attr1: "5", attr2: "", status: "enabled", sortOrder: 5 },
  { id: "vl_ms6", code: "ms_human_pending", name: "待人审", type: "value", parentId: "vl_dim_manage_status", refId: null, description: "机审结果为待人工审核，进入人审队列", attr1: "6", attr2: "", status: "enabled", sortOrder: 6 },
  { id: "vl_ms7", code: "ms_human_auditing", name: "人审中", type: "value", parentId: "vl_dim_manage_status", refId: null, description: "内容正在进行人工审核", attr1: "7", attr2: "", status: "enabled", sortOrder: 7 },
  { id: "vl_ms8", code: "ms_human_pass", name: "人审通过", type: "value", parentId: "vl_dim_manage_status", refId: null, description: "人审结果为通过，可进入待发布状态", attr1: "8", attr2: "", status: "enabled", sortOrder: 8 },
  { id: "vl_ms9", code: "ms_human_reject", name: "人审拒绝", type: "value", parentId: "vl_dim_manage_status", refId: null, description: "人审结果为拒绝，内容被驳回", attr1: "9", attr2: "", status: "enabled", sortOrder: 9 },
  { id: "vl_ms10", code: "ms_not_in_library", name: "未入库", type: "value", parentId: "vl_dim_manage_status", refId: null, description: "内容生成环节的内容，用户还未选择让其进入素材库", attr1: "10", attr2: "", status: "enabled", sortOrder: 10 },
  { id: "vl_dim_share_status", code: "share_status", name: "分享状态", type: "dimension", parentId: "vl_dim_matmanage", refId: null, description: "分享链接状态", attr1: "", attr2: "", status: "enabled", sortOrder: 11 },
  { id: "vl_ss1", code: "active", name: "生效中", type: "value", parentId: "vl_dim_share_status", refId: null, description: "分享链接正常可用", attr1: "", attr2: "", status: "enabled", sortOrder: 1 },
  { id: "vl_ss2", code: "revoked", name: "已撤销", type: "value", parentId: "vl_dim_share_status", refId: null, description: "分享链接已被主动撤销", attr1: "", attr2: "", status: "enabled", sortOrder: 2 },
  { id: "vl_ss3", code: "expired", name: "已过期", type: "value", parentId: "vl_dim_share_status", refId: null, description: "分享链接已过期", attr1: "", attr2: "", status: "enabled", sortOrder: 3 },
  { id: "vl_dim_collect_task_status", code: "collect_task_status", name: "收集任务状态", type: "dimension", parentId: "vl_dim_matmanage", refId: null, description: "收集任务状态", attr1: "", attr2: "", status: "enabled", sortOrder: 12 },
  { id: "vl_cts1", code: "active", name: "生效中", type: "value", parentId: "vl_dim_collect_task_status", refId: null, description: "收集任务正常进行中", attr1: "", attr2: "", status: "enabled", sortOrder: 1 },
  { id: "vl_cts2", code: "completed", name: "已完成", type: "value", parentId: "vl_dim_collect_task_status", refId: null, description: "收集任务已完成（所有素材审核通过）", attr1: "", attr2: "", status: "enabled", sortOrder: 2 },
  { id: "vl_cts3", code: "expired", name: "已失效", type: "value", parentId: "vl_dim_collect_task_status", refId: null, description: "收集任务已失效（过期或手动失效）", attr1: "", attr2: "", status: "enabled", sortOrder: 3 },
  { id: "vl_dim_group_status", code: "group_status", name: "素材组状态", type: "dimension", parentId: "vl_dim_matmanage", refId: null, description: "素材组软删除状态", attr1: "", attr2: "", status: "enabled", sortOrder: 13 },
  { id: "vl_gs1", code: "active", name: "正常", type: "value", parentId: "vl_dim_group_status", refId: null, description: "素材组正常可用", attr1: "", attr2: "", status: "enabled", sortOrder: 1 },
  { id: "vl_gs2", code: "deleted", name: "已删除", type: "value", parentId: "vl_dim_group_status", refId: null, description: "素材组已移入回收站", attr1: "", attr2: "", status: "enabled", sortOrder: 2 },
  { id: "vl_gs3", code: "disabled", name: "已禁用", type: "value", parentId: "vl_dim_group_status", refId: null, description: "素材组已彻底删除", attr1: "", attr2: "", status: "enabled", sortOrder: 3 },
  { id: "vl_dim_user_status", code: "user_status", name: "用户状态", type: "dimension", parentId: "vl_dim_matmanage", refId: null, description: "用户账号状态", attr1: "", attr2: "", status: "enabled", sortOrder: 14 },
  { id: "vl_us1", code: "enabled", name: "启用", type: "value", parentId: "vl_dim_user_status", refId: null, description: "用户账号正常启用", attr1: "", attr2: "", status: "enabled", sortOrder: 1 },
  { id: "vl_us2", code: "disabled", name: "停用", type: "value", parentId: "vl_dim_user_status", refId: null, description: "用户账号已停用", attr1: "", attr2: "", status: "enabled", sortOrder: 2 },
  { id: "vl_dim_role_status", code: "role_status", name: "角色状态", type: "dimension", parentId: "vl_dim_matmanage", refId: null, description: "角色状态", attr1: "", attr2: "", status: "enabled", sortOrder: 15 },
  { id: "vl_rs1", code: "enabled", name: "启用", type: "value", parentId: "vl_dim_role_status", refId: null, description: "角色正常启用", attr1: "", attr2: "", status: "enabled", sortOrder: 1 },
  { id: "vl_rs2", code: "disabled", name: "停用", type: "value", parentId: "vl_dim_role_status", refId: null, description: "角色已停用", attr1: "", attr2: "", status: "enabled", sortOrder: 2 },
  { id: "vl_dim_org_status", code: "org_status", name: "组织状态", type: "dimension", parentId: "vl_dim_matmanage", refId: null, description: "组织部门状态", attr1: "", attr2: "", status: "enabled", sortOrder: 16 },
  { id: "vl_os1", code: "enabled", name: "启用", type: "value", parentId: "vl_dim_org_status", refId: null, description: "组织正常启用", attr1: "", attr2: "", status: "enabled", sortOrder: 1 },
  { id: "vl_os2", code: "disabled", name: "停用", type: "value", parentId: "vl_dim_org_status", refId: null, description: "组织已停用", attr1: "", attr2: "", status: "enabled", sortOrder: 2 },
  { id: "vl_dim_brand", code: "brand", name: "品牌", type: "dimension", parentId: "vl_dim_matlib", refId: null, description: "车辆品牌列表", attr1: "", attr2: "", status: "enabled", sortOrder: 1 },
  { id: "vl_b1", code: "peugeot", name: "东风标致", type: "value", parentId: "vl_dim_brand", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 1 },
  { id: "vl_b2", code: "citroen", name: "东风雪铁龙", type: "value", parentId: "vl_dim_brand", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 2 },
  { id: "vl_b3", code: "jeep", name: "Jeep", type: "value", parentId: "vl_dim_brand", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 3 },
  { id: "vl_dim_series", code: "series", name: "车系", type: "dimension", parentId: "vl_dim_matlib", refId: null, description: "车辆系列列表", attr1: "", attr2: "", status: "enabled", sortOrder: 2 },
  { id: "vl_s1", code: "4008-import", name: "4008(进口）", type: "value", parentId: "vl_dim_series", refId: "vl_b1", description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 1 },
  { id: "vl_s2", code: "4008", name: "4008", type: "value", parentId: "vl_dim_series", refId: "vl_b1", description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 2 },
  { id: "vl_s3", code: "5008", name: "5008", type: "value", parentId: "vl_dim_series", refId: "vl_b1", description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 3 },
  { id: "vl_s4", code: "408", name: "408", type: "value", parentId: "vl_dim_series", refId: "vl_b1", description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 4 },
  { id: "vl_s5", code: "508", name: "508", type: "value", parentId: "vl_dim_series", refId: "vl_b1", description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 5 },
  { id: "vl_s6", code: "new-408", name: "新一代408", type: "value", parentId: "vl_dim_series", refId: "vl_b1", description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 6 },
  { id: "vl_s7", code: "sarah-picasso", name: "萨拉毕加索", type: "value", parentId: "vl_dim_series", refId: "vl_b2", description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 7 },
  { id: "vl_s8", code: "c5-aircross", name: "天逸 (C5)AIRCROSS", type: "value", parentId: "vl_dim_series", refId: "vl_b2", description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 8 },
  { id: "vl_s9", code: "elysee", name: "经典爱丽舍", type: "value", parentId: "vl_dim_series", refId: "vl_b2", description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 9 },
  { id: "vl_s10", code: "c6", name: "C6", type: "value", parentId: "vl_dim_series", refId: "vl_b2", description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 10 },
  { id: "vl_s11", code: "c5", name: "C5", type: "value", parentId: "vl_dim_series", refId: "vl_b2", description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 11 },
  { id: "vl_s12", code: "versailles-c5x", name: "凡尔赛C5 X", type: "value", parentId: "vl_dim_series", refId: "vl_b2", description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 12 },
  { id: "vl_dim_model", code: "model", name: "车型", type: "dimension", parentId: "vl_dim_matlib", refId: null, description: "车辆型号列表", attr1: "", attr2: "", status: "enabled", sortOrder: 3 },
  { id: "vl_m1", code: "c5-2.0-manual", name: "C5舒适型2.0L手动档", type: "value", parentId: "vl_dim_model", refId: "vl_s11", description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 1 },
  { id: "vl_m2", code: "c5-2011-2.0-manual", name: "11款C5舒适型2.0L 手动", type: "value", parentId: "vl_dim_model", refId: "vl_s11", description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 2 },
  { id: "vl_m3", code: "versailles-25-n2", name: "凡尔赛C5X 25款 N2", type: "value", parentId: "vl_dim_model", refId: "vl_s12", description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 3 },
  { id: "vl_m4", code: "versailles-24-n2p", name: "凡尔赛 C5X 旅不凡 24款 N2P++", type: "value", parentId: "vl_dim_model", refId: "vl_s12", description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 4 },
  { id: "vl_dim_interior_color", code: "interior_color", name: "内饰色", type: "dimension", parentId: "vl_dim_matlib", refId: null, description: "内饰颜色列表", attr1: "", attr2: "", status: "enabled", sortOrder: 4 },
  { id: "vl_ic1", code: "interior-v3000-xnfr", name: "（V3000 XNFR）新内饰", type: "value", parentId: "vl_dim_interior_color", refId: "vl_m1", description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 1 },
  { id: "vl_ic2", code: "interior-v3000-6bfr", name: "（V3000 6BFR）驼绒灰(天鹅绒)", type: "value", parentId: "vl_dim_interior_color", refId: "vl_m1", description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 2 },
  { id: "vl_ic3", code: "interior-v8fa2-6bfr", name: "（V8FA2 6BFR）驼绒灰(天鹅绒)", type: "value", parentId: "vl_dim_interior_color", refId: "vl_m2", description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 3 },
  { id: "vl_dim_exterior_color", code: "exterior_color", name: "外饰色", type: "dimension", parentId: "vl_dim_matlib", refId: null, description: "外饰颜色列表", attr1: "", attr2: "", status: "enabled", sortOrder: 5 },
  { id: "vl_ec1", code: "exterior-v8fa5-6bfd", name: "（V8FA5 6BFD）浅色天鹅绒", type: "value", parentId: "vl_dim_exterior_color", refId: "vl_m1", description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 1 },
  { id: "vl_ec2", code: "exterior-v8fa5-6bfd-m2", name: "（V8FA5 6BFD）浅色天鹅绒", type: "value", parentId: "vl_dim_exterior_color", refId: "vl_m2", description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 2 },
  { id: "vl_dim_file_format", code: "file_format", name: "文件格式", type: "dimension", parentId: "vl_dim_matlib", refId: null, description: "文件格式分类", attr1: "", attr2: "", status: "enabled", sortOrder: 6 },
  { id: "vl_ff1", code: "image", name: "图片", type: "group", parentId: "vl_dim_file_format", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 1 },
  { id: "vl_ff11", code: "jpg", name: "JPG", type: "value", parentId: "vl_ff1", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 1 },
  { id: "vl_ff12", code: "jpeg", name: "JPEG", type: "value", parentId: "vl_ff1", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 2 },
  { id: "vl_ff13", code: "png", name: "PNG", type: "value", parentId: "vl_ff1", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 3 },
  { id: "vl_ff14", code: "tif", name: "TIF", type: "value", parentId: "vl_ff1", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 4 },
  { id: "vl_ff15", code: "tiff", name: "TIFF", type: "value", parentId: "vl_ff1", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 5 },
  { id: "vl_ff16", code: "webp", name: "WEBP", type: "value", parentId: "vl_ff1", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 6 },
  { id: "vl_ff17", code: "gif", name: "GIF", type: "value", parentId: "vl_ff1", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 7 },
  { id: "vl_ff18", code: "svg", name: "SVG", type: "value", parentId: "vl_ff1", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 8 },
  { id: "vl_ff19", code: "bmp", name: "BMP", type: "value", parentId: "vl_ff1", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 9 },
  { id: "vl_ff20", code: "heic", name: "HEIC", type: "value", parentId: "vl_ff1", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 10 },
  { id: "vl_ff21", code: "pic", name: "PIC", type: "value", parentId: "vl_ff1", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 11 },
  { id: "vl_ff2", code: "video", name: "视频", type: "group", parentId: "vl_dim_file_format", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 2 },
  { id: "vl_ff22", code: "mp4", name: "MP4", type: "value", parentId: "vl_ff2", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 1 },
  { id: "vl_ff23", code: "mov", name: "MOV", type: "value", parentId: "vl_ff2", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 2 },
  { id: "vl_ff24", code: "m4v", name: "M4V", type: "value", parentId: "vl_ff2", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 3 },
  { id: "vl_ff25", code: "avi", name: "AVI", type: "value", parentId: "vl_ff2", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 4 },
  { id: "vl_ff26", code: "mkv", name: "MKV", type: "value", parentId: "vl_ff2", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 5 },
  { id: "vl_ff27", code: "rmvb", name: "RMVB", type: "value", parentId: "vl_ff2", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 6 },
  { id: "vl_ff28", code: "rm", name: "RM", type: "value", parentId: "vl_ff2", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 7 },
  { id: "vl_ff29", code: "mpg", name: "MPG", type: "value", parentId: "vl_ff2", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 8 },
  { id: "vl_ff30", code: "flv", name: "FLV", type: "value", parentId: "vl_ff2", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 9 },
  { id: "vl_ff31", code: "ts", name: "TS", type: "value", parentId: "vl_ff2", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 10 },
  { id: "vl_ff32", code: "aep", name: "AEP", type: "value", parentId: "vl_ff2", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 11 },
  { id: "vl_ff3", code: "document", name: "文档", type: "group", parentId: "vl_dim_file_format", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 3 },
  { id: "vl_ff33", code: "pdf", name: "PDF", type: "value", parentId: "vl_ff3", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 1 },
  { id: "vl_ff34", code: "doc", name: "DOC", type: "value", parentId: "vl_ff3", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 2 },
  { id: "vl_ff35", code: "docx", name: "DOCX", type: "value", parentId: "vl_ff3", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 3 },
  { id: "vl_ff36", code: "ppt", name: "PPT", type: "value", parentId: "vl_ff3", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 4 },
  { id: "vl_ff37", code: "pptx", name: "PPTX", type: "value", parentId: "vl_ff3", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 5 },
  { id: "vl_ff38", code: "wps", name: "WPS", type: "value", parentId: "vl_ff3", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 6 },
  { id: "vl_ff39", code: "pages", name: "PAGES", type: "value", parentId: "vl_ff3", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 7 },
  { id: "vl_ff40", code: "key", name: "KEY", type: "value", parentId: "vl_ff3", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 8 },
  { id: "vl_ff41", code: "txt", name: "TXT", type: "value", parentId: "vl_ff3", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 9 },
  { id: "vl_ff4", code: "design", name: "设计源文件", type: "group", parentId: "vl_dim_file_format", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 4 },
  { id: "vl_ff42", code: "psd", name: "PSD", type: "value", parentId: "vl_ff4", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 1 },
  { id: "vl_ff43", code: "ai", name: "AI", type: "value", parentId: "vl_ff4", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 2 },
  { id: "vl_ff44", code: "psb", name: "PSB", type: "value", parentId: "vl_ff4", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 3 },
  { id: "vl_ff45", code: "sketch", name: "SKETCH", type: "value", parentId: "vl_ff4", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 4 },
  { id: "vl_ff46", code: "c4d", name: "C4D", type: "value", parentId: "vl_ff4", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 5 },
  { id: "vl_ff47", code: "ps", name: "PS", type: "value", parentId: "vl_ff4", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 6 },
  { id: "vl_ff48", code: "coreldraw", name: "CORELDRAW", type: "value", parentId: "vl_ff4", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 7 },
  { id: "vl_ff49", code: "eps", name: "EPS", type: "value", parentId: "vl_ff4", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 8 },
  { id: "vl_ff5", code: "text", name: "纯文本", type: "group", parentId: "vl_dim_file_format", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 5 },
  { id: "vl_ff50", code: "text-file", name: "TEXT", type: "value", parentId: "vl_ff5", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 1 },
  { id: "vl_ff6", code: "spreadsheet", name: "表格", type: "group", parentId: "vl_dim_file_format", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 6 },
  { id: "vl_ff51", code: "xls", name: "XLS", type: "value", parentId: "vl_ff6", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 1 },
  { id: "vl_ff52", code: "xlsx", name: "XLSX", type: "value", parentId: "vl_ff6", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 2 },
  { id: "vl_ff53", code: "csv", name: "CSV", type: "value", parentId: "vl_ff6", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 3 },
  { id: "vl_ff54", code: "numbers", name: "NUMBERS", type: "value", parentId: "vl_ff6", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 4 },
  { id: "vl_ff7", code: "font", name: "字体文件", type: "group", parentId: "vl_dim_file_format", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 7 },
  { id: "vl_ff55", code: "ttf", name: "TTF", type: "value", parentId: "vl_ff7", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 1 },
  { id: "vl_ff56", code: "ttc", name: "TTC", type: "value", parentId: "vl_ff7", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 2 },
  { id: "vl_ff57", code: "otf", name: "OTF", type: "value", parentId: "vl_ff7", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 3 },
  { id: "vl_ff8", code: "audio", name: "音频", type: "group", parentId: "vl_dim_file_format", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 8 },
  { id: "vl_ff58", code: "mp3", name: "MP3", type: "value", parentId: "vl_ff8", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 1 },
  { id: "vl_ff59", code: "m4a", name: "M4A", type: "value", parentId: "vl_ff8", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 2 },
  { id: "vl_ff60", code: "wav", name: "WAV", type: "value", parentId: "vl_ff8", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 3 },
  { id: "vl_ff9", code: "archive", name: "压缩包", type: "group", parentId: "vl_dim_file_format", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 9 },
  { id: "vl_ff61", code: "zip", name: "ZIP", type: "value", parentId: "vl_ff9", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 1 },
  { id: "vl_ff62", code: "rar", name: "RAR", type: "value", parentId: "vl_ff9", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 2 },
  { id: "vl_ff63", code: "7z", name: "7Z", type: "value", parentId: "vl_ff9", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 3 },
  { id: "vl_ff64", code: "gz", name: "GZ", type: "value", parentId: "vl_ff9", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 4 },
  { id: "vl_ff10", code: "3d-model", name: "三维模型文件", type: "group", parentId: "vl_dim_file_format", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 10 },
  { id: "vl_ff65", code: "3dm", name: "3DM", type: "value", parentId: "vl_ff10", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 1 },
  { id: "vl_ff66", code: "3ds", name: "3DS", type: "value", parentId: "vl_ff10", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 2 },
  { id: "vl_ff67", code: "3mf", name: "3MF", type: "value", parentId: "vl_ff10", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 3 },
  { id: "vl_ff68", code: "amf", name: "AMF", type: "value", parentId: "vl_ff10", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 4 },
  { id: "vl_ff69", code: "bim", name: "BIM", type: "value", parentId: "vl_ff10", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 5 },
  { id: "vl_ff70", code: "brep", name: "BREP", type: "value", parentId: "vl_ff10", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 6 },
  { id: "vl_ff71", code: "dae", name: "DAE", type: "value", parentId: "vl_ff10", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 7 },
  { id: "vl_ff72", code: "fbx", name: "FBX", type: "value", parentId: "vl_ff10", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 8 },
  { id: "vl_ff73", code: "fcstd", name: "FCSTD", type: "value", parentId: "vl_ff10", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 9 },
  { id: "vl_ff74", code: "ifc", name: "IFC", type: "value", parentId: "vl_ff10", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 10 },
  { id: "vl_ff75", code: "iges", name: "IGES", type: "value", parentId: "vl_ff10", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 11 },
  { id: "vl_ff76", code: "step", name: "STEP", type: "value", parentId: "vl_ff10", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 12 },
  { id: "vl_ff77", code: "stl", name: "STL", type: "value", parentId: "vl_ff10", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 13 },
  { id: "vl_ff78", code: "obj", name: "OBJ", type: "value", parentId: "vl_ff10", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 14 },
  { id: "vl_ff79", code: "off", name: "OFF", type: "value", parentId: "vl_ff10", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 15 },
  { id: "vl_ff80", code: "ply", name: "PLY", type: "value", parentId: "vl_ff10", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 16 },
  { id: "vl_dim_source", code: "source", name: "素材来源", type: "dimension", parentId: "vl_dim_matlib", refId: null, description: "素材来源类型", attr1: "", attr2: "", status: "enabled", sortOrder: 7 },
  { id: "vl_src1", code: "internal", name: "内部上传", type: "value", parentId: "vl_dim_source", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 1 },
  { id: "vl_src2", code: "ai-generated", name: "AI生成", type: "value", parentId: "vl_dim_source", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 2 },
  { id: "vl_src3", code: "external", name: "外部导入", type: "value", parentId: "vl_dim_source", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 3 },
  { id: "vl_dim_permission_scope", code: "permission_scope", name: "权限范围", type: "dimension", parentId: "vl_dim_matlib", refId: null, description: "素材权限范围", attr1: "", attr2: "", status: "enabled", sortOrder: 8 },
  { id: "vl_ps1", code: "downloadable", name: "可下载", type: "value", parentId: "vl_dim_permission_scope", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 1 },
  { id: "vl_ps2", code: "shareable", name: "可分享", type: "value", parentId: "vl_dim_permission_scope", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 2 },
  { id: "vl_dim_asset_validity_filter", code: "asset_validity_filter", name: "素材有效期筛选", type: "dimension", parentId: "vl_dim_matlib", refId: null, description: "素材有效期状态筛选", attr1: "", attr2: "", status: "enabled", sortOrder: 9 },
  { id: "vl_avf1", code: "valid", name: "有效", type: "value", parentId: "vl_dim_asset_validity_filter", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 1 },
  { id: "vl_avf2", code: "expired", name: "已失效", type: "value", parentId: "vl_dim_asset_validity_filter", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 2 },
  { id: "vl_avf3", code: "pending", name: "待生效", type: "value", parentId: "vl_dim_asset_validity_filter", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 3 },
  { id: "vl_dim_aspect_ratio", code: "aspect_ratio", name: "宽高比", type: "dimension", parentId: "vl_dim_matlib", refId: null, description: "图片/视频宽高比", attr1: "", attr2: "", status: "enabled", sortOrder: 10 },
  { id: "vl_ar1", code: "1:1", name: "1:1", type: "value", parentId: "vl_dim_aspect_ratio", refId: null, description: "", attr1: "1.0", attr2: "", status: "enabled", sortOrder: 1 },
  { id: "vl_ar2", code: "3:4", name: "3:4", type: "value", parentId: "vl_dim_aspect_ratio", refId: null, description: "", attr1: "0.75", attr2: "", status: "enabled", sortOrder: 2 },
  { id: "vl_ar3", code: "9:16", name: "9:16", type: "value", parentId: "vl_dim_aspect_ratio", refId: null, description: "", attr1: "0.5625", attr2: "", status: "enabled", sortOrder: 3 },
  { id: "vl_ar4", code: "4:3", name: "4:3", type: "value", parentId: "vl_dim_aspect_ratio", refId: null, description: "", attr1: "1.333", attr2: "", status: "enabled", sortOrder: 4 },
  { id: "vl_ar5", code: "3:2", name: "3:2", type: "value", parentId: "vl_dim_aspect_ratio", refId: null, description: "", attr1: "1.5", attr2: "", status: "enabled", sortOrder: 5 },
  { id: "vl_ar6", code: "16:9", name: "16:9", type: "value", parentId: "vl_dim_aspect_ratio", refId: null, description: "", attr1: "1.778", attr2: "", status: "enabled", sortOrder: 6 },
  { id: "vl_ar7", code: "21:9", name: "21:9", type: "value", parentId: "vl_dim_aspect_ratio", refId: null, description: "", attr1: "2.333", attr2: "", status: "enabled", sortOrder: 7 },
  { id: "vl_dim_file_size", code: "file_size", name: "文件大小", type: "dimension", parentId: "vl_dim_matlib", refId: null, description: "文件大小范围", attr1: "", attr2: "", status: "enabled", sortOrder: 11 },
  { id: "vl_fs1", code: "lt5", name: "<5MB", type: "value", parentId: "vl_dim_file_size", refId: null, description: "", attr1: "0", attr2: "5242880", status: "enabled", sortOrder: 1 },
  { id: "vl_fs2", code: "5to10", name: "5MB～10MB", type: "value", parentId: "vl_dim_file_size", refId: null, description: "", attr1: "5242880", attr2: "10485760", status: "enabled", sortOrder: 2 },
  { id: "vl_fs3", code: "10to50", name: "10MB～50MB", type: "value", parentId: "vl_dim_file_size", refId: null, description: "", attr1: "10485760", attr2: "52428800", status: "enabled", sortOrder: 3 },
  { id: "vl_fs4", code: "gt50", name: ">50MB", type: "value", parentId: "vl_dim_file_size", refId: null, description: "", attr1: "52428800", attr2: "", status: "enabled", sortOrder: 4 },
];

function getTreeChildren(parentId = null) {
  return (db.valueListTree || []).filter(n => n.parentId === parentId && n.status === "enabled")
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
}
function getTreeNodeById(id) {
  return (db.valueListTree || []).find(n => n.id === id);
}
function getTreeNodeByCode(code, parentDimCode) {
  if (!parentDimCode) return (db.valueListTree || []).find(n => n.code === code);
  const parentDim = getTreeNodeByCode(parentDimCode);
  if (!parentDim) return (db.valueListTree || []).find(n => n.code === code);
  return (db.valueListTree || []).find(n => n.code === code && n.parentId === parentDim.id);
}
function getDimensionNodes(parentDimId) {
  const parentId = parentDimId || getTreeNodeByCode("material_lib")?.id;
  return (db.valueListTree || []).filter(n => n.parentId === parentId && n.type === "dimension" && n.status === "enabled")
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
}
function buildFilterTree(dimCode, parentId = null) {
  const dim = getTreeNodeByCode(dimCode);
  if (!dim) return [];
  const pid = parentId !== null ? parentId : dim.id;
  return getTreeChildren(pid).map(n => ({
    name: n.name,
    selectable: n.type === "value",
    children: buildFilterTree(dimCode, n.id)
  }));
}
function getAllLeafValues(dimCode) {
  const dim = getTreeNodeByCode(dimCode);
  if (!dim) return [];
  const result = [];
  const collect = (nodeId) => {
    const children = getTreeChildren(nodeId);
    children.forEach(c => {
      if (c.type === "value") result.push(c);
      else collect(c.id);
    });
  };
  collect(dim.id);
  return result;
}

function getAssetStatusConfig() {
  const statusValues = getAllLeafValues("asset_status");
  return {
    active: statusValues.find(v => v.code === "active")?.code || "active",
    deleted: statusValues.find(v => v.code === "deleted")?.code || "deleted",
    disabled: statusValues.find(v => v.code === "disabled")?.code || "disabled",
    pending: statusValues.find(v => v.code === "pending")?.code || "pending",
    deletedCodes: statusValues.filter(v => v.code === "deleted" || v.code === "disabled").map(v => v.code),
    activeCodes: statusValues.filter(v => v.code === "active").map(v => v.code),
    pendingCodes: statusValues.filter(v => v.code === "pending").map(v => v.code),
  };
}

function getAuditStatusConfig() {
  const auditValues = getAllLeafValues("audit_status");
  return {
    pendingSubmit: auditValues.find(v => v.code === "pending_submit")?.code || "pending_submit",
    pendingAudit: auditValues.find(v => v.code === "pending_audit")?.code || "pending_audit",
    machineAuditing: auditValues.find(v => v.code === "machine_auditing")?.code || "machine_auditing",
    machinePass: auditValues.find(v => v.code === "machine_pass")?.code || "machine_pass",
    machineReject: auditValues.find(v => v.code === "machine_reject")?.code || "machine_reject",
    pendingHuman: auditValues.find(v => v.code === "pending_human")?.code || "pending_human",
    humanAuditing: auditValues.find(v => v.code === "human_auditing")?.code || "human_auditing",
    humanPass: auditValues.find(v => v.code === "human_pass")?.code || "human_pass",
    humanReject: auditValues.find(v => v.code === "human_reject")?.code || "human_reject",
    allCodes: auditValues.map(v => v.code),
    pendingCodes: ["pending_submit", "pending_audit", "pending_human"],
    auditingCodes: ["machine_auditing", "human_auditing"],
    passCodes: ["machine_pass", "human_pass"],
    rejectCodes: ["machine_reject", "human_reject"],
    finalPassCode: "human_pass",
    getCodeByNumber: (num) => auditValues.find(v => v.attr1 === String(num))?.code || "",
    getNumberByCode: (code) => auditValues.find(v => v.code === code)?.attr1 || "",
  };
}

function getValidityStatusConfig() {
  const validityValues = getAllLeafValues("asset_validity");
  return {
    valid: validityValues.find(v => v.code === "valid")?.code || "valid",
    expired: validityValues.find(v => v.code === "expired")?.code || "expired",
    pending: validityValues.find(v => v.code === "pending")?.code || "pending",
    codes: validityValues.map(v => v.code),
    names: validityValues.map(v => v.name),
  };
}
function getShareStatusConfig() {
  const shareValues = getAllLeafValues("share_status");
  return {
    active: shareValues.find(v => v.code === "active")?.code || "active",
    revoked: shareValues.find(v => v.code === "revoked")?.code || "revoked",
    expired: shareValues.find(v => v.code === "expired")?.code || "expired",
    activeCodes: ["active"],
    inactiveCodes: ["revoked", "expired"],
  };
}
function getCollectTaskStatusConfig() {
  const taskValues = getAllLeafValues("collect_task_status");
  return {
    active: taskValues.find(v => v.code === "active")?.code || "active",
    completed: taskValues.find(v => v.code === "completed")?.code || "completed",
    expired: taskValues.find(v => v.code === "expired")?.code || "expired",
    activeCodes: ["active"],
    inactiveCodes: ["completed", "expired"],
  };
}
function getPermissionRequestStatusConfig() {
  const requestValues = getAllLeafValues("permission_request_status");
  return {
    pending: requestValues.find(v => v.code === "pending")?.code || "pending",
    approved: requestValues.find(v => v.code === "approved")?.code || "approved",
    rejected: requestValues.find(v => v.code === "rejected")?.code || "rejected",
  };
}
function getGroupStatusConfig() {
  const groupValues = getAllLeafValues("group_status");
  return {
    active: groupValues.find(v => v.code === "active")?.code || "active",
    deleted: groupValues.find(v => v.code === "deleted")?.code || "deleted",
    disabled: groupValues.find(v => v.code === "disabled")?.code || "disabled",
    deletedCodes: ["deleted", "disabled"],
    activeCodes: ["active"],
  };
}
function getUserStatusConfig() {
  const userValues = getAllLeafValues("user_status");
  return {
    enabled: userValues.find(v => v.code === "enabled")?.code || "enabled",
    disabled: userValues.find(v => v.code === "disabled")?.code || "disabled",
    enabledCodes: ["enabled"],
    disabledCodes: ["disabled"],
  };
}
function getRoleStatusConfig() {
  const roleValues = getAllLeafValues("role_status");
  return {
    enabled: roleValues.find(v => v.code === "enabled")?.code || "enabled",
    disabled: roleValues.find(v => v.code === "disabled")?.code || "disabled",
    enabledCodes: ["enabled"],
    disabledCodes: ["disabled"],
  };
}
function getOrgStatusConfig() {
  const orgValues = getAllLeafValues("org_status");
  return {
    enabled: orgValues.find(v => v.code === "enabled")?.code || "enabled",
    disabled: orgValues.find(v => v.code === "disabled")?.code || "disabled",
    enabledCodes: ["enabled"],
    disabledCodes: ["disabled"],
  };
}
function getAllUploadAccept() {
  const leaves = getAllLeafValues("file_format");
  return leaves.map(l => `.${l.code}`).join(",");
}
function getAllCollectTaskTypes() {
  const dim = getTreeNodeByCode("file_format");
  if (!dim) return [];
  return getTreeChildren(dim.id).filter(n => n.type === "group").map(n => n.name);
}
function getVehicleModels() {
  return getAllLeafValues("model").map(n => n.name);
}
function getFileFormatCategoriesFromTree() {
  const dim = getTreeNodeByCode("file_format");
  if (!dim) return {};
  const groups = getTreeChildren(dim.id).filter(n => n.type === "group");
  const allLeaves = getAllLeafValues("file_format");
  const result = {};
  groups.forEach(g => {
    const formats = allLeaves.filter(f => {
      let parent = getTreeNodeById(f.parentId);
      while (parent) {
        if (parent.id === g.id) return true;
        parent = getTreeNodeById(parent.parentId);
      }
      return false;
    });
    result[g.name] = formats.map(f => f.name);
  });
  return result;
}
function getAspectRatiosFromTree() {
  return getAllLeafValues("aspect_ratio").map(n => ({
    label: n.name,
    value: parseFloat(n.attr1) || 0
  }));
}
function getAllowedUploadFormats() {
  return getAllLeafValues("file_format").map(n => n.name);
}
function getFilterLabels() {
  const dims = getDimensionNodes();
  return dims.map(d => d.name);
}
function getConfigurableFilters() {
  return [...new Set([...getFilterLabels(), "宽高比", "文件大小", "上传时间", "素材失效日"])];
}

function getExpireDate(daysFromNow) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}T23:59:00`;
}

const seedAssets = seedNames.map((name, index) => {
  const expireDays = [365, 30, 90, 7, 180, 365, 30, 90, 7, 180, 365, 30][index];
  const expireDate = getExpireDate(expireDays);
  return ({
    id: `seed-${index + 108}`,
    name,
    src: `assets/asset-${String(index + 1).padStart(2, "0")}.jpg`,
    format: index < 5 ? "JPEG" : "MP4",
    mime: "image/jpeg",
    type: index < 5 ? "图片" : "视频",
    sizeBytes: [485919, 160420, 101468, 99963, 98928, 1730150, 1478492, 1960837, 1290000, 1373634, 3565158, 1436549][index],
    width: index < 5 ? 3000 : 1080,
    height: index < 5 ? 2000 : 1920,
    desc: index === 0 ? "活动素材" : "",
    brand: index % 3 === 0 ? "东风标致" : "东风雪铁龙",
    series: index % 3 === 0 ? "4008" : "天逸 (C5)AIRCROSS",
    model: SEED_VALUE_LIST_TREE.filter(n => n.parentId === "vl_dim_model" && n.status !== "deleted").sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))[index % 5]?.name || "",
    interiorColors: index < 5 ? ["（V3000 XNFR）新内饰"] : ["（V8FA5 6BFD）浅色天鹅绒"],
    exteriorColors: index < 5 ? ["（VQYB 6BFD）珠光白"] : ["（VQYB 6BFD）珠光白"],
    customTags: [["试驾活动"], ["车展物料","618促销"], ["产品宣传","自媒体推广"], ["经销商素材"], ["KOL合作"], ["车展物料"], ["618促销","自媒体推广"], ["产品宣传"], ["KOL合作","试驾活动"], ["经销商素材","售后服务"], ["国庆活动"], ["车展物料","618促销"]][index] || [],
    aiTags: [["汽车","户外场景","城市街道","品牌Logo"], ["产品特写","外观展示","汽车"], ["汽车","高清锐利","外观展示"], ["户外场景","自然风光","汽车"], ["汽车","内饰展示","胶片颗粒感"], ["人物","活动","汽车"], ["汽车","赛道","高清锐利"], ["户外场景","城市街道","横版"], ["产品特写","灯光细节","竖版"], ["汽车","外观展示","柔光朦胧"], ["人物","品牌Logo","活动"], ["汽车","内饰展示","产品特写"]][index] || [],
    groupId: index < 2 ? "test" : index < 5 ? "redbook" : "all",
    owner: "kerry",
    department: "org-market",
    creator: "kerry",
    lastUpdate: "kerry",
    asset_source: "internal",
    collect_id: "collect-seed",
    collect_link: "",
    permission: "企业内部 - 可下载",
    validUntil: expireDate,
    validUntilDate: expireDate,
    validStart: "2026-05-26T00:00:00",
    status: "active",
    share: index % 2,
    download: index % 3,
    view: [0, 3, 3, 2, 0, 24, 9, 11, 8, 6, 5, 5][index],
    createdAt: "2026-05-26T17:38:00",
    updatedAt: "2026-05-26T17:38:00",
    createdBy: "kerry",
    ownedBy: "kerry",
    ownedByDept: "org-market",
    version: `2026052${index < 5 ? 5 : 6}16${String(1783847578 + index * 913951).slice(0, 8)}`,
    logs: [
      { operator: "kerry", operatorDept: "org-market", action: "asset.upload", actionName: "上传素材", detail: `上传了素材 "${name}"`, createdAt: "2026-05-26T17:38:00" },
      { operator: "kerry", operatorDept: "org-market", action: "asset.edit", actionName: "编辑素材", detail: "操作入库", createdAt: "2026-05-26T17:38:00" },
      { operator: "kerry", operatorDept: "org-market", action: "asset.download", actionName: "下载素材", detail: `下载了素材 "${name}"`, createdAt: "2026-05-26T17:38:00" },
    ],
  });
});

const seedTags = [
  // ===== 业务标签 (tagType=1, 支持多层级) =====

  { id: "tag-biz-001", tagName: "营销活动", tagCode: "marketing", tagType: 1, parentId: 0, level: 0, aiSource: 0, aiRecognitionEnabled: 1, isVisible: 1, status: 1, sortOrder: 1, description: "各类营销活动素材", createdBy: "yangwt", createdAt: "2026-01-01T09:00:00", updatedAt: "2026-05-01T10:00:00", ownedBy: "yangwt", ownedByDept: "org-market" },
  { id: "tag-biz-002", tagName: "车展物料", tagCode: "motor_show", tagType: 1, parentId: "营销活动", level: 1, aiSource: 0, aiRecognitionEnabled: 1, isVisible: 1, status: 1, sortOrder: 2, description: "各车展现场展示及宣传物料", createdBy: "yangwt", createdAt: "2026-02-20T10:15:00", updatedAt: "2026-05-18T16:30:00", ownedBy: "yangwt", ownedByDept: "org-market" },
  { id: "tag-biz-003", tagName: "产品宣传", tagCode: "product_promo", tagType: 1, parentId: 0, level: 0, aiSource: 0, aiRecognitionEnabled: 1, isVisible: 1, status: 1, sortOrder: 3, description: "车型产品力宣传物料", createdBy: "kerry", createdAt: "2026-04-01T08:00:00", updatedAt: "2026-05-22T11:00:00", ownedBy: "kerry", ownedByDept: "org-market" },
  { id: "tag-biz-004", tagName: "经销商素材", tagCode: "dealer", tagType: 1, parentId: 0, level: 0, aiSource: 0, aiRecognitionEnabled: 1, isVisible: 1, status: 1, sortOrder: 4, description: "经销商渠道门店推广素材", createdBy: "yangwt", createdAt: "2026-01-10T14:00:00", updatedAt: "2026-04-15T09:00:00", ownedBy: "yangwt", ownedByDept: "org-market" },
  { id: "tag-biz-005", tagName: "618促销", tagCode: "promo_618", tagType: 1, parentId: "营销活动", level: 1, aiSource: 0, aiRecognitionEnabled: 1, isVisible: 1, status: 1, sortOrder: 5, description: "618电商大促相关素材", createdBy: "kerry", createdAt: "2026-05-01T10:00:00", updatedAt: "2026-06-01T08:00:00", ownedBy: "kerry", ownedByDept: "org-market" },
  { id: "tag-biz-006", tagName: "国庆活动", tagCode: "national_day", tagType: 1, parentId: "营销活动", level: 1, aiSource: 0, aiRecognitionEnabled: 1, isVisible: 1, status: 1, sortOrder: 6, description: "国庆节营销活动素材", createdBy: "yangwt", createdAt: "2026-04-20T09:00:00", updatedAt: "2026-05-10T14:00:00", ownedBy: "yangwt", ownedByDept: "org-market" },
  { id: "tag-biz-007", tagName: "自媒体推广", tagCode: "social_media", tagType: 1, parentId: "产品宣传", level: 1, aiSource: 0, aiRecognitionEnabled: 1, isVisible: 1, status: 1, sortOrder: 7, description: "微博、抖音、小红书等自媒体平台推广素材", createdBy: "kerry", createdAt: "2026-03-01T11:00:00", updatedAt: "2026-05-25T16:00:00", ownedBy: "kerry", ownedByDept: "org-market" },
  { id: "tag-biz-008", tagName: "KOL合作", tagCode: "kol", tagType: 1, parentId: "产品宣传", level: 1, aiSource: 0, aiRecognitionEnabled: 1, isVisible: 1, status: 1, sortOrder: 8, description: "与KOL/KOC合作产出的推广素材", createdBy: "yangwt", createdAt: "2026-02-15T10:00:00", updatedAt: "2026-04-30T09:00:00", ownedBy: "yangwt", ownedByDept: "org-market" },
  { id: "tag-biz-009", tagName: "试驾活动", tagCode: "test_drive", tagType: 1, parentId: "营销活动", level: 1, aiSource: 0, aiRecognitionEnabled: 1, isVisible: 1, status: 1, sortOrder: 9, description: "试驾体验活动相关素材", createdBy: "kerry", createdAt: "2026-04-10T15:00:00", updatedAt: "2026-05-15T10:00:00", ownedBy: "kerry", ownedByDept: "org-market" },
  { id: "tag-biz-010", tagName: "售后服务", tagCode: "after_sales", tagType: 1, parentId: 0, level: 0, aiSource: 0, aiRecognitionEnabled: 1, isVisible: 1, status: 1, sortOrder: 10, description: "售后服务、保养维修相关素材", createdBy: "yangwt", createdAt: "2026-01-20T09:00:00", updatedAt: "2026-03-10T11:00:00", ownedBy: "yangwt", ownedByDept: "org-market" },

  // ===== AI标签 (tagType=2, 支持父级层级) =====
  // -- 顶层 AI 父标签 --
  { id: "tag-ai-001", tagName: "汽车", tagCode: "auto_car", tagType: 2, parentId: "", level: 0, aiSource: 1, aiRecognitionEnabled: 1, isVisible: 1, status: 1, sortOrder: 1, description: "汽车品类顶级标签，AI自动识别", createdBy: "system", createdAt: "2026-01-01T00:00:00", updatedAt: "2026-01-01T00:00:00", ownedBy: "system", ownedByDept: "" },
  { id: "tag-ai-002", tagName: "画面质感", tagCode: "visual_texture", tagType: 2, parentId: "", level: 0, aiSource: 2, aiRecognitionEnabled: 1, isVisible: 1, status: 1, sortOrder: 2, description: "画面质感分类（业务预定义，期望AI识别）", createdBy: "kerry", createdAt: "2026-03-10T14:00:00", updatedAt: "2026-04-01T10:00:00", ownedBy: "kerry", ownedByDept: "org-market" },
  { id: "tag-ai-003", tagName: "户外场景", tagCode: "outdoor", tagType: 2, parentId: "", level: 0, aiSource: 1, aiRecognitionEnabled: 1, isVisible: 1, status: 1, sortOrder: 3, description: "户外场景识别分类", createdBy: "system", createdAt: "2026-01-01T00:00:00", updatedAt: "2026-01-01T00:00:00", ownedBy: "system", ownedByDept: "" },
  { id: "tag-ai-004", tagName: "产品特写", tagCode: "product_closeup", tagType: 2, parentId: "", level: 0, aiSource: 2, aiRecognitionEnabled: 1, isVisible: 1, status: 1, sortOrder: 4, description: "产品局部与特写识别分类", createdBy: "kerry", createdAt: "2026-04-05T10:00:00", updatedAt: "2026-04-05T10:00:00", ownedBy: "kerry", ownedByDept: "org-market" },

  // -- 画面质感 子标签 --
  { id: "tag-ai-011", tagName: "胶片颗粒感", tagCode: "film_grain", tagType: 2, parentId: "画面质感", level: 1, aiSource: 1, aiRecognitionEnabled: 1, isVisible: 1, status: 1, sortOrder: 1, description: "具有胶片颗粒质感的画面风格", createdBy: "system", createdAt: "2026-03-15T08:00:00", updatedAt: "2026-03-15T08:00:00", ownedBy: "system", ownedByDept: "" },
  { id: "tag-ai-012", tagName: "高清锐利", tagCode: "hd_sharp", tagType: 2, parentId: "画面质感", level: 1, aiSource: 2, aiRecognitionEnabled: 1, isVisible: 1, status: 1, sortOrder: 2, description: "高清无噪点的锐利画面", createdBy: "kerry", createdAt: "2026-04-01T15:00:00", updatedAt: "2026-04-01T15:00:00", ownedBy: "kerry", ownedByDept: "org-market" },
  { id: "tag-ai-013", tagName: "柔光朦胧", tagCode: "soft_dreamy", tagType: 2, parentId: "画面质感", level: 1, aiSource: 1, aiRecognitionEnabled: 1, isVisible: 1, status: 1, sortOrder: 3, description: "柔光、朦胧或雾化效果的画面", createdBy: "system", createdAt: "2026-04-20T10:00:00", updatedAt: "2026-04-20T10:00:00", ownedBy: "system", ownedByDept: "" },

  // -- 户外场景 子标签 --
  { id: "tag-ai-021", tagName: "城市街道", tagCode: "city_street", tagType: 2, parentId: "户外场景", level: 1, aiSource: 1, aiRecognitionEnabled: 1, isVisible: 1, status: 1, sortOrder: 1, description: "城市道路、街景背景", createdBy: "system", createdAt: "2026-02-01T12:00:00", updatedAt: "2026-02-01T12:00:00", ownedBy: "system", ownedByDept: "" },
  { id: "tag-ai-022", tagName: "自然风光", tagCode: "nature", tagType: 2, parentId: "户外场景", level: 1, aiSource: 1, aiRecognitionEnabled: 1, isVisible: 1, status: 1, sortOrder: 2, description: "山川、湖泊、森林等自然景观", createdBy: "system", createdAt: "2026-02-01T12:00:00", updatedAt: "2026-02-01T12:00:00", ownedBy: "system", ownedByDept: "" },
  { id: "tag-ai-023", tagName: "赛道", tagCode: "racetrack", tagType: 2, parentId: "户外场景", level: 1, aiSource: 2, aiRecognitionEnabled: 1, isVisible: 1, status: 1, sortOrder: 3, description: "赛道或试驾场地场景", createdBy: "kerry", createdAt: "2026-05-10T08:00:00", updatedAt: "2026-05-10T08:00:00", ownedBy: "kerry", ownedByDept: "org-market" },

  // -- 产品特写 子标签 --
  { id: "tag-ai-031", tagName: "内饰展示", tagCode: "interior", tagType: 2, parentId: "产品特写", level: 1, aiSource: 1, aiRecognitionEnabled: 1, isVisible: 1, status: 1, sortOrder: 1, description: "车内饰细节展示", createdBy: "system", createdAt: "2026-03-01T08:00:00", updatedAt: "2026-03-01T08:00:00", ownedBy: "system", ownedByDept: "" },
  { id: "tag-ai-032", tagName: "外观展示", tagCode: "exterior", tagType: 2, parentId: "产品特写", level: 1, aiSource: 1, aiRecognitionEnabled: 1, isVisible: 1, status: 1, sortOrder: 2, description: "车外观整体及局部展示", createdBy: "system", createdAt: "2026-03-01T08:00:00", updatedAt: "2026-03-01T08:00:00", ownedBy: "system", ownedByDept: "" },
  { id: "tag-ai-033", tagName: "灯光细节", tagCode: "light_detail", tagType: 2, parentId: "产品特写", level: 1, aiSource: 2, aiRecognitionEnabled: 1, isVisible: 1, status: 1, sortOrder: 3, description: "车灯设计细节特写", createdBy: "kerry", createdAt: "2026-05-12T10:00:00", updatedAt: "2026-05-12T10:00:00", ownedBy: "kerry", ownedByDept: "org-market" },

  // -- 其他 AI 标签（无子标签的独立标签） --
  { id: "tag-ai-040", tagName: "人物", tagCode: "people", tagType: 2, parentId: "", level: 0, aiSource: 1, aiRecognitionEnabled: 1, isVisible: 1, status: 1, sortOrder: 5, description: "画面中包含人物", createdBy: "system", createdAt: "2026-01-01T00:00:00", updatedAt: "2026-01-01T00:00:00", ownedBy: "system", ownedByDept: "" },
  { id: "tag-ai-041", tagName: "品牌Logo", tagCode: "brand_logo", tagType: 2, parentId: "", level: 0, aiSource: 2, aiRecognitionEnabled: 1, isVisible: 1, status: 1, sortOrder: 6, description: "包含品牌标志的画面", createdBy: "kerry", createdAt: "2026-04-08T09:00:00", updatedAt: "2026-04-08T09:00:00", ownedBy: "kerry", ownedByDept: "org-market" },
  { id: "tag-ai-042", tagName: "活动", tagCode: "event", tagType: 2, parentId: "", level: 0, aiSource: 1, aiRecognitionEnabled: 1, isVisible: 1, status: 1, sortOrder: 7, description: "活动现场拍摄的素材", createdBy: "system", createdAt: "2026-02-01T00:00:00", updatedAt: "2026-02-01T00:00:00", ownedBy: "system", ownedByDept: "" },
  { id: "tag-ai-043", tagName: "横版", tagCode: "landscape", tagType: 2, parentId: "", level: 0, aiSource: 1, aiRecognitionEnabled: 1, isVisible: 1, status: 1, sortOrder: 8, description: "横版画幅素材", createdBy: "system", createdAt: "2026-01-01T00:00:00", updatedAt: "2026-01-01T00:00:00", ownedBy: "system", ownedByDept: "" },
  { id: "tag-ai-044", tagName: "竖版", tagCode: "portrait", tagType: 2, parentId: "", level: 0, aiSource: 1, aiRecognitionEnabled: 1, isVisible: 1, status: 1, sortOrder: 9, description: "竖版画幅素材", createdBy: "system", createdAt: "2026-01-01T00:00:00", updatedAt: "2026-01-01T00:00:00", ownedBy: "system", ownedByDept: "" },
];

const filterLabels = ["素材来源", "文件格式", "品牌", "车系", "车型", "内饰色", "外饰色", "权限范围", "业务标签", "AI标签", "素材状态", "上传时间", "素材失效日"];

const SESSION_USER_KEY = "dp-material-library-current-user";
let db = loadDb();
ensureSystemData();
const state = {
  page: "all",
  groupId: "all",
  view: "compact",
  query: "",
  sort: "素材热度",
  activeFilter: null,
  filters: {},
  visibleFilters: [...filterLabels],
  showGroupDescendants: false,
  selectedAssetId: db.assets[0]?.id || "",
  detailTab: "overview",
  similar: false,
  selectedIds: new Set(),
  collapsedGroupIds: new Set(),
  manageValidity: "全部",
  loginLogFilters: { username: "", name: "", startDate: "", endDate: "" },
  userManageFilters: { username: "", name: "", includeChildren: true },
  userManageOrgId: "",
  selectedManageUserId: "",
  permissionView: "menu",
  permissionMenuId: "",
  permissionSubjectType: "organization",
  permissionSubjectId: "",
  recycleSort: "deletedDesc",
  selectedValueListId: "",
  valueListSearch: { keyword: "" },
  valueListSelectedNodeId: "",
  valueListExpandedIds: new Set(),
  menuManageSelectedId: "",
  menuManageExpandedIds: new Set(),
  menuManageEditingId: "",
  navExpandedMenuIds: new Set(),
  navTreeInitialized: false,
  theme: localStorage.getItem("dp-material-library-theme") || "light",
  zoomLevel: 100,
  panX: 0,
  panY: 0,
  isPanning: false,
  detailPanelWidth: Number(localStorage.getItem("dp-material-library-detail-width")) || 600,
  detailPanelHeight: Number(localStorage.getItem("dp-material-library-detail-height")) || 300,
  detailPanelDock: "side",
};

let currentUser = getStoredCurrentUser() || getAnonymousUser();
const SUPER_ADMIN_ROLE_ID = "super_admin"; // 固定常量

function isAdmin() {
  return getUserRoleIds(currentUser).includes(SUPER_ADMIN_ROLE_ID);
}

function canManageAsset(asset) {
  return isAdmin() || asset?.ownedBy === currentUser.username;
}

function isPendingAsset(asset) {
  if (!asset) return false;
  const statusConfig = getAssetStatusConfig();
  const auditConfig = getAuditStatusConfig();
  const assetStatus = asset.assetStatus || asset.status;
  const auditStatus = asset.auditStatus;
  if (statusConfig.activeCodes.includes(assetStatus)) return false;
  if (statusConfig.pendingCodes.includes(assetStatus)) return true;
  return auditStatus && !auditConfig.passCodes.includes(auditStatus);
}

function getOrgAncestorIds(orgId) {
  const ids = [];
  let currentId = orgId;
  while (currentId) {
    const org = (db.organizations || []).find((item) => item.id === currentId);
    const parentId = org?.parentId || "";
    if (!parentId) break;
    ids.push(parentId);
    currentId = parentId;
  }
  return ids;
}

function aclMatchesCurrentUser(acl) {
  if (!acl || !isLoggedIn()) return false;
  if (acl.subjectType === "user") return acl.subjectId === currentUser.id;
  if (acl.subjectType === "company") return acl.subjectId === "all";
  if (acl.subjectType === "department") {
    if (acl.subjectId === currentUser.organizationId) return true;
    return !!acl.includeSubDept && getOrgAncestorIds(currentUser.organizationId).includes(acl.subjectId);
  }
  return false;
}

let groupPermissionCache = null;

function buildUserGroupPermissionCache() {
  groupPermissionCache = new Map();
  (db.groups || []).forEach((group) => {
    const effectiveAcl = getGroupEffectiveAcl(group.id);
    let maxWeight = 0;
    effectiveAcl.forEach((acl) => {
      if (aclMatchesCurrentUser(acl)) {
        const weight = getPermissionWeight(acl.permission, "group_permission_level");
        if (weight > maxWeight) maxWeight = weight;
      }
    });
    groupPermissionCache.set(group.id, maxWeight);
  });
}

function invalidateGroupPermissionCache() {
  groupPermissionCache = null;
}

function getPermissionWeight(code, dimCode) {
  const dimNode = getTreeNodeByCode(dimCode);
  if (!dimNode) return 0;
  const valueNode = db.valueListTree.find((n) => n.parentId === dimNode.id && n.code === code);
  return parseInt(valueNode?.attr1 || "0", 10);
}

function hasGroupPermissionLevel(groupId, requiredPerm) {
  if (!groupPermissionCache) buildUserGroupPermissionCache();
  const maxWeight = groupPermissionCache.get(groupId) || 0;
  const requiredWeight = getPermissionWeight(requiredPerm, "group_permission_level");
  return maxWeight >= requiredWeight;
}

function getGroupEffectiveAcl(groupId) {
  const aclList = [];
  let currentId = groupId;
  while (currentId) {
    const groupAcls = (db.groupAcl || []).filter((acl) => acl.groupId === currentId);
    aclList.push(...groupAcls);
    const group = (db.groups || []).find((g) => g.id === currentId);
    currentId = group?.parentId || null;
  }
  return aclList;
}

function getEffectiveGroupPermissionLevel(groupId) {
  const aclList = getGroupEffectiveAcl(groupId);
  let maxWeight = 0;
  let effectivePerm = "";
  aclList.forEach((acl) => {
    if (aclMatchesCurrentUser(acl)) {
      const weight = getPermissionWeight(acl.permission, "group_permission_level");
      if (weight > maxWeight) {
        maxWeight = weight;
        effectivePerm = acl.permission;
      }
    }
  });
  return effectivePerm;
}

function canViewGroup(groupId) {
  if (isAdmin()) return true;
  return hasGroupPermissionLevel(groupId, "view");
}

function canDownloadFromGroup(groupId) {
  if (isAdmin()) return true;
  return hasGroupPermissionLevel(groupId, "download");
}

function canContributeToGroup(groupId) {
  if (isAdmin()) return true;
  return hasGroupPermissionLevel(groupId, "contribute");
}

function canManageGroup(groupId) {
  if (isAdmin()) return true;
  return hasGroupPermissionLevel(groupId, "manage");
}

const ASSET_PERMISSION_MAP = {
  view: ["view"],
  edit: ["view", "edit"],
  download: ["view", "download"],
  full: ["view", "edit", "download"],
};

function hasAssetAclPermission(assetId, targetPerm) {
  const assetAcls = (db.assetAcl || []).filter((acl) => acl.assetId === assetId);
  const now = new Date();
  for (const acl of assetAcls) {
    if (acl.expiresAt) {
      const expireDate = toJsDate(acl.expiresAt);
      if (now > expireDate) continue;
    }
    if (aclMatchesCurrentUser(acl)) {
      const perms = ASSET_PERMISSION_MAP[acl.permission] || [];
      if (perms.includes(targetPerm)) return true;
    }
  }
  return false;
}

function getAssetEffectivePermissions(assetId) {
  const assetAcls = (db.assetAcl || []).filter((acl) => acl.assetId === assetId);
  const effective = new Set();
  const now = new Date();
  for (const acl of assetAcls) {
    if (acl.expiresAt) {
      const expireDate = toJsDate(acl.expiresAt);
      if (now > expireDate) continue;
    }
    if (aclMatchesCurrentUser(acl)) {
      const perms = ASSET_PERMISSION_MAP[acl.permission] || [];
      perms.forEach((p) => effective.add(p));
    }
  }
  return Array.from(effective);
}

function canViewAsset(asset) {
  if (isAdmin()) return true;
  if (asset?.ownedBy === currentUser.username) return true;
  if (canViewGroup(asset?.groupId)) return true;
  return hasAssetAclPermission(asset?.id, "view");
}

function canEditAsset(asset) {
  if (isAdmin()) return true;
  if (asset?.ownedBy === currentUser.username) return true;
  if (canContributeToGroup(asset?.groupId)) return true;
  return hasAssetAclPermission(asset?.id, "edit");
}

function canDownloadAsset(asset) {
  if (isAdmin()) return true;
  if (asset?.ownedBy === currentUser.username) return true;
  if (canDownloadFromGroup(asset?.groupId)) return true;
  return hasAssetAclPermission(asset?.id, "download");
}

function canDeleteAsset(asset) {
  if (isAdmin()) return true;
  if (asset?.ownedBy === currentUser.username) return true;
  return canContributeToGroup(asset?.groupId);
}

function canRestoreAsset(asset) {
  return canDeleteAsset(asset);
}

function canMoveAsset(asset, targetGroupId) {
  if (isAdmin()) return true;
  return canContributeToGroup(asset?.groupId) && canContributeToGroup(targetGroupId);
}

function canUploadToGroup(groupId) {
  if (isAdmin()) return true;
  return canContributeToGroup(groupId);
}

function canPurgeAsset(asset) {
  if (isAdmin()) return true;
  return asset?.ownedBy === currentUser.username;
}

function isGroupDescendant(descendantGroupId, ancestorGroupId) {
  let currentId = descendantGroupId;
  while (currentId) {
    if (currentId === ancestorGroupId) return true;
    const group = (db.groups || []).find((g) => g.id === currentId);
    currentId = group?.parentId || null;
  }
  return false;
}

function canMoveGroup(sourceGroupId, targetGroupId) {
  if (isAdmin()) {
    return !isGroupDescendant(sourceGroupId, targetGroupId);
  }
  if (!canManageGroup(sourceGroupId)) return false;
  if (!canManageGroup(targetGroupId)) return false;
  return !isGroupDescendant(sourceGroupId, targetGroupId);
}

function isShareRecordExpired(share) {
  if (!share.expiresAt || share.expiresAt === "永久有效") return false;
  const expireDate = toJsDate(share.expiresAt);
  return new Date() > expireDate;
}

function canCreateShare(target, contentPermission) {
  if (isAdmin()) return true;
  if (target.type === "group") {
    if (contentPermission === "view") return canViewGroup(target.id);
    if (contentPermission === "download") return canDownloadFromGroup(target.id);
  }
  if (target.type === "asset") {
    if (contentPermission === "view") return canViewAsset(target);
    if (contentPermission === "download") return canDownloadAsset(target);
  }
  return false;
}

function canManageShare(share) {
  if (isAdmin()) return true;
  if (share.ownedBy === currentUser.username) return true;
  if (share.targetType === "group") return canManageGroup(share.targetId);
  if (share.targetType === "asset") return canManageAsset({ id: share.targetId, ownedBy: share.ownedBy, groupId: "" });
  return false;
}

function canManageTag(tag) {
  if (isAdmin()) return true;
  return tag?.ownedBy === currentUser.username;
}

function canManageCollect(task) {
  if (isAdmin()) return true;
  return task?.ownedBy === currentUser.username;
}

function getVisibleAssets() {
  return (db.assets || [])
    .filter((asset) => getAssetStatusConfig().activeCodes.includes(asset.assetStatus) && canViewAsset(asset))
    .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0));
}

function getRootMenu() {
  return (db.menus || []).find((menu) => menu.parentId === null) || null;
}

function getMenuChildren(parentId, { includeInvalid = false } = {}) {
  return (db.menus || [])
    .filter((menu) => menu.parentId === parentId && (includeInvalid || menu.valid !== false))
    .sort((a, b) => (a.order || 0) - (b.order || 0));
}

function getMenuByPage(page) {
  return (db.menus || []).find((menu) => menu.category === "page" && menu.page === page && menu.valid !== false) || null;
}

function getMenuBranch(menuOrId) {
  const menus = db.menus || [];
  const root = getRootMenu();
  let current = typeof menuOrId === "string" ? menus.find((menu) => menu.id === menuOrId) : menuOrId;
  let branch = current || null;
  while (current && current.parentId && current.parentId !== root?.id) {
    current = menus.find((menu) => menu.id === current.parentId);
    if (current) branch = current;
  }
  return branch;
}

function getMenuLayout(menuOrPage) {
  const menu = typeof menuOrPage === "string" ? getMenuByPage(menuOrPage) : menuOrPage;
  if (!menu) return "";
  return menu.layout || getMenuBranch(menu)?.layout || "manage";
}

function getAllMenuPages() {
  return (db.menus || [])
    .filter((menu) => menu.category === "page" && menu.valid !== false && menu.page)
    .map((menu) => menu.page);
}

function isAssetPage(page) {
  return getMenuLayout(page) === "asset";
}

function isManagePage(page) {
  return getMenuLayout(page) === "manage";
}

function getMenuDescendantPageMenus(parentId) {
  const result = [];
  getMenuChildren(parentId).forEach((menu) => {
    if (menu.category === "page" && menu.page) result.push(menu);
    if (menu.category !== "page") result.push(...getMenuDescendantPageMenus(menu.id));
  });
  return result;
}

function isVisibleNavMenu(menu) {
  if (!menu || menu.valid === false || menu.hidden === true) return false;
  if (menu.category === "page") return Boolean(menu.page && canViewMenu(menu.page));
  return getMenuChildren(menu.id).some(isVisibleNavMenu);
}

function getVisibleNavMenuChildren(parentId) {
  return getMenuChildren(parentId).filter(isVisibleNavMenu);
}

function expandNavAncestorsByPage(page) {
  if (!state.navExpandedMenuIds) state.navExpandedMenuIds = new Set();
  const menus = db.menus || [];
  let current = getMenuByPage(page);
  while (current?.parentId) {
    current = menus.find((menu) => menu.id === current.parentId);
    if (current?.id) state.navExpandedMenuIds.add(current.id);
  }
}

function getFirstVisibleMenuPage() {
  return getAllMenuPages().find((page) => canViewMenu(page)) || "";
}

function getAnonymousUser() {
  return { id: "", username: "", name: "未登录", roleId: "", roleIds: [], role: "guest", organizationId: "", organization: "", department: "" };
}

function getStoredCurrentUser() {
  try {
    const userId = localStorage.getItem(SESSION_USER_KEY);
    if (!userId) return null;
    return getUserSessionInfo(userId);
  } catch (error) {
    return null;
  }
}

function isLoggedIn() {
  return !!currentUser?.id;
}

function getUserNameByUsername(username) {
  const user = (db.users || []).find((item) => item.username === username);
  return user?.name || username;
}

function getUserSessionInfo(userId) {
  const user = (db.users || []).find((item) => item.id === userId && item.status === getUserStatusConfig().enabled);
  if (!user) return null;
  const roleIds = getUserRoleIds(user);
  const roles = (db.roles || []).filter((item) => roleIds.includes(item.id));
  const organization = (db.organizations || []).find((item) => item.id === user.organizationId);
  return {
    ...user,
    roleIds,
    roleId: roleIds[0] || "",
    role: roles.map((role) => role.name).join("、") || roleIds.join("、") || "",
    organization: organization?.name || user.organizationId || "",
    department: organization?.name || "",
    permissions: mergeRolePermissions(roles),
  };
}

function getUserRoleIds(user = {}) {
  const ids = Array.isArray(user.roleIds) ? user.roleIds : [];
  const legacy = user.roleId ? [user.roleId] : [];
  return [...new Set([...ids, ...legacy].filter(Boolean))];
}

function getCurrentRoles() {
  const roleIds = getUserRoleIds(currentUser);
  return (db.roles || []).filter((role) => roleIds.includes(role.id));
}

function mergeRolePermissions(roles = []) {
  const merged = createMenuPermissions(false, false);
  roles.forEach((role) => {
    getPermissionMenuItems().forEach((menu) => {
      const permission = role.permissions?.[menu.id] || {};
      if (!merged[menu.id]) merged[menu.id] = { visible: false, editable: false };
      if (permission.editable) merged[menu.id].editable = true;
      if (permission.visible || permission.editable) merged[menu.id].visible = true;
    });
  });
  return merged;
}

function getMenuPermission(menuId) {
  if (isAdmin()) return { visible: true, editable: true };
  const rolePermissions = getCurrentRoles().map((role) => role.permissions?.[menuId]);
  const sources = [
    ...rolePermissions,
    db.orgPermissions?.[currentUser.organizationId]?.[menuId],
    db.userPermissions?.[currentUser.id]?.[menuId],
  ];
  const editable = sources.some((permission) => !!permission?.editable);
  const visible = editable || sources.some((permission) => !!permission?.visible);
  return { visible, editable };
}

function canViewMenu(menuId) {
  return getMenuPermission(menuId).visible;
}

function canEditMenu(menuId) {
  return getMenuPermission(menuId).editable;
}

function ensurePageAllowed() {
  const menu = getMenuByPage(state.page);
  if (menu && isLoggedIn() && !canViewMenu(state.page)) {
    state.page = getFirstVisibleMenuPage() || "all";
    state.groupId = "all";
    showToast("当前账号无权访问该菜单");
  }
}

const els = {
  mainNav: document.querySelector("#mainNav"),
  groupTree: document.querySelector("#groupTree"),
  pageTitle: document.querySelector("#pageTitle"),
  breadcrumb: document.querySelector("#breadcrumb"),
  pageActions: document.querySelector("#pageActions"),
  filters: document.querySelector("#filters"),
  contentPanel: document.querySelector("#contentPanel"),
  assetToolbar: document.querySelector("#assetToolbar"),
  globalSearch: document.querySelector("#globalSearch"),
  viewSwitch: document.querySelector("#viewSwitch"),
  sizeSlider: document.querySelector("#sizeSlider"),
  sortButton: document.querySelector("#sortButton"),
  sortLabel: document.querySelector("#sortLabel"),
  sortDropdown: document.querySelector("#sortDropdown"),
  moreMenu: document.querySelector("#moreMenu"),
  assetMenu: document.querySelector("#assetMenu"),
  previewPop: document.querySelector("#previewPop"),
  filterModal: document.querySelector("#filterModal"),
  tagBank: document.querySelector("#tagBank"),
  selectedTags: document.querySelector("#selectedTags"),
  filterConfig: document.querySelector("#filterConfig"),
  clearFilters: document.querySelector("#clearFilters"),
  similarSearch: document.querySelector("#similarSearch"),
  imageSearchButton: document.querySelector("#imageSearchButton"),
  clearSimilar: document.querySelector("#clearSimilar"),
  closeSimilar: document.querySelector("#closeSimilar"),
  viewer: document.querySelector("#viewer"),
  viewerName: document.querySelector("#viewerName"),
  viewerImage: document.querySelector("#viewerImage"),
  closeViewer: document.querySelector("#closeViewer"),
  detailTabs: document.querySelector("#detailTabs"),
  detailContent: document.querySelector("#detailContent"),
  imageCanvas: document.querySelector("#imageCanvas"),
  zoomLevel: document.querySelector("#zoomLevel"),
  sidebar: document.querySelector("#sidebar"),
  sidebarOverlay: document.querySelector("#sidebarOverlay"),
  mobileMenuToggle: document.querySelector("#mobileMenuToggle"),
  sidebarClose: document.querySelector("#sidebarClose"),
};

function getPermissionMenuItems() {
  const menus = Array.isArray(db?.menus) && db.menus.length ? db.menus : getDefaultMenus();
  return menus
    .filter((menu) => menu.category === "page" && menu.page && menu.valid !== false)
    .map((menu) => ({ id: menu.page, label: menu.name }));
}

function createMenuPermissions(visible = true, editable = true) {
  return getPermissionMenuItems().reduce((map, menu) => {
    map[menu.id] = { visible: !!visible || !!editable, editable: !!editable };
    return map;
  }, {});
}

function normalizeMenuPermissions(permissions = {}, defaultVisible = false, defaultEditable = false) {
  return getPermissionMenuItems().reduce((map, menu) => {
    const permission = permissions?.[menu.id] || {};
    const editable = !!permission.editable || !!defaultEditable;
    map[menu.id] = {
      visible: editable || !!permission.visible || !!defaultVisible,
      editable,
    };
    return map;
  }, {});
}

function getDefaultOrganizations() {
  return [
    { id: "org-brand", name: "品牌中心", parentId: "", manager: "康明", status: "enabled" },
    { id: "org-market", name: "市场部", parentId: "", manager: "陈然", status: "enabled" },
    { id: "org-support", name: "经销商支持", parentId: "", manager: "李想", status: "enabled" },
  ];
}

function getDefaultRoles() {
  return [
    { id: "super_admin", name: "超级管理员", status: "enabled", description: "系统全量管理权限", permissions: createMenuPermissions(true, true) },
    { id: "tag-viewer", name: "标签只读", status: "enabled", description: "仅查看标签，不允许维护", permissions: { ...createMenuPermissions(false, false), tags: { visible: true, editable: false } } },
    { id: "material-operator", name: "素材运营", status: "enabled", description: "素材与标签日常维护", permissions: { ...createMenuPermissions(false, false), tags: { visible: true, editable: true }, collect: { visible: true, editable: true }, share: { visible: true, editable: true }, validity: { visible: true, editable: true } } },
  ];
}

function getDefaultUsers() {
  return [
    { id: "user-admin", username: "admin", password: "admin123", name: "系统管理员", organizationId: "org-brand", roleId: "super_admin", roleIds: ["super_admin"], status: "enabled", lastLogin: "" },
    { id: "user-kerry", username: "kerry", password: "kerry123", name: "Kerry", organizationId: "org-market", roleId: "material-operator", roleIds: ["material-operator"], status: "enabled", lastLogin: "" },
    { id: "user-yangwt", username: "yangwt", password: "yang123", name: "杨文婷", organizationId: "org-market", roleId: "material-operator", roleIds: ["material-operator"], status: "enabled", lastLogin: "" },
    { id: "user-tag-view", username: "tagview", password: "tag123", name: "标签查看员", organizationId: "org-support", roleId: "tag-viewer", roleIds: ["tag-viewer"], status: "enabled", lastLogin: "" },
  ];
}

function getDefaultMenus() {
  return [
    { id: "menu_root", code: "root", name: "所有菜单", category: "root", hidden: false, page: "", valid: true, order: 0, icon: "", description: "", parentId: null, layout: "" },
    { id: "menu_group_assets", code: "assets", name: "素材管理", category: "group", hidden: false, page: "", valid: true, order: 1, icon: "", description: "", parentId: "menu_root", layout: "asset" },
    { id: "menu_all", code: "all", name: "全部素材", category: "page", hidden: false, page: "all", valid: true, order: 1, icon: "▦", description: "", parentId: "menu_group_assets", layout: "asset" },
    { id: "menu_pending", code: "pending", name: "待入库", category: "page", hidden: false, page: "pending", valid: true, order: 2, icon: "▣", description: "", parentId: "menu_group_assets", layout: "asset" },
    { id: "menu_created", code: "created", name: "我创建的组", category: "page", hidden: false, page: "created", valid: true, order: 3, icon: "♙", description: "", parentId: "menu_group_assets", layout: "asset" },
    { id: "menu_group_more", code: "more", name: "更多功能", category: "group", hidden: false, page: "", valid: true, order: 2, icon: "", description: "", parentId: "menu_root", layout: "manage" },
    { id: "menu_activity", code: "activity", name: "用户动态", category: "page", hidden: false, page: "activity", valid: true, order: 1, icon: "", description: "", parentId: "menu_group_more", layout: "manage" },
    { id: "menu_loginLogs", code: "loginLogs", name: "用户登录日志", category: "page", hidden: false, page: "loginLogs", valid: true, order: 2, icon: "", description: "", parentId: "menu_group_more", layout: "manage" },
    { id: "menu_tags", code: "tags", name: "标签管理", category: "page", hidden: false, page: "tags", valid: true, order: 3, icon: "", description: "", parentId: "menu_group_more", layout: "manage" },
    { id: "menu_valueLists", code: "valueLists", name: "值列表管理", category: "page", hidden: false, page: "valueLists", valid: true, order: 4, icon: "", description: "", parentId: "menu_group_more", layout: "manage" },
    { id: "menu_validity", code: "validity", name: "有效期管理", category: "page", hidden: false, page: "validity", valid: true, order: 5, icon: "", description: "", parentId: "menu_group_more", layout: "manage" },
    { id: "menu_group_sys", code: "sys", name: "系统管理", category: "group", hidden: false, page: "", valid: true, order: 6, icon: "", description: "", parentId: "menu_group_more", layout: "manage" },
    { id: "menu_users", code: "users", name: "用户管理", category: "page", hidden: false, page: "users", valid: true, order: 1, icon: "", description: "", parentId: "menu_group_sys", layout: "manage" },
    { id: "menu_roles", code: "roles", name: "角色管理", category: "page", hidden: false, page: "roles", valid: true, order: 2, icon: "", description: "", parentId: "menu_group_sys", layout: "manage" },
    { id: "menu_organizations", code: "organizations", name: "组织管理", category: "page", hidden: false, page: "organizations", valid: true, order: 3, icon: "", description: "", parentId: "menu_group_sys", layout: "manage" },
    { id: "menu_permissions", code: "permissions", name: "权限管理", category: "page", hidden: false, page: "permissions", valid: true, order: 4, icon: "", description: "", parentId: "menu_group_sys", layout: "manage" },
    { id: "menu_menus", code: "menus", name: "菜单管理", category: "page", hidden: false, page: "menus", valid: true, order: 5, icon: "", description: "", parentId: "menu_group_sys", layout: "manage" },
    { id: "menu_collect", code: "collect", name: "收集素材", category: "page", hidden: false, page: "collect", valid: true, order: 7, icon: "", description: "", parentId: "menu_group_more", layout: "manage" },
    { id: "menu_share", code: "share", name: "分享记录", category: "page", hidden: false, page: "share", valid: true, order: 8, icon: "", description: "", parentId: "menu_group_more", layout: "manage" },
    { id: "menu_recycle", code: "recycle", name: "回收站", category: "page", hidden: false, page: "recycle", valid: true, order: 9, icon: "", description: "", parentId: "menu_group_more", layout: "manage" },
  ];
}

function ensureSystemData() {
  let changed = false;
  if (!Array.isArray(db.organizations) || !db.organizations.length) {
    db.organizations = getDefaultOrganizations();
    changed = true;
  }
  if (!Array.isArray(db.menus) || !db.menus.length) {
    db.menus = getDefaultMenus();
    changed = true;
  }
  const defaultMenuMap = getDefaultMenus().reduce((map, menu) => {
    map[menu.id] = menu;
    return map;
  }, {});
  (db.menus || []).forEach((menu) => {
    const defaultMenu = defaultMenuMap[menu.id];
    if (!defaultMenu) return;
    ["layout", "icon"].forEach((field) => {
      if (menu[field] === undefined) {
        menu[field] = defaultMenu[field] || "";
        changed = true;
      }
    });
  });
  if (!Array.isArray(db.roles) || !db.roles.length) {
    db.roles = getDefaultRoles();
    changed = true;
  }
  if (!Array.isArray(db.users) || !db.users.length) {
    db.users = getDefaultUsers();
    changed = true;
  }
  if (!Array.isArray(db.loginLogs)) {
    db.loginLogs = [];
    changed = true;
  }
  if (!Array.isArray(db.valueListTree) || !db.valueListTree.length) {
    db.valueListTree = SEED_VALUE_LIST_TREE;
    changed = true;
  }
  if (!db.orgPermissions || typeof db.orgPermissions !== "object" || Array.isArray(db.orgPermissions)) {
    db.orgPermissions = {};
    changed = true;
  }
  if (!db.userPermissions || typeof db.userPermissions !== "object" || Array.isArray(db.userPermissions)) {
    db.userPermissions = {};
    changed = true;
  }
  if (!Array.isArray(db.groupAcl)) {
    db.groupAcl = [];
    changed = true;
  }
  (db.groups || []).forEach((group) => {
    if (group.system) return;
    const existingAcl = (db.groupAcl || []).find(
      (acl) => acl.groupId === group.id && acl.subjectType === "user" && acl.permission === "manage"
    );
    if (!existingAcl && group.ownedBy) {
      const user = (db.users || []).find((u) => u.username === group.ownedBy);
      if (user) {
        db.groupAcl.push({
          id: `acl-group-${group.id}-${user.id}`,
          groupId: group.id,
          subjectType: "user",
          subjectId: user.id,
          subjectName: user.username,
          permission: "manage",
          includeSubDept: true,
          grantedBy: "system",
          grantedAt: group.createdAt || "2026-01-01T00:00:00",
        });
        changed = true;
      }
    }
  });
  if (!Array.isArray(db.assetAcl)) {
    db.assetAcl = [];
    changed = true;
  }
  if (!Array.isArray(db.permissionRequests)) {
    db.permissionRequests = [];
    changed = true;
  }
  if (!Array.isArray(db.operationLogs)) {
    db.operationLogs = [];
    changed = true;
  }
  (db.roles || []).forEach((role) => {
    const normalized = normalizeMenuPermissions(role.permissions, role.id === "super_admin", role.id === "super_admin");
    if (JSON.stringify(role.permissions || {}) !== JSON.stringify(normalized)) changed = true;
    role.permissions = normalized;
  });
  (db.users || []).forEach((user) => {
    if (!user.status) {
      user.status = getUserStatusConfig().enabled;
      changed = true;
    }
    const roleIds = getUserRoleIds(user);
    if (JSON.stringify(user.roleIds || []) !== JSON.stringify(roleIds)) {
      user.roleIds = roleIds;
      changed = true;
    }
    if (user.roleId !== (roleIds[0] || "")) {
      user.roleId = roleIds[0] || "";
      changed = true;
    }
  });
  (db.users || []).forEach((user) => {
    const normalized = normalizeMenuPermissions(db.userPermissions[user.id] || {});
    if (JSON.stringify(db.userPermissions[user.id] || {}) !== JSON.stringify(normalized)) changed = true;
    db.userPermissions[user.id] = normalized;
  });
  (db.organizations || []).forEach((org) => {
    const normalized = normalizeMenuPermissions(db.orgPermissions[org.id] || {});
    if (JSON.stringify(db.orgPermissions[org.id] || {}) !== JSON.stringify(normalized)) changed = true;
    db.orgPermissions[org.id] = normalized;
  });
  if (changed) saveDb();
}

function logOperation(targetType, targetId, targetName, action, detail) {
  const actionNode = getTreeNodeByCode(action);
  const actionName = actionNode?.name || action;
  const createdAt = nowText();
  const logEntry = {
    operator: currentUser.username,
    operatorDept: currentUser.department || "",
    action: action,
    actionName: actionName,
    detail: detail,
    createdAt: createdAt,
  };
  const entityMap = {
    asset: db.assets,
    group: db.groups,
    tag: db.tags,
    share: db.shares,
    collect: db.collectTasks,
  };
  const entities = entityMap[targetType];
  if (entities && targetId) {
    const entity = entities.find((e) => e.id === targetId);
    if (entity && Array.isArray(entity.logs)) {
      entity.logs.unshift(logEntry);
    }
  }
  db.operationLogs.unshift({
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    ...logEntry,
    targetType: targetType,
    targetId: targetId,
    targetName: targetName,
    ip: "",
  });
}

function bootstrap() {
  localStorage.removeItem("dp-material-library-detail-dock");
  ensureRuntimeElements();
  ensureSystemData();
  normalizeDbDates(db);
  currentUser = getStoredCurrentUser() || getAnonymousUser();
  buildUserGroupPermissionCache();
  renderShell();
  initValueListModalEvents();
  const collectCode = new URLSearchParams(window.location.search).get("collect");
  if (collectCode) {
    renderCollectorPortal(collectCode);
    return;
  }
  const shareId = new URLSearchParams(window.location.search).get("share");
  if (shareId) {
    renderSharePortal(shareId);
    return;
  }
  const pageParam = new URLSearchParams(window.location.search).get("page");
  if (pageParam) state.page = pageParam;
  applyHashState();
  normalizePageState();
  bindEvents();
  render();
  if (!isLoggedIn()) showLoginPage();
  if (state.selectedAssetId && location.hash.startsWith("#asset=")) setTimeout(() => openViewer(state.selectedAssetId), 0);
}

function normalizePageState() {
  const validPages = getAllMenuPages();
  if (!validPages.includes(state.page)) {
    state.page = "all";
    state.groupId = "all";
  }
  ensurePageAllowed();
}

function applyHashState() {
  const hash = location.hash.slice(1);
  if (!hash) return;
  const [key, rawValue] = hash.split("=");
  const value = decodeURIComponent(rawValue || "");
  if (key === "group" && db.groups.some((group) => group.id === value)) {
    state.page = "all";
    state.groupId = value;
  }
  if (key === "asset" && findAsset(value)) {
    state.page = "all";
    state.selectedAssetId = value;
  }
}

function calculateExpireTime(relativeExpires) {
  const pad = (n) => String(n).padStart(2, "0");
  const buildDate = (date) => { const p = (n) => String(n).padStart(2, "0"); return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}T23:59:00`; };
  if (!relativeExpires || relativeExpires === "永久有效") {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 100);
    return buildDate(date);
  }
  const match = relativeExpires.match(/(\d+)/);
  if (!match) {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 100);
    return buildDate(date);
  }
  const days = parseInt(match[1], 10);
  const date = new Date();
  date.setDate(date.getDate() + days);
  return buildDate(date);
}

function isShareExpired(expiresAt) {
  if (expiresAt === "永久有效" || expiresAt === "已关闭") return false;
  const now = Date.now();
  const expireTimestamp = dateTimeTextToTimestamp(expiresAt || "");
  return expireTimestamp > 0 ? now > expireTimestamp : false;
}

function normalizeShareSecurity(share) {
  if (!share) return share;
  if (share.requirePassword === undefined) {
    share.requirePassword = Boolean(share.requiresPassword);
  }
  share.requirePassword = Boolean(share.requirePassword);
  share.password = typeof share.password === "string" ? share.password : "";
  if (!share.requirePassword) share.password = "";
  return share;
}

function buildShareSecurity(data = {}) {
  const requirePassword = data.requirePassword === "on";
  const inputPassword = String(data.password || "").trim();
  const password = requirePassword ? inputPassword || Math.random().toString(36).slice(2, 8) : "";
  return { requirePassword, password };
}

function normalizeCollectTaskSecurity(task) {
  if (!task) return task;
  task.password = typeof task.password === "string" && task.password ? task.password : String(task.code || "");
  task.requirePassword = true;
  if (!task.auditStatus) {
    task.auditStatus = getAuditStatusConfig().pendingSubmit;
  }
  if (task.status === "closed") {
    task.status = getCollectTaskStatusConfig().expired;
  }
  return task;
}

function loadDb() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (saved?.assets?.length && saved?.groups?.length) {
      if (!saved.tags || !saved.tags.length) { saved.tags = seedTags; localStorage.setItem(STORAGE_KEY, JSON.stringify(saved)); }
      return saved;
    }
  } catch (error) {
    console.warn("本地数据读取失败，已使用默认数据", error);
  }
  return { groups: defaultGroups, assets: seedAssets, tags: seedTags,
    collectTasks: [
      { id: "collect-1", theme: "上海车展活动素材", desc: "", group: "上海车展活动素材", status: "expired", code: "apym", creator: "yangwt", createdAt: "2026-06-09T20:15:00", expiresAt: "2026-06-09T20:25:00", requirePassword: false, password: "", types: [], link: "", createdBy: "yangwt", ownedBy: "yangwt", ownedByDept: "org-market", updatedAt: "2026-06-09T20:25:00", auditStatus: "human_pass", logs: [{ operator: "yangwt", operatorDept: "org-market", action: "collect.create", actionName: "创建收集任务", detail: "创建收集任务「上海车展活动素材」", createdAt: "2026-06-09T20:15:00" }, { operator: "yangwt", operatorDept: "org-market", action: "collect.close", actionName: "关闭收集任务", detail: "收集任务已失效", createdAt: "2026-06-09T20:25:00" }] },
      { id: "collect-2", theme: "小红书", desc: "", group: "小红书平台素材", status: "expired", code: "oq9v", creator: "yangwt", createdAt: "2026-05-25T08:58:00", expiresAt: "2026-06-01T08:58:00", requirePassword: false, password: "", types: [], link: "", createdBy: "yangwt", ownedBy: "yangwt", ownedByDept: "org-market", updatedAt: "2026-06-01T08:58:00", auditStatus: "human_pass", logs: [{ operator: "yangwt", operatorDept: "org-market", action: "collect.create", actionName: "创建收集任务", detail: "创建收集任务「小红书」", createdAt: "2026-05-25T08:58:00" }, { operator: "system", operatorDept: "", action: "collect.close", actionName: "关闭收集任务", detail: "收集任务过期", createdAt: "2026-06-01T08:58:00" }] },
      { id: "collect-3", theme: "凡尔赛 618车展", desc: "", group: "凡尔赛 618车展", status: "active", code: "4vlw", creator: "kerry", createdAt: "2026-05-22T17:15:00", expiresAt: "2026-08-20T17:15:00", requirePassword: false, password: "", types: [], link: "", createdBy: "kerry", ownedBy: "kerry", ownedByDept: "org-market", updatedAt: "2026-05-22T17:15:00", auditStatus: "pending_submit", logs: [{ operator: "kerry", operatorDept: "org-market", action: "collect.create", actionName: "创建收集任务", detail: "创建收集任务「凡尔赛 618车展」", createdAt: "2026-05-22T17:15:00" }] },
      { id: "collect-seed", theme: "系统初始化素材", desc: "系统初始化时导入的素材", group: "测试素材组", status: "completed", code: "seed", creator: "kerry", createdAt: "2026-05-26T00:00:00", expiresAt: "2027-05-26T00:00:00", requirePassword: false, password: "", types: [], link: "", createdBy: "kerry", ownedBy: "kerry", ownedByDept: "org-market", updatedAt: "2026-05-26T00:00:00", auditStatus: "human_pass", logs: [{ operator: "kerry", operatorDept: "org-market", action: "collect.create", actionName: "创建收集任务", detail: "创建系统初始化素材收集任务", createdAt: "2026-05-26T00:00:00" }] },
    ],
    shares: [
      { id: "share-1", group: "凡尔赛 618车展", user: "yangwt", access: "分享给互联网用户（无需登录）", visits: 2, views: 2, downloads: 0, sharedAt: "2026-03-31T18:06:55", expiresAt: "2026-04-07T18:06:00", targetType: "group", targetId: "versailles", code: "abc123", link: "", requirePassword: false, password: "", accessScope: "internal", contentPermission: "view", maxVisits: null, status: "active", ownedBy: "yangwt", ownedByDept: "org-market", createdBy: "yangwt", updatedAt: "2026-03-31T18:06:55", logs: [{ operator: "yangwt", operatorDept: "org-market", action: "share.create", actionName: "创建分享", detail: "分享素材组「凡尔赛 618车展」", createdAt: "2026-03-31T18:06:55" }] },
    ],
  };
}

function saveDb() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch (error) {
    showToast("浏览器本地存储空间不足，当前数据仅在本次页面打开期间保留");
  }
}

function getCollectLink(code) {
  const url = new URL(window.location.href);
  url.search = "";
  url.hash = "";
  url.searchParams.set("collect", code);
  return url.href;
}

function getLibraryLink(page = "all") {
  const url = new URL(window.location.href);
  url.search = "";
  url.hash = "";
  if (page) url.searchParams.set("page", page);
  return url.href;
}

function getShareLink(targetType, targetId, code) {
  const url = new URL(window.location.href);
  url.search = "";
  url.hash = "";
  url.searchParams.set("share", `${targetType}:${targetId}:${code}`);
  return url.href;
}

function getQrImageUrl(link) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=8&data=${encodeURIComponent(link)}`;
}

async function copyText(value) {
  try {
    await navigator.clipboard.writeText(value);
    showToast("链接已复制");
  } catch (error) {
    showToast("当前浏览器不允许自动复制，请手动复制输入框里的链接");
  }
}

function renderCollectorPortal(code) {
  const task = db.collectTasks.find((item) => item.code === code);
  document.body.className = "collector-body";
  if (!task) {
    document.body.innerHTML = `<main class="collector-page collector-page--centered"><section class="collector-card"><div class="brand-mini"><b>DPCA</b><span>神龙汽车有限公司素材库</span></div><h1>收集链接无效</h1><p>请确认访问密码或联系素材库管理员重新发送链接。</p></section></main>`;
    return;
  }
  normalizeCollectTaskSecurity(task);
  const taskStatusConfig = getCollectTaskStatusConfig();
  if (isShareExpired(task.expiresAt) && task.status === taskStatusConfig.active) {
    task.status = taskStatusConfig.expired;
    saveDb();
  }
  if (task.status !== taskStatusConfig.active) {
    document.body.innerHTML = `<main class="collector-page collector-page--centered"><section class="collector-card"><div class="brand-mini"><b>DPCA</b><span>神龙汽车有限公司素材库</span></div><h1>收集任务已结束</h1><p>该收集任务已过期或已关闭，无法继续上传素材。</p></section></main>`;
    return;
  }
  const auditConfig = getAuditStatusConfig();
  const allowedAuditStatuses = [auditConfig.pendingSubmit, auditConfig.pendingAudit];
  if (!allowedAuditStatuses.includes(task.auditStatus)) {
    document.body.innerHTML = `<main class="collector-page collector-page--centered"><section class="collector-card"><div class="brand-mini"><b>DPCA</b><span>神龙汽车有限公司素材库</span></div><h1>素材审核中</h1><p>该收集任务的素材正在审核中，暂无法上传或编辑内容。</p></section></main>`;
    return;
  }
  if (task.requirePassword && task.password && sessionStorage.getItem(getCollectPasswordKey(task)) !== task.password) {
    renderCollectorPasswordGate(code, task);
    return;
  }
  renderCollectorPortalContent(code, task);
}

function getCollectPasswordKey(task) {
  return `dp-collect-password:${task.code}`;
}

function renderCollectorPasswordGate(code, task) {
  document.body.innerHTML = `
    <main class="collector-page collector-page--centered">
      <section class="collector-card share-password-card">
        <div class="brand-mini"><b>DPCA</b><span>神龙汽车有限公司素材库</span></div>
        <h1>${escapeHtml(task.theme)}</h1>
        <p>该收集任务已开启访问密码，请输入密码后上传素材。</p>
        <form id="collectPasswordForm">
          <label>访问密码<input name="password" type="password" autocomplete="current-password" required /></label>
          <div class="collector-actions"><button type="submit">进入上传页</button></div>
        </form>
        <div class="collector-result hidden" id="collectPasswordError">访问密码不正确，请重新输入。</div>
      </section>
    </main>`;
  document.querySelector("#collectPasswordForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const password = new FormData(event.currentTarget).get("password");
    if (password !== task.password) {
      document.querySelector("#collectPasswordError")?.classList.remove("hidden");
      return;
    }
    sessionStorage.setItem(getCollectPasswordKey(task), task.password);
    renderCollectorPortalContent(code, task);
  });
}

function renderCollectorPortalContent(code, task) {
  const businessTags = getTagSummary().businessTags;
  const tagOptions = businessTags.map((tag) => `<option value="${escapeAttr(tag.tagName || tag.name)}">${escapeHtml(tag.tagName || tag.name)}</option>`).join("");
  document.body.innerHTML = `
    <main class="collector-page">
      <section class="collector-hero">
        <div class="brand-mini"><b>DPCA</b><span>神龙汽车有限公司素材库</span></div>
        <h1>${escapeHtml(task.theme)}</h1>
        <p>请上传本次收集任务需要的图片、视频或文档。提交后素材会进入「待入库」，待审核入库。</p>
        <div class="collector-info-bar">
          <span>截止日期：<strong>${escapeHtml(task.expiresAt)}</strong></span>
          ${task.requirePassword ? `<span>需要访问密码</span>` : `<span>无需访问密码</span>`}
        </div>
      </section>
      <section class="collector-content">
        <form id="collectorForm">
          <div class="collector-form-section">
            <h2>提交人信息</h2>
            <div class="collector-form-row">
              <label><span class="required">*</span>提交人姓名<input name="author" placeholder="请输入姓名" required /></label>
              <label><span class="required">*</span>公司/部门<input name="department" placeholder="请输入公司或部门" required /></label>
            </div>
            <div class="collector-form-row">
              <label><span class="required">*</span>联系方式<input name="phone" placeholder="请输入手机号" /></label>
              <label><span class="required">*</span>邮箱<input name="email" placeholder="请输入邮箱" /></label>
            </div>
          </div>
          <div class="collector-form-section">
            <h2>素材信息</h2>
            <label>素材说明<textarea name="note" rows="3" placeholder="补充用途、活动、车型、版权说明等"></textarea></label>
            <div class="collector-form-row">
              <label>业务标签
                <div class="collector-tag-select">
                  <select name="businessTags" multiple size="4">${tagOptions}</select>
                  <div class="collector-tag-add">
                    <input name="newBusinessTag" type="text" placeholder="输入新标签名称" />
                    <button type="button" id="addNewTagBtn">+ 添加</button>
                  </div>
                </div>
              </label>
            </div>
          </div>
          <div class="collector-form-section">
            <h2>素材上传</h2>
            <div class="collector-upload-area" id="collectorUploadArea">
              <input id="collectorFileInput" type="file" multiple accept="${getAllUploadAccept()}" />
              <div class="collector-upload-btn">
                <span data-icon="upload"></span>
                <span>选择文件</span>
              </div>
              <p>支持图片、视频、文档等格式，可多选</p>
            </div>
          </div>
          <div class="collector-form-section" id="collectorStagedSection" style="display:none;">
            <h2>暂存列表</h2>
            <div id="collectorStagedList" class="collector-staged-list"></div>
          </div>
          <div class="collector-form-actions">
            <button type="button" id="collectorResetBtn">重置</button>
            <button type="button" id="collectorStashBtn">暂存</button>
            <button type="submit" class="primary">提交到待入库</button>
          </div>
        </form>
      </section>
      <div class="collector-result hidden" id="collectorResult"></div>
    </main>`;
  
  const stagedFiles = [];
  
  function validateCollectorForm() {
    const form = document.querySelector("#collectorForm");
    const data = Object.fromEntries(new FormData(form));
    if (!data.author?.trim()) {
      showToast("请填写提交人姓名");
      form.querySelector("[name='author']").focus();
      return false;
    }
    if (!data.department?.trim()) {
      showToast("请填写公司/部门");
      form.querySelector("[name='department']").focus();
      return false;
    }
    if (!data.phone?.trim()) {
      showToast("请填写联系方式");
      form.querySelector("[name='phone']").focus();
      return false;
    }
    if (!data.email?.trim()) {
      showToast("请填写邮箱");
      form.querySelector("[name='email']").focus();
      return false;
    }
    return true;
  }
  
  document.querySelector("#collectorFileInput").addEventListener("change", (event) => {
    const files = [...event.target.files];
    if (!files.length) return;
    const validFiles = files.filter(isAllowedUploadFile);
    const rejectedCount = files.length - validFiles.length;
    if (rejectedCount) showToast(`已跳过 ${rejectedCount} 个不支持的文件格式`);
    validFiles.forEach((file) => {
      stagedFiles.push({
        file,
        id: `staged-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        previewUrl: URL.createObjectURL(file),
      });
    });
    renderStagedList();
    event.target.value = "";
  });
  
  document.querySelector("#addNewTagBtn").addEventListener("click", () => {
    const newTagInput = document.querySelector("[name='newBusinessTag']");
    const newTagName = newTagInput.value.trim();
    if (!newTagName) return;
    const select = document.querySelector("[name='businessTags']");
    const existingOptions = [...select.options].map(opt => opt.value);
    if (existingOptions.includes(newTagName)) {
      showToast("该标签已存在");
      return;
    }
    const option = document.createElement("option");
    option.value = newTagName;
    option.textContent = newTagName;
    option.selected = true;
    select.appendChild(option);
    newTagInput.value = "";
    showToast("标签已添加");
  });
  
  document.querySelector("#collectorResetBtn").addEventListener("click", () => {
    clearStagedFiles();
    stagedFiles.length = 0;
    document.querySelector("#collectorForm").reset();
    renderStagedList();
  });
  
  document.querySelector("#collectorStashBtn").addEventListener("click", () => {
    if (!validateCollectorForm()) return;
    if (!stagedFiles.length) {
      showToast("请先选择要上传的文件");
      return;
    }
    showToast(`已暂存 ${stagedFiles.length} 个文件`);
  });
  
  document.querySelector("#collectorForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!validateCollectorForm()) return;
    
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    const selectedTags = [...form.querySelector("[name='businessTags']").selectedOptions].map(opt => opt.value);
    const newTag = (data.newBusinessTag || "").trim();
    if (newTag && !selectedTags.includes(newTag)) selectedTags.push(newTag);
    
    if (!stagedFiles.length) {
      showToast("请先选择要上传的文件");
      return;
    }
    
    const fileCount = stagedFiles.length;
    showToast(`正在上传 ${fileCount} 个文件...`);
    
    for (const staged of stagedFiles) {
      const auditConfig = getAuditStatusConfig();
      const assetStatusConfig = getAssetStatusConfig();
      const asset = await createAssetFromFile(staged.file, { 
        validUntilDate: "", 
        customTags: selectedTags,
        auditStatus: auditConfig.pendingAudit,
        assetStatus: assetStatusConfig.pending,
        asset_source: "external",
        collect_id: task.id,
        collect_link: task.link
      });
      const targetGroup = db.groups.find((group) => group.name === task.group);
      asset.groupId = targetGroup?.id || "all";
      asset.creator = task.creator;
      asset.owner = data.author.trim();
      asset.department = data.department.trim();
      asset.contact = data.phone.trim();
      asset.email = data.email.trim();
      asset.desc = data.note.trim();
      db.assets.unshift(asset);
      logOperation('asset', asset.id, asset.name, 'asset.upload', `${asset.owner} 通过收集链接上传素材`);
    }
    
    const auditConfig = getAuditStatusConfig();
    task.auditStatus = auditConfig.pendingAudit;
    saveDb();
    clearStagedFiles();
    stagedFiles.length = 0;
    form.reset();
    renderStagedList();
    
    const result = document.querySelector("#collectorResult");
    result.classList.remove("hidden");
    result.innerHTML = `已提交 ${fileCount} 个素材，管理员可在「待入库」审核。<a href="${escapeAttr(getLibraryLink("pending"))}">进入待入库</a>`;
    showToast(`已成功提交 ${fileCount} 个素材到待入库`);
  });

  function clearStagedFiles() {
    stagedFiles.forEach((staged) => URL.revokeObjectURL(staged.previewUrl));
  }

  function renderStagedPreview(staged) {
    const fileType = getType(staged.file);
    const format = getFormat(staged.file);
    if (staged.file.type.startsWith("image/")) {
      return `<img src="${escapeAttr(staged.previewUrl)}" alt="${escapeAttr(staged.file.name)}" />`;
    }
    if (staged.file.type.startsWith("video/")) {
      return `<video src="${escapeAttr(staged.previewUrl)}" muted playsinline preload="metadata"></video>`;
    }
    return `<div class="collector-file-preview"><b>${escapeHtml(format)}</b><span>${escapeHtml(fileType)}</span></div>`;
  }
  
  function renderStagedList() {
    const section = document.querySelector("#collectorStagedSection");
    const list = document.querySelector("#collectorStagedList");
    if (!stagedFiles.length) {
      section.style.display = "none";
      return;
    }
    section.style.display = "block";
    list.innerHTML = stagedFiles.map((staged) => `
      <div class="collector-staged-item" data-staged-id="${escapeAttr(staged.id)}">
        <div class="collector-staged-thumb">${renderStagedPreview(staged)}</div>
        <div class="collector-staged-info">
          <span class="collector-staged-name">${escapeHtml(staged.file.name)}</span>
          <span class="collector-staged-size">${escapeHtml(getType(staged.file))} · ${escapeHtml(getFormat(staged.file))} · ${formatBytes(staged.file.size)}</span>
        </div>
        <button type="button" class="collector-staged-remove" data-remove-staged="${escapeAttr(staged.id)}">移除</button>
      </div>
    `).join("");
    
    list.querySelectorAll("[data-remove-staged]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.removeStaged;
        const index = stagedFiles.findIndex((item) => item.id === id);
        if (index > -1) {
          URL.revokeObjectURL(stagedFiles[index].previewUrl);
          stagedFiles.splice(index, 1);
          renderStagedList();
        }
      });
    });
  }
}

function renderSharePortal(token) {
  const [targetType, targetId, code] = token.split(":");
  const share = db.shares.find((item) => item.code === code && item.targetId === targetId && item.targetType === targetType);
  document.body.className = "collector-body";
  
  if (!share) {
    renderShareLandingError("分享链接无效", "请确认链接是否完整，或联系素材库管理员重新分享。");
    return;
  }
  
  normalizeShareSecurity(share);
  const shareStatusConfig = getShareStatusConfig();
  
  if (!share.status || !shareStatusConfig.activeCodes.includes(share.status)) {
    renderShareLandingError("分享已失效", "该分享链接已被创建者终止或已过期。");
    return;
  }
  
  if (isShareRecordExpired(share)) {
    share.status = shareStatusConfig.expired;
    saveDb();
    renderShareLandingError("分享已过期", "该分享链接的有效期已结束。");
    return;
  }
  
  if (share.maxVisits != null && share.visits >= share.maxVisits) {
    share.status = shareStatusConfig.expired;
    saveDb();
    renderShareLandingError("访问次数已达上限", "该分享链接的访问次数已用完。");
    return;
  }
  
  if (share.accessScope === "internal") {
    if (!currentUser || currentUser.id === "anonymous") {
      renderShareLandingLogin(token);
      return;
    }
    if (share.ownedByDept && currentUser.department !== share.ownedByDept && !isAdmin()) {
      renderShareLandingError("无权访问", "该分享仅限内部人员访问");
      return;
    }
  }
  
  if (share.requirePassword && share.password && sessionStorage.getItem(getSharePasswordKey(share)) !== share.password) {
    renderSharePasswordGate(token, share);
    return;
  }
  
  renderSharePortalContent(token, share);
}

function renderShareLandingError(title, message) {
  document.body.innerHTML = `<main class="collector-page collector-page--centered"><section class="collector-card"><div class="brand-mini"><b>DPCA</b><span>神龙汽车有限公司素材库</span></div><h1>${escapeHtml(title)}</h1><p>${escapeHtml(message)}</p></section></main>`;
}

function renderShareLandingLogin(token) {
  document.body.innerHTML = `
    <main class="collector-page collector-page--centered">
      <section class="collector-card">
        <div class="brand-mini"><b>DPCA</b><span>神龙汽车有限公司素材库</span></div>
        <h1>请登录后访问</h1>
        <p>该分享仅限企业内部成员访问，请先登录您的账号。</p>
        <form id="shareLoginForm">
          <label>用户名<input name="username" required /></label>
          <label>密码<input name="password" type="password" required /></label>
          <div class="collector-actions"><button type="submit" class="primary">登录</button></div>
        </form>
        <div class="collector-result hidden" id="shareLoginError">用户名或密码错误</div>
      </section>
    </main>`;
  
  document.querySelector("#shareLoginForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const user = (db.users || []).find((item) => item.username === data.username && item.password === data.password);
    if (!user) {
      document.querySelector("#shareLoginError")?.classList.remove("hidden");
      return;
    }
    localStorage.setItem(SESSION_USER_KEY, user.id);
    currentUser = getUserSessionInfo(user.id) || getAnonymousUser();
    buildUserGroupPermissionCache();
    renderSharePortal(token);
  });
}

function getSharePasswordKey(share) {
  return `dp-share-password:${share.targetType}:${share.targetId}:${share.code}`;
}

function getSharePortalAssets(targetType, targetId) {
  const statusConfig = getAssetStatusConfig();
  const isActive = (asset) => !statusConfig.deletedCodes.includes(asset.assetStatus);
  if (targetType === "asset") return db.assets.filter((asset) => asset.id === targetId && isActive(asset));
  if (targetType === "basket") return db.assets.filter((asset) => targetId.split(",").includes(asset.id) && isActive(asset));
  return db.assets.filter((asset) => targetId === "all" ? isActive(asset) : asset.groupId === targetId && isActive(asset));
}

function renderSharePasswordGate(token, share) {
  document.body.innerHTML = `
    <main class="collector-page collector-page--centered">
      <section class="collector-card share-password-card">
        <div class="brand-mini"><b>DPCA</b><span>神龙汽车有限公司素材库</span></div>
        <h1>${escapeHtml(share.group || "分享素材")}</h1>
        <p>该分享已开启访问密码，请输入密码后查看素材。</p>
        <form id="sharePasswordForm">
          <label>访问密码<input name="password" type="password" autocomplete="current-password" required /></label>
          <div class="collector-actions"><button type="submit">进入分享页</button></div>
        </form>
        <div class="collector-result hidden" id="sharePasswordError">访问密码不正确，请重新输入。</div>
      </section>
    </main>`;
  document.querySelector("#sharePasswordForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const password = new FormData(event.currentTarget).get("password");
    if (password !== share.password) {
      document.querySelector("#sharePasswordError")?.classList.remove("hidden");
      return;
    }
    sessionStorage.setItem(getSharePasswordKey(share), share.password);
    renderSharePortalContent(token, share);
  });
}

function renderSharePortalContent(token, share) {
  const nextVisits = (share.visits || 0) + 1;
  if (share.maxVisits != null && nextVisits > share.maxVisits) {
    share.status = getShareStatusConfig().expired;
    saveDb();
    renderShareLandingError("访问次数已达上限", "该分享链接的访问次数已用完。");
    return;
  }
  share.visits = nextVisits;
  saveDb();
  
  const [targetType, targetId] = token.split(":");
  const assets = getSharePortalAssets(targetType, targetId);
  const canDownload = share.contentPermission === "download";
  
  document.body.innerHTML = `
    <main class="share-page">
      <header class="share-hero">
        <div class="brand-mini"><b>DPCA</b><span>神龙汽车有限公司素材库</span></div>
        <h1>${escapeHtml(share.group || "分享素材")}</h1>
        <p>${escapeHtml(share.access)} · ${share.requirePassword ? "需要访问密码" : "无需访问密码"} · 有效期：${escapeHtml(formatDateTimeDisplay(share.expiresAt))}</p>
        <div class="share-download-toolbar ${canDownload ? "" : "hidden"}">
          <span id="shareSelectedCount">已选择 0 项</span>
          <button id="shareBatchDownload" type="button">批量下载</button>
          <button class="primary" id="shareDownloadAll" type="button">一键全部下载</button>
        </div>
      </header>
      <section class="share-grid">
        ${assets.map((asset) => `
          <article class="share-card" data-share-asset="${escapeAttr(asset.id)}">
            <label class="share-card-check"><input class="share-asset-check" type="checkbox" value="${escapeAttr(asset.id)}" ${canDownload ? "" : "disabled"} /> 选择</label>
            <div class="thumb">${asset.mime?.startsWith("image/") ? `<img src="${escapeAttr(asset.src)}" alt="${escapeAttr(asset.name)}" />` : `<div class="file-tile"><b>${escapeHtml(asset.format)}</b></div>`}</div>
            <h2>${escapeHtml(asset.name)}</h2>
            <p>${escapeHtml(asset.format)} · ${formatBytes(asset.sizeBytes)}</p>
            ${canDownload ? `<a download="${escapeAttr(asset.name)}.${escapeAttr(asset.format.toLowerCase())}" href="${escapeAttr(asset.src)}">下载素材</a>` : ""}
          </article>`).join("") || renderEmpty("暂无可分享素材")}
      </section>
    </main>`;
  bindSharePortalDownloads(share, assets);
}

function downloadShareAssets(share, assets) {
  if (!assets.length) return showToast("请先选择需要下载的素材");
  assets.forEach((asset, index) => {
    setTimeout(() => {
      const link = document.createElement("a");
      link.href = asset.src;
      link.download = `${asset.name}.${String(asset.format || "file").toLowerCase()}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    }, index * 300);
    asset.download = (asset.download || 0) + 1;
  });
  share.downloads = (share.downloads || 0) + assets.length;
  saveDb();
  showToast(`正在下载 ${assets.length} 个素材...`);
}

function bindSharePortalDownloads(share, assets) {
  const selectedCount = document.querySelector("#shareSelectedCount");
  const getSelectedAssets = () => {
    const ids = [...document.querySelectorAll(".share-asset-check:checked")].map((input) => input.value);
    return assets.filter((asset) => ids.includes(asset.id));
  };
  const updateSelectedCount = () => {
    const count = getSelectedAssets().length;
    if (selectedCount) selectedCount.textContent = `已选择 ${count} 项`;
  };
  document.querySelectorAll(".share-asset-check").forEach((input) => input.addEventListener("change", updateSelectedCount));
  document.querySelector("#shareBatchDownload")?.addEventListener("click", () => downloadShareAssets(share, getSelectedAssets()));
  document.querySelector("#shareDownloadAll")?.addEventListener("click", () => downloadShareAssets(share, assets));
  document.querySelectorAll(".share-card a[download]").forEach((link) => {
    link.addEventListener("click", () => {
      const asset = assets.find((item) => item.id === link.closest(".share-card")?.dataset.shareAsset);
      if (!asset) return;
      asset.download = (asset.download || 0) + 1;
      share.downloads = (share.downloads || 0) + 1;
      saveDb();
    });
  });
}

function ensureRuntimeElements() {
  const fileInput = document.createElement("input");
  fileInput.id = "fileInput";
  fileInput.type = "file";
  fileInput.multiple = true;
  fileInput.accept = getAllUploadAccept();
  fileInput.hidden = true;

  const folderInput = document.createElement("input");
  folderInput.id = "folderInput";
  folderInput.type = "file";
  folderInput.multiple = true;
  folderInput.accept = getAllUploadAccept();
  folderInput.webkitdirectory = true;
  folderInput.hidden = true;

  const modal = createTemplateNode("tplFormModal") || document.createElement("div");
  if (!modal.id) {
    modal.id = "formModal";
    modal.className = "modal hidden";
    modal.innerHTML = `<div class="modal-card form-card"><header><h2 id="formTitle"></h2><button class="plain-icon" id="formClose" type="button"><span data-icon="x"></span></button></header><form id="formBody"></form></div>`;
  }

  const toast = document.createElement("div");
  toast.id = "toast";
  toast.className = "toast hidden";

  const login = document.createElement("section");
  login.id = "loginPage";
  login.className = "login-page hidden";
  login.innerHTML = `
    <form class="login-card" id="loginForm">
      <div class="login-brand"><span>DPCA</span><strong>素材库</strong></div>
      <h1>账号登录</h1>
      <p>使用系统管理中的用户账号进入素材库。</p>
      <label>登录用户名<input id="loginUsername" name="username" autocomplete="username" value="admin" required /></label>
      <label>密码<input id="loginPassword" name="password" type="password" autocomplete="current-password" value="admin123" required /></label>
      <label>登录入口<select id="loginEntry" name="loginEntry"><option>网页登录</option><option>飞书登录</option><option>企微登录</option></select></label>
      <div class="login-hint">默认管理员：admin / admin123</div>
      <button class="primary" type="submit">登录</button>
    </form>`;

  if (!document.querySelector("#viewerResizer")) {
    const detailPanel = document.querySelector(".detail-panel");
    const resizer = document.createElement("div");
    resizer.id = "viewerResizer";
    resizer.className = "viewer-resizer";
    resizer.setAttribute("role", "separator");
    resizer.setAttribute("aria-orientation", "vertical");
    resizer.setAttribute("aria-label", "调整详情面板宽度");
    detailPanel?.before(resizer);
  }

  document.body.append(fileInput, folderInput, modal, toast, login);
}

function showLoginPage() {
  document.querySelector("#loginPage")?.classList.remove("hidden");
  setTimeout(() => document.querySelector("#loginUsername")?.focus(), 0);
}

function hideLoginPage() {
  document.querySelector("#loginPage")?.classList.add("hidden");
}

function handleLoginSubmit(event) {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.target));
  const username = String(data.username || "").trim();
  const password = String(data.password || "");
  const user = (db.users || []).find((item) => item.username === username && item.password === password);
  if (!user) {
    showToast("用户名或密码错误");
    return;
  }
  if (user.status !== getUserStatusConfig().enabled) {
    showToast("该账号已停用，请联系管理员");
    return;
  }
  const loginAt = nowText();
  const loginEntry = data.loginEntry || "网页登录";
  user.lastLogin = loginAt;
  db.loginLogs = db.loginLogs || [];
  db.loginLogs.unshift({
    id: `login-${Date.now()}`,
    username: user.username,
    name: user.name,
    loginAt,
    ip: getLoginIpAddress(),
    entry: loginEntry,
  });
  db.loginLogs = db.loginLogs.slice(0, 500);
  saveDb();
  localStorage.setItem(SESSION_USER_KEY, user.id);
  currentUser = getUserSessionInfo(user.id) || getAnonymousUser();
  hideLoginPage();
  renderShell();
  normalizePageState();
  render();
  showToast(`欢迎回来，${currentUser.name}`);
}

function getLoginIpAddress() {
  return "127.0.0.1";
}

function logoutCurrentUser() {
  localStorage.removeItem(SESSION_USER_KEY);
  currentUser = getAnonymousUser();
  renderShell();
  state.page = "all";
  state.groupId = "all";
  render();
  showLoginPage();
}

function createTemplateNode(id) {
  const template = document.querySelector(`#${id}`);
  return template?.content?.firstElementChild?.cloneNode(true) || null;
}

function renderHtmlTemplate(id, values = {}) {
  const template = document.querySelector(`#${id}`);
  if (!template) return "";
  return template.innerHTML.replace(/\{\{([A-Z0-9_]+)\}\}/g, (_, key) => values[key] ?? "");
}

function renderShell() {
  document.title = "素材库";
  document.body.dataset.theme = state.theme;
  document.querySelector(".brand-mark").textContent = "DPCA";
  document.querySelector(".brand-text strong").textContent = "神龙汽车有限公司";
  document.querySelector(".brand b").textContent = "素材库";
  document.querySelector("#globalSearch").placeholder = "试试在搜索词中增加文件格式，如：手册pdf";
  const userButton = document.querySelector("#userButton");
  if (userButton) {
    userButton.textContent = (currentUser.name || "未").slice(0, 1).toUpperCase();
    userButton.title = isLoggedIn() ? `${currentUser.name} / ${currentUser.role}` : "未登录";
  }
  if (!document.querySelector("#themeToggle")) {
    const toggle = document.createElement("button");
    toggle.id = "themeToggle";
    toggle.className = "theme-toggle";
    toggle.type = "button";
    toggle.title = "切换浅色/深色";
    document.querySelector(".top-icons").prepend(toggle);
  }
  if (!document.querySelector("#basketButton")) {
    const basketButton = document.createElement("button");
    basketButton.id = "basketButton";
    basketButton.className = "basket-button";
    basketButton.type = "button";
    basketButton.title = "素材篮";
    basketButton.setAttribute("aria-label", "打开素材篮");
    basketButton.innerHTML = `<span data-icon="basket"></span><i id="basketCount">0</i>`;
    const topIcons = document.querySelector(".top-icons");
    topIcons.insertBefore(basketButton, topIcons.querySelector("#themeToggle")?.nextSibling || topIcons.firstChild);
  }
  document.querySelector("#themeToggle").textContent = state.theme === "dark" ? "浅" : "深";
  updateBasketCount();
  renderMainNav();

  renderFilterChips();
  renderFilterConfig();
}

function renderMainNav() {
  const root = getRootMenu();
  const mainNav = document.querySelector("#mainNav");
  if (!mainNav) return;

  if (root && !state.navTreeInitialized) {
    const expandAllGroups = (parentId) => {
      getVisibleNavMenuChildren(parentId).forEach((menu) => {
        if (menu.category !== "page") {
          state.navExpandedMenuIds.add(menu.id);
          expandAllGroups(menu.id);
        }
      });
    };
    expandAllGroups(root.id);
    expandNavAncestorsByPage(state.page);
    state.navTreeInitialized = true;
  }

  mainNav.innerHTML = root ? renderMainNavNodes(root.id, 0) : "";
}

function renderMainNavNodes(parentId, depth) {
  return getVisibleNavMenuChildren(parentId).map((menu) => {
    const indent = depth * 16;
    if (menu.category === "page") {
      const isActive = state.page === menu.page;
      const icon = menu.icon || "•";
      return `<button class="nav-item nav-page ${isActive ? "active" : ""}" data-page="${escapeAttr(menu.page)}" style="padding-left: ${16 + indent}px" type="button"><span>${escapeHtml(icon)}</span><span>${escapeHtml(menu.name)}</span><span></span></button>`;
    }

    const isExpanded = state.navExpandedMenuIds?.has(menu.id);
    const isActive = getMenuDescendantPageMenus(menu.id).some((item) => item.page === state.page);
    const childrenHtml = isExpanded ? renderMainNavNodes(menu.id, depth + 1) : "";
    return `<div class="nav-tree-node">
      <button class="nav-item nav-group ${isActive ? "active" : ""}" data-nav-toggle="${escapeAttr(menu.id)}" style="padding-left: ${16 + indent}px" type="button"><span class="nav-expand">${isExpanded ? "-" : "+"}</span><span>${escapeHtml(menu.name)}</span><span></span></button>
      ${childrenHtml ? `<div class="nav-tree-children">${childrenHtml}</div>` : ""}
    </div>`;
  }).join("");
}

function renderFilterChips() {
  els.filters.innerHTML = state.visibleFilters.map((item) => {
    const selections = getFilterSelections(item);
    const active = selections.length ? `<small>${escapeHtml(formatFilterSelections(selections))}</small>` : "";
    return `<button class="filter-chip ${selections.length ? "active" : ""}" data-filter="${item}" type="button">${item}${active}</button>`;
  }).join("");
}

function renderFilterConfig() {
  const allFilters = getConfigurableFilters();
  els.tagBank.innerHTML = allFilters.map((item) => {
    const selected = state.visibleFilters.includes(item);
    return `<button class="${selected ? "" : "inactive"}" data-config-filter="${item}" type="button">${item}</button>`;
  }).join("");
  els.selectedTags.innerHTML = state.visibleFilters.map((item) => `<span data-remove-config="${item}">${item} ×</span>`).join("");
}

function bindEvents() {
  const bindModalClose = (modalId, closeFn, options = {}) => {
    const { backdrop = true } = options;
    const idPrefix = modalId.replace(/Modal$/, "");
    document.querySelector(`#${idPrefix}Cancel`)?.addEventListener("click", closeFn);
    document.querySelector(`#${idPrefix}Close`)?.addEventListener("click", closeFn);
    if (backdrop) {
      document.querySelector(`#${modalId}`)?.addEventListener("click", (event) => {
        if (event.target.id === modalId) closeFn();
      });
    }
  };

  document.querySelector("#loginForm")?.addEventListener("submit", handleLoginSubmit);

  // Mobile sidebar toggle
  if (els.mobileMenuToggle) {
    els.mobileMenuToggle.addEventListener("click", () => {
      els.sidebar.classList.add("open");
      els.sidebarOverlay.classList.remove("hidden");
    });
  }

  if (els.sidebarClose) {
    els.sidebarClose.addEventListener("click", closeMobileSidebar);
  }

  if (els.sidebarOverlay) {
    els.sidebarOverlay.addEventListener("click", closeMobileSidebar);
  }

  function closeMobileSidebar() {
    els.sidebar.classList.remove("open");
    els.sidebarOverlay.classList.add("hidden");
  }

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".menu-pop") && !event.target.closest("[data-more]") && !event.target.closest("[data-filter]") && !event.target.closest("[data-group-menu]") && !event.target.closest(".app-grid")) hideMenus();
    if (!event.target.closest(".sort-menu")) document.querySelectorAll(".sort-menu").forEach((item) => item.classList.remove("open"));
  });

  els.mainNav.addEventListener("click", (event) => {
    const toggleButton = event.target.closest("[data-nav-toggle]");
    if (toggleButton) {
      event.stopPropagation();
      const id = toggleButton.dataset.navToggle;
      if (!state.navExpandedMenuIds) state.navExpandedMenuIds = new Set();
      if (state.navExpandedMenuIds.has(id)) state.navExpandedMenuIds.delete(id);
      else state.navExpandedMenuIds.add(id);
      renderMainNav();
      return;
    }
    const button = event.target.closest("[data-page]");
    if (!button) return;
    state.page = button.dataset.page;
    state.groupId = "all";
    expandNavAncestorsByPage(state.page);
    render();
  });

  const allGroupsButton = document.querySelector(".group-head strong");
  if (allGroupsButton) {
    allGroupsButton.setAttribute("role", "button");
    allGroupsButton.setAttribute("tabindex", "0");
    allGroupsButton.setAttribute("title", "查看全部素材组中的全部素材");
    allGroupsButton.style.cursor = "pointer";
    allGroupsButton.addEventListener("click", openAllMaterials);
    allGroupsButton.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openAllMaterials();
      }
    });
  }

  els.groupTree.addEventListener("click", (event) => {
    const toggleButton = event.target.closest("[data-group-toggle]");
    if (toggleButton) {
      event.stopPropagation();
      toggleGroupCollapse(toggleButton.dataset.groupToggle);
      return;
    }
    const menuButton = event.target.closest("[data-group-menu]");
    if (menuButton) {
      event.stopPropagation();
      showGroupMenu(menuButton, menuButton.dataset.groupMenu);
      return;
    }
    const deleteButton = event.target.closest("[data-delete-group]");
    if (deleteButton) {
      event.stopPropagation();
      deleteGroup(deleteButton.dataset.deleteGroup);
      return;
    }
    const button = event.target.closest("[data-group]");
    if (!button) return;
    state.page = "all";
    state.groupId = button.dataset.group;
    render();
  });

  document.querySelector("#createGroupButton")?.addEventListener("click", (event) => {
    event.stopPropagation();
    openGroupModal();
  });
  document.querySelector("#sortGroupsButton")?.addEventListener("click", (event) => {
    event.stopPropagation();
    db.groups.sort((a, b) => (a.depth || 0) - (b.depth || 0) || a.name.localeCompare(b.name, "zh-CN"));
    saveDb();
    render();
    showToast("素材组已按名称排序");
  });
  bindSidebarResize();
  document.querySelector(".app-grid").addEventListener("click", (event) => {
    if (els.moreMenu.classList.contains("hidden")) {
      showAppMenu(event.currentTarget);
    } else {
      hideMenus();
    }
  });
  document.querySelector("#basketButton")?.addEventListener("click", () => {
    const drawer = document.querySelector("#basketDrawer");
    if (drawer?.classList.contains("hidden")) {
      openBasketDrawer();
    } else {
      closeBasketDrawer();
    }
  });
  document.querySelector("#notificationButton")?.addEventListener("click", (event) => {
    event.stopPropagation();
    const menu = document.querySelector("#moreMenu");
    if (menu?.classList.contains("hidden")) {
      showTopIconMenu(event.currentTarget, "notification");
    } else {
      hideMenus();
    }
  });
  document.querySelector("#languageButton")?.addEventListener("click", (event) => {
    event.stopPropagation();
    const menu = document.querySelector("#moreMenu");
    if (menu?.classList.contains("hidden")) {
      showTopIconMenu(event.currentTarget, "language");
    } else {
      hideMenus();
    }
  });
  document.querySelector("#userButton")?.addEventListener("click", (event) => {
    event.stopPropagation();
    const menu = document.querySelector("#moreMenu");
    if (menu?.classList.contains("hidden")) {
      showTopIconMenu(event.currentTarget, "user");
    } else {
      hideMenus();
    }
  });
  document.querySelectorAll(".top-icons button").forEach((button) => {
    if (button.id === "themeToggle" || button.id === "basketButton" || button.id === "notificationButton" || button.id === "languageButton" || button.id === "userButton") return;
    button.addEventListener("click", () => showToast(`${button.getAttribute("title") || "用户菜单"}功能入口已打开`));
  });
  document.querySelector("#basketOverlay")?.addEventListener("click", closeBasketDrawer);
  document.querySelector("#restoreSelectedRecycle")?.addEventListener("click", restoreSelectedRecycleAssets);
  document.querySelector("#emptyRecycle")?.addEventListener("click", emptyRecycleBin);
  document.querySelector("#sortRecycleByDeletedAt")?.addEventListener("click", toggleRecycleDeletedTimeSort);
  document.querySelector("#addTagButton")?.addEventListener("click", openAddTagModal);
  document.querySelector("#mergeTagButton")?.addEventListener("click", openMergeTagModal);
  document.querySelector("#newCollectTask")?.addEventListener("click", openCollectTaskModal);
  els.globalSearch.addEventListener("input", window.AppInfra.utils.debounce((event) => {
    state.query = event.target.value.trim();
    render();
  }, 300));

  els.filters.addEventListener("click", (event) => {
    const button = event.target.closest("[data-filter]");
    if (!button) return;
    const label = button.dataset.filter;
    if (state.activeFilter === label) {
      hideMenus();
      state.activeFilter = null;
    } else {
      showFilterMenu(button, label);
      state.activeFilter = label;
    }
  });

  els.viewSwitch.addEventListener("click", (event) => {
    const button = event.target.closest("[data-view]");
    if (!button) return;
    state.view = button.dataset.view;
    render();
  });

  els.sizeSlider.addEventListener("input", (event) => {
    document.documentElement.style.setProperty("--card-width", `${event.target.value}px`);
  });

  document.querySelector("#showGroups")?.addEventListener("change", (event) => {
    state.showGroupDescendants = event.target.checked;
    render();
  });

  els.sortButton.addEventListener("click", (event) => {
    event.stopPropagation();
    els.sortButton.closest(".sort-menu")?.classList.toggle("open");
  });
  els.sortDropdown.addEventListener("click", (event) => {
    const button = event.target.closest("[data-sort]");
    if (!button) return;
    state.sort = button.dataset.sort;
    els.sortLabel.textContent = state.sort;
    els.sortButton.closest(".sort-menu")?.classList.remove("open");
    render();
  });

  els.filterConfig?.addEventListener("click", () => {
    renderFilterConfig();
    els.filterModal.classList.remove("hidden");
  });
  els.clearFilters?.addEventListener("click", () => {
    state.filters = {};
    render();
  });
  document.querySelector('[title="字段配置"]')?.addEventListener("click", openFieldConfigModal);
  els.tagBank.addEventListener("click", (event) => {
    const button = event.target.closest("[data-config-filter]");
    if (!button) return;
    const label = button.dataset.configFilter;
    if (state.visibleFilters.includes(label)) state.visibleFilters = state.visibleFilters.filter((item) => item !== label);
    else state.visibleFilters.push(label);
    renderFilterConfig();
  });
  els.selectedTags.addEventListener("click", (event) => {
    const tag = event.target.closest("[data-remove-config]");
    if (!tag) return;
    state.visibleFilters = state.visibleFilters.filter((item) => item !== tag.dataset.removeConfig);
    delete state.filters[tag.dataset.removeConfig];
    renderFilterConfig();
  });
  document.querySelectorAll("[data-close-modal]").forEach((button) => button.addEventListener("click", () => {
    renderFilterChips();
    els.filterModal.classList.add("hidden");
  }));
  els.imageSearchButton.addEventListener("click", () => {
    state.similar = true;
    state.page = "all";
    render();
  });
  els.clearSimilar.addEventListener("click", () => {
    state.similar = false;
    render();
  });
  els.closeSimilar.addEventListener("click", () => {
    state.similar = false;
    render();
  });

  document.querySelector("#fileInput").addEventListener("change", (event) => openUploadSettingsModal(event.target.files, "file"));
  document.querySelector("#folderInput").addEventListener("change", (event) => openUploadSettingsModal(event.target.files, "folder"));
  document.querySelector("#themeToggle").addEventListener("click", () => {
    state.theme = state.theme === "dark" ? "light" : "dark";
    localStorage.setItem("dp-material-library-theme", state.theme);
    document.body.dataset.theme = state.theme;
    document.querySelector("#themeToggle").textContent = state.theme === "dark" ? "浅" : "深";
    document.querySelector("#themeToggle").setAttribute("aria-pressed", state.theme === "dark" ? "true" : "false");
  });
  document.querySelector("#formClose").addEventListener("click", closeFormModal);
  document.querySelector("#formModal").addEventListener("click", (event) => {
    if (event.target.id === "formModal") closeFormModal();
  });

  els.closeViewer.addEventListener("click", () => els.viewer.classList.add("hidden"));
  bindViewerPan();
  bindViewerResize();
  document.querySelector(".add-to-group").addEventListener("click", () => openAssignGroupModal(state.selectedAssetId));
  document.querySelectorAll("[data-viewer-nav]").forEach((button) => {
    button.addEventListener("click", () => changeViewerAsset(button.dataset.viewerNav));
  });
  document.querySelector(".detail-panel footer").addEventListener("click", (event) => {
    const button = event.target.closest("[data-detail-action]");
    if (!button) return;
    const action = button.dataset.detailAction;
    const asset = findAsset(state.selectedAssetId);
    if (action === "download") downloadAsset(state.selectedAssetId);
    if (action === "more") showViewerMoreMenu(button);
    if (action === "share") openShareAssetModal(state.selectedAssetId);
    if (action === "edit") openEditAssetModal(state.selectedAssetId);
    if (action === "permission") {
      if (canManageAsset(asset)) openPermissionModal(state.selectedAssetId);
      else openPermissionRequestModal(state.selectedAssetId);
    }
    if (action === "group") openAssignGroupModal(state.selectedAssetId);
  });
  els.detailTabs.addEventListener("click", (event) => {
    const button = event.target.closest("[data-tab]");
    if (!button) return;
    state.detailTab = button.dataset.tab;
    renderViewer();
  });

  // 页面操作按钮事件绑定
  document.querySelector("#uploadButton")?.addEventListener("click", (event) => {
    event.stopPropagation();
    document.querySelector(".upload-menu")?.classList.toggle("open");
  });
  document.querySelector("#uploadDropdown")?.addEventListener("click", handleUploadMenu);
  document.querySelector("#newGroupAction")?.addEventListener("click", openGroupModal);
  document.querySelector("#deleteSelectedTop")?.addEventListener("click", deleteSelectedAssets);
  document.querySelector("#deleteSelectedPending")?.addEventListener("click", deleteSelectedAssets);
  document.querySelector("#shareCurrent")?.addEventListener("click", openShareCurrentModal);
  document.querySelector("#collectCurrent")?.addEventListener("click", () => {
    const canBatch = state.groupId ? canContributeToGroup(state.groupId) : canContributeToGroup(null);
    if (!canBatch) {
      return showToast("权限不足，无法创建收集任务。请联系管理员申请权限。");
    }
    openCollectTaskModal(getGroupName(state.groupId));
  });
  document.querySelector("#approveSelected")?.addEventListener("click", approveSelectedAssets);

  // 权限模态框取消按钮
  bindModalClose("permissionRequestModal", closePermissionRequestModal);
  bindModalClose("permissionModal", closePermissionModal);

  // 素材篮事件绑定
  document.querySelector("#basketClose")?.addEventListener("click", closeBasketDrawer);
  document.querySelector("#basketClear")?.addEventListener("click", () => {
    state.selectedIds.clear();
    closeBasketDrawer();
    render();
  });
  document.querySelector("#basketDelete")?.addEventListener("click", () => {
    if (!state.selectedIds.size) return;
    const assets = getSelectedAssets();
    const canDeleteAll = assets.every((asset) => canDeleteAsset(asset));
    if (!canDeleteAll) {
      showToast("部分素材没有删除权限");
      return;
    }
    const count = assets.length;
    const assetStatusConfig = getAssetStatusConfig();
    assets.forEach((asset) => {
      asset.assetStatus = assetStatusConfig.deleted;
      asset.updatedAt = nowText();
      asset.deletedAt = asset.updatedAt;
      logOperation('asset', asset.id, asset.name, 'asset.delete', '删除了素材（软删除）');
    });
    state.selectedIds.clear();
    saveDb();
    closeBasketDrawer();
    render();
    showToast(`已将 ${count} 个素材移入回收站`);
  });
  document.querySelector("#basketDownload")?.addEventListener("click", downloadSelectedAssets);
  document.querySelector("#basketValidity")?.addEventListener("click", openBasketValidityModal);
  document.querySelector("#basketShare")?.addEventListener("click", openBasketShareModal);
  
  document.querySelector("#basketList")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-remove-basket]");
    if (button) {
      state.selectedIds.delete(button.dataset.removeBasket);
      render();
    }
  });

  // 素材篮有效期模态框事件
  bindModalClose("basketValidityModal", closeBasketValidityModal);
  
  const basketValidityForm = document.querySelector("#basketValidityForm");
  basketValidityForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const assets = getSelectedAssets();
    const canEditAll = assets.every((asset) => canEditAsset(asset));
    if (!canEditAll) {
      showToast("部分素材没有编辑权限");
      return;
    }
    const date = document.querySelector("#basketValidityDate").value;
    const time = document.querySelector("#basketValidityTime").value || "23:59";
    const validUntil = date ? joinDateTime(date, time) : calculateExpireTime("永久有效");
    assets.forEach((asset) => {
      asset.validUntilDate = validUntil;
      asset.validUntil = validUntil;
      asset.updatedAt = nowText();
      logOperation('asset', asset.id, asset.name, 'asset.edit', '设置了有效期');
    });
    saveDb();
    closeBasketValidityModal();
    render();
    showToast(`已更新 ${assets.length} 个素材的有效期`);
  });

  // 素材篮分享模态框事件
  bindModalClose("basketShareModal", closeBasketShareModal);
  
  let createdBasketLink = "";
  const basketShareForm = document.querySelector("#basketShareForm");
  basketShareForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (createdBasketLink) return;
    
    const formData = getShareFormData("basket");
    if (!formData) {
      showToast("请设置访问密码");
      return;
    }
    
    const assets = getSelectedAssets();
    const canShareAll = assets.every((asset) => canCreateShare(asset, formData.contentPermission));
    if (!canShareAll) {
      showToast("部分素材没有分享权限");
      return;
    }
    const targetId = assets.map((asset) => asset.id).join(",");
    const code = Math.random().toString(36).slice(2, 8);
    const link = getShareLink("basket", targetId, code);
    const shareName = formData.shareName.trim() || `素材篮 ${assets.length} 项`;
    
    const share = { 
      id: `share-${Date.now()}`,
      group: shareName, 
      user: currentUser.username, 
      access: shareName, 
      visits: 0, 
      views: 0, 
      downloads: 0, 
      sharedAt: nowText(), 
      expiresAt: formData.expiresAt, 
      targetType: "basket", 
      targetId, 
      code, 
      link, 
      requirePassword: formData.requirePassword,
      password: formData.password,
      accessScope: formData.accessScope,
      contentPermission: formData.contentPermission,
      maxVisits: formData.maxVisits,
      status: "active",
      ownedBy: currentUser.username,
      ownedByDept: currentUser.department || "",
      createdBy: currentUser.username,
      updatedAt: nowText(),
      logs: []
    };
    db.shares.unshift(share);
    logOperation('share', share.id, shareName, 'share.create', '创建了分享链接');
    assets.forEach((asset) => {
      asset.share += 1;
    });
    saveDb();
    render();
    createdBasketLink = link;
    document.querySelector("#basketShareLink").value = link;
    document.querySelector("#basketSharePassword").value = formData.password;
    document.querySelector("#basketShareCopy").disabled = false;
    showToast("素材篮分享记录已创建，链接已生成");
  });
  
  document.querySelector("#basketShareCopy")?.addEventListener("click", () => {
    if (createdBasketLink) copyText(createdBasketLink);
  });

  // 标签相关模态框事件
  bindModalClose("addTagModal", closeAddTagModal);
  document.querySelector("#addTagType")?.addEventListener("change", toggleAddAiFields);
  document.querySelector("#addTagForm")?.addEventListener("submit", handleAddTagSubmit);

  bindModalClose("editTagModal", closeEditTagModal);
  document.querySelector("#editTagType")?.addEventListener("change", toggleEditAiFields);
  document.querySelector("#editTagForm")?.addEventListener("submit", handleEditTagSubmit);

  bindModalClose("mergeTagModal", closeMergeTagModal);
  document.querySelector("#mergeClearSelected")?.addEventListener("click", clearMergeTagSelection);
  document.querySelector("#mergeTagForm")?.addEventListener("submit", handleMergeTagSubmit);

  // 素材相关模态框事件
  bindModalClose("editAssetModal", closeEditAssetModal);
  document.querySelector("#editAssetForm")?.addEventListener("submit", handleEditAssetSubmit);

  bindModalClose("shareAssetModal", closeShareAssetModal);
  document.querySelector("#shareAssetForm")?.addEventListener("submit", handleShareAssetSubmit);
  document.querySelector("#shareAssetCopy")?.addEventListener("click", () => {
    if (shareAssetCreatedLink) copyText(shareAssetCreatedLink);
  });

  // 素材组相关模态框事件
  bindModalClose("addGroupModal", closeAddGroupModal);
  document.querySelector("#addGroupForm")?.addEventListener("submit", handleAddGroupSubmit);

  bindModalClose("editGroupModal", closeEditGroupModal);
  document.querySelector("#editGroupForm")?.addEventListener("submit", handleEditGroupSubmit);

  bindModalClose("moveGroupModal", closeMoveGroupModal);
  document.querySelector("#moveGroupForm")?.addEventListener("submit", handleMoveGroupSubmit);

  bindModalClose("addToGroupModal", closeAddToGroupModal);
  document.querySelector("#addToGroupForm")?.addEventListener("submit", handleAddToGroupSubmit);

  // 其他模态框事件
  bindModalClose("uploadSettingsModal", () => {
    document.querySelector("#uploadSettingsModal").classList.add("hidden");
  }, { backdrop: false });

  bindModalClose("cloudImportModal", () => {
    document.querySelector("#cloudImportModal").classList.add("hidden");
  }, { backdrop: false });

  bindModalClose("collectTaskModal", closeCollectTaskModal);
  document.querySelector("#collectTaskForm")?.addEventListener("submit", handleCollectTaskSubmit);

  bindModalClose("shareGroupModal", closeShareGroupModal);
  document.querySelector("#shareGroupForm")?.addEventListener("submit", handleShareGroupSubmit);
  document.querySelector("#shareGroupCopy")?.addEventListener("click", () => {
    if (shareGroupCreatedLink) copyText(shareGroupCreatedLink);
  });

  bindModalClose("inviteTaskModal", () => {
    document.querySelector("#inviteTaskModal").classList.add("hidden");
  }, { backdrop: false });

  // moreMenu 按钮事件
  els.moreMenu?.addEventListener("click", (event) => {
    const actionButton = event.target.closest("[data-app-action]");
    if (actionButton) {
      const action = actionButton.dataset.appAction;
      if (action === "home") {
        state.page = "all";
        state.groupId = "all";
        render();
      }
      if (action === "upload") document.querySelector("#fileInput")?.click();
      if (action === "group") openGroupModal();
      if (action === "recycle") {
        state.page = "recycle";
        render();
      }
      hideMenus();
    }
  });
}
