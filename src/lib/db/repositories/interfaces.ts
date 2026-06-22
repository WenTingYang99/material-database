import type { Asset, AssetListResult, AssetQueryParams } from "@/lib/types/asset";
import type { MaterialGroup } from "@/lib/types/group";
import type { Tag } from "@/lib/types/tag";
import type { User } from "@/lib/types/user";

export interface IAssetRepository {
  findAll(params?: AssetQueryParams): Promise<AssetListResult>;
  findById(id: string): Promise<Asset | null>;
  create(data: Omit<Asset, "id" | "createdAt" | "updatedAt">): Promise<Asset>;
  update(id: string, data: Partial<Asset>): Promise<Asset>;
  delete(id: string): Promise<void>;
  restore(id: string): Promise<void>;
  batchUpdateValidity(ids: string[], validUntil: string): Promise<void>;
}

export interface IGroupRepository {
  findAll(): Promise<MaterialGroup[]>;
  findById(id: string): Promise<MaterialGroup | null>;
  create(data: CreateGroupInput): Promise<MaterialGroup>;
  update(id: string, data: Partial<CreateGroupInput>): Promise<MaterialGroup>;
  delete(id: string): Promise<void>;
}

export interface ITagRepository {
  findAll(): Promise<Tag[]>;
  create(data: CreateTagInput): Promise<Tag>;
  update(id: string, data: UpdateTagInput): Promise<Tag>;
  merge(sourceId: string, targetId: string): Promise<void>;
}

export interface IUserRepository {
  findByUsername(username: string): Promise<User | null>;
}

export interface IShareRepository {
  findAll(): Promise<DbShareRecord[]>;
  findByCode(code: string): Promise<DbShareRecord | null>;
  findTargets(shareId: number): Promise<DbShareTargetRel[]>;
  create(data: CreateShareInput): Promise<DbShareRecord>;
}

export interface ICollectRepository {
  findTasks(): Promise<DbCollectTask[]>;
  findTaskByCode(code: string): Promise<DbCollectTask | null>;
  createTask(data: CreateCollectTaskInput): Promise<DbCollectTask>;
  createSubmission(data: CreateCollectSubmissionInput): Promise<DbCollectSubmission>;
  addUploadFile(data: CreateCollectUploadFileInput): Promise<DbCollectUploadFile>;
  findSubmissions(taskId: number): Promise<DbCollectSubmission[]>;
}

export interface MaterialDb {
  t_employee: DbEmployee[];
  t_asset: DbAsset[];
  t_asset_group: DbAssetGroup[];
  t_asset_tag: DbAssetTag[];
  t_asset_tag_rel: DbAssetTagRel[];
  t_asset_operation_log: DbAssetOperationLog[];
  t_share_record: DbShareRecord[];
  t_share_target_rel: DbShareTargetRel[];
  t_collect_task: DbCollectTask[];
  t_collect_submission: DbCollectSubmission[];
  t_collect_upload_file: DbCollectUploadFile[];
}

export interface DbEmployee {
  EMPLOYEE_ID: number;
  LOGIN_NAME: string;
  LOGIN_PWD: string;
  ACTUAL_NAME: string;
  AVATAR: string | null;
  GENDER: 0 | 1 | 2;
  PHONE: string | null;
  DEPARTMENT_ID: number;
  POSITION_ID: number | null;
  EMAIL: string | null;
  DISABLED_FLAG: 0 | 1;
  DELETED_FLAG: 0 | 1;
  ADMINISTRATOR_FLAG: 0 | 1;
  REMARK: string | null;
  UPDATE_TIME: string;
  CREATE_TIME: string;
}

export interface DbAsset {
  asset_id: number;
  name: string;
  file_path: string;
  thumbnail_path: string | null;
  original_name: string;
  format: string;
  media_type: string | null;
  file_size: number;
  width: number | null;
  height: number | null;
  aspect_ratio: number | null;
  duration: number | null;
  brand: string | null;
  model: string | null;
  dominant_color: string | null;
  description: string | null;
  permission: string | null;
  status: string;
  group_id: number | null;
  owner_id: number | null;
  department_id: number | null;
  valid_from: string | null;
  valid_until: string | null;
  share_count: number;
  download_count: number;
  view_count: number;
  created_from: number;
  created_by: number | null;
  deleted_flag: 0 | 1;
  create_time: string;
  update_time: string;
}

