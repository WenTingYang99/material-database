export type AssetStatus = "active" | "pending" | "deleted";

export interface Asset {
  id: string;
  name: string;
  src: string;
  format: string;
  mime: string;
  type: "图片" | "视频" | "文档" | string;
  sizeBytes: number;
  width?: number;
  height?: number;
  desc?: string;
  brand?: string;
  model?: string;
  customTags: string[];
  aiTags: string[];
  color?: string;
  groupId: string | null;
  owner: string;
  department?: string;
  permission: string;
  validStart?: string;
  validUntil?: string;
  validUntilDate?: string;
  status: AssetStatus;
  share: number;
  download: number;
  view: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  version?: string;
  logs: string[];
}

export interface AssetQueryParams {
  page?: number;
  size?: number;
  keyword?: string;
  groupId?: string | null;
  status?: AssetStatus | "all";
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  filters?: Record<string, string | string[] | undefined>;
}

export interface AssetListResult {
  items: Asset[];
  total: number;
}
