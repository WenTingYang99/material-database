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
  hardDelete(id: string): Promise<void>;
  batchUpdateValidity(ids: string[], validUntil: string): Promise<void>;
}

export interface IGroupRepository {
  findAll(): Promise<MaterialGroup[]>;
  findById(id: string): Promise<MaterialGroup | null>;
}

export interface ITagRepository {
  findAll(): Promise<Tag[]>;
}

export interface IUserRepository {
  findByUsername(username: string): Promise<User | null>;
}

export interface MaterialDb {
  t_employee: DbEmployee[];
  t_asset: DbAsset[];
  t_asset_group: DbAssetGroup[];
  t_asset_tag: DbAssetTag[];
  t_asset_tag_rel: DbAssetTagRel[];
  t_asset_operation_log: DbAssetOperationLog[];
  t_share_record: unknown[];
  t_collect_task: unknown[];
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