export interface DbAssetGroup {
  group_id: number;
  group_name: string;
  parent_id: number;
  depth: number;
  description: string | null;
  is_system: 0 | 1;
  status: string;
  asset_count: number;
  owner_id: number | null;
  deleted_flag: 0 | 1;
  create_time: string;
  update_time: string;
}

export interface DbAssetTag {
  tag_id: number;
  tag_name: string;
  tag_code: string;
  parent_id: number;
  level: number;
  tag_type: "custom" | "ai" | "system";
  ai_source: 0 | 1 | 2;
  ai_recognition_enabled: 0 | 1;
  is_visible: 0 | 1;
  status: 0 | 1;
  sort_order: number;
  description: string | null;
  created_by: number | null;
  deleted_flag: 0 | 1;
  create_time: string;
  update_time: string;
}

export interface DbAssetTagRel {
  rel_id: number;
  asset_id: number;
  tag_id: number;
  tag_type: "custom" | "ai";
  create_time: string;
}

export interface DbAssetOperationLog {
  log_id: number;
  asset_id: number | null;
  user_id: number | null;
  action: "upload" | "download" | "share" | "edit" | "delete" | "restore" | "view" | "ai_tag" | "group_add" | "validity_change" | "comment";
  message: string;
  metadata: Record<string, unknown>;
  create_time: string;
}

export interface DbShareRecord {
  share_id: number;
  share_name: string;
  creator_id: number | null;
  target_type: "asset" | "group" | "basket";
  access_level: "internal" | "public" | "specified";
  allow_download: 0 | 1;
  include_attachment: 0 | 1;
  password: string | null;
  share_code: string;
  share_link: string;
  expires_at: string | null;
  visit_count: number;
  view_count: number;
  download_count: number;
  status: "active" | "expired" | "closed";
  create_time: string;
  update_time: string;
}

export interface DbShareTargetRel {
  rel_id: number;
  share_id: number;
  target_type: "asset" | "group";
  target_id: number;
  create_time: string;
}

export interface DbCollectTask {
  task_id: number;
  theme: string;
  description: string | null;
  group_id: number | null;
  status: "active" | "expired" | "closed";
  access_code: string;
  allowed_file_types: string[];
  expires_at: string | null;
  creator_id: number | null;
  create_time: string;
  update_time: string;
}

export interface DbCollectSubmission {
  submission_id: number;
  task_id: number;
  uploader_name: string | null;
  contact: string | null;
  remark: string | null;
  status: "submitted" | "stored" | "rejected";
  create_time: string;
}

export interface DbCollectUploadFile {
  file_id: number;
  submission_id: number;
  asset_id: number | null;
  file_name: string;
  file_path: string;
  format: string;
  file_size: number;
  upload_status: "uploaded" | "stored" | "failed";
  create_time: string;
}

export interface CreateShareInput {
  share_name: string;
  target_type: "asset" | "group" | "basket";
  target_ids: number[];
  access_level: "internal" | "public" | "specified";
  allow_download: boolean;
  include_attachment: boolean;
  password?: string;
  expires_at?: string;
  creator_id?: number;
}

export interface CreateCollectTaskInput {
  theme: string;
  description?: string;
  group_id?: number | null;
  access_code?: string;
  allowed_file_types: string[];
  expires_at?: string;
  creator_id?: number;
}

export interface CreateGroupInput {
  name: string;
  parentId?: string | null;
  description?: string;
  ownerId?: number;
}

export interface CreateTagInput {
  tagName: string;
  description?: string;
  createdBy?: number;
}

export interface UpdateTagInput {
  tagName?: string;
  description?: string;
  status?: 0 | 1;
  aiRecognitionEnabled?: 0 | 1;
}

export interface CreateCollectSubmissionInput {
  task_id: number;
  uploader_name?: string;
  contact?: string;
  remark?: string;
}

export interface CreateCollectUploadFileInput {
  submission_id: number;
  file_name: string;
  file_path: string;
  format: string;
  file_size: number;
}
