import type { IAssetRepository } from "@/lib/db/repositories/interfaces";
import { JsonDatabase } from "@/lib/db/json/JsonDatabase";
import type { Asset, AssetListResult, AssetQueryParams } from "@/lib/types/asset";

export class JsonAssetRepository implements IAssetRepository {
  constructor(private readonly database = new JsonDatabase()) {}

  async findAll(params: AssetQueryParams = {}): Promise<AssetListResult> {
    const db = await this.database.read();
    let items: Asset[] = db.t_asset.map((asset) => {
      const employee = db.t_employee.find((item) => item.EMPLOYEE_ID === asset.owner_id || item.EMPLOYEE_ID === asset.created_by);
      const tagRels = db.t_asset_tag_rel.filter((rel) => rel.asset_id === asset.asset_id);
      const tags = tagRels
        .map((rel) => ({ rel, tag: db.t_asset_tag.find((tag) => tag.tag_id === rel.tag_id) }))
        .filter((item): item is { rel: typeof item.rel; tag: NonNullable<typeof item.tag> } => !!item.tag);
      const logs = db.t_asset_operation_log
        .filter((log) => log.asset_id === asset.asset_id)
        .sort((a, b) => b.create_time.localeCompare(a.create_time))
        .map((log) => log.message);
      const viewModel: Asset = {
        id: String(asset.asset_id),
        name: asset.name,
        src: asset.thumbnail_path || asset.file_path,
        format: asset.format,
        mime: this.getMime(asset.format, asset.media_type || ""),
        type: asset.media_type || "文件",
        sizeBytes: asset.file_size,
        width: asset.width || undefined,
        height: asset.height || undefined,
        desc: asset.description || "",
        brand: asset.brand || "",
        model: asset.model || "",
        customTags: tags.filter((item) => item.rel.tag_type === "custom").map((item) => item.tag.tag_name),
        aiTags: tags.filter((item) => item.rel.tag_type === "ai").map((item) => item.tag.tag_name),
        color: asset.dominant_color || "",
        groupId: asset.group_id ? String(asset.group_id) : null,
        owner: employee?.ACTUAL_NAME || "",
        department: employee ? String(employee.DEPARTMENT_ID) : "",
        permission: asset.permission || "",
        validStart: asset.valid_from || undefined,
        validUntil: asset.valid_until || undefined,
        validUntilDate: asset.valid_until || undefined,
        status: asset.deleted_flag === 1 ? "deleted" : asset.status === "待入库" ? "pending" : "active",
        share: asset.share_count,
        download: asset.download_count,
        view: asset.view_count,
        createdAt: asset.create_time,
        updatedAt: asset.update_time,
        version: `${asset.update_time.replace(/\D/g, "").slice(0, 14)}${asset.asset_id}`,
        logs,
      };
      return viewModel;
    });
    const status = params.status || "active";

    if (status !== "all") items = items.filter((asset) => asset.status === status);
    if (params.groupId && params.groupId !== "all") items = items.filter((asset) => asset.groupId === params.groupId);
    if (params.keyword) {
      const keyword = params.keyword.toLowerCase();
      items = items.filter((asset) =>
        `${asset.name} ${asset.format} ${asset.brand || ""} ${asset.model || ""} ${asset.customTags.join(" ")} ${asset.aiTags.join(" ")}`
          .toLowerCase()
          .includes(keyword),
      );
    }

    items = this.sort(items, params.sortBy || "素材热度", params.sortOrder || "desc");
    const total = items.length;
    const page = Math.max(params.page || 1, 1);
    const size = Math.max(params.size || 60, 1);
    const start = (page - 1) * size;
    return { items: items.slice(start, start + size), total };
  }

  async findById(id: string): Promise<Asset | null> {
    const result = await this.findAll({ status: "all" });
    return result.items.find((asset) => asset.id === id) || null;
  }

  async create(data: Omit<Asset, "id" | "createdAt" | "updatedAt">): Promise<Asset> {
    const db = await this.database.read();
    const now = new Date().toISOString();
    const nextId = Math.max(0, ...db.t_asset.map((asset) => asset.asset_id)) + 1;
    db.t_asset.unshift({
      asset_id: nextId,
      name: data.name,
      file_path: data.src,
      thumbnail_path: data.src,
      original_name: `${data.name}.${data.format.toLowerCase()}`,
      format: data.format,
      media_type: data.type,
      file_size: data.sizeBytes,
      width: data.width || null,
      height: data.height || null,
      aspect_ratio: data.width && data.height ? Number((data.width / data.height).toFixed(3)) : null,
      duration: null,
      brand: data.brand || null,
      model: data.model || null,
      dominant_color: data.color || null,
      description: data.desc || null,
      permission: data.permission || null,
      status: data.status === "pending" ? "待入库" : "active",
      group_id: data.groupId ? Number(data.groupId) : null,
      owner_id: 1,
      department_id: 1001,
      valid_from: data.validStart || null,
      valid_until: data.validUntil || null,
      share_count: data.share,
      download_count: data.download,
      view_count: data.view,
      created_from: 1,
      created_by: 1,
      deleted_flag: data.status === "deleted" ? 1 : 0,
      create_time: now,
      update_time: now,
    });
    this.syncTags(db, nextId, data.customTags || [], "custom", now);
    this.syncTags(db, nextId, data.aiTags || [], "ai", now);
    db.t_asset_operation_log.unshift({
      log_id: Math.max(0, ...db.t_asset_operation_log.map((log) => log.log_id)) + 1,
      asset_id: nextId,
      user_id: 1,
      action: "upload",
      message: "Kerry 上传了素材",
      metadata: {},
      create_time: now,
    });
    await this.database.write(db);
    const created = await this.findById(String(nextId));
    if (!created) throw new Error("Asset create failed");
    return created;
  }

  async update(id: string, data: Partial<Asset>): Promise<Asset> {
    const db = await this.database.read();
    const index = db.t_asset.findIndex((asset) => asset.asset_id === Number(id));
    if (index < 0) throw new Error("Asset not found");
    const now = new Date().toISOString();
    db.t_asset[index] = {
      ...db.t_asset[index],
      name: data.name ?? db.t_asset[index].name,
      description: data.desc ?? db.t_asset[index].description,
      brand: data.brand ?? db.t_asset[index].brand,
      model: data.model ?? db.t_asset[index].model,
      permission: data.permission ?? db.t_asset[index].permission,
      group_id: data.groupId === undefined ? db.t_asset[index].group_id : data.groupId ? Number(data.groupId) : null,
      valid_from: data.validStart ?? db.t_asset[index].valid_from,
      valid_until: data.validUntil ?? db.t_asset[index].valid_until,
      deleted_flag: data.status === "deleted" ? 1 : data.status === "active" ? 0 : db.t_asset[index].deleted_flag,
      update_time: now,
    };
    if (data.customTags) this.syncTags(db, Number(id), data.customTags, "custom", now);
    db.t_asset_operation_log.unshift({
      log_id: Math.max(0, ...db.t_asset_operation_log.map((log) => log.log_id)) + 1,
      asset_id: Number(id),
      user_id: 1,
      action: "edit",
      message: "Kerry 修改了素材信息",
      metadata: data,
      create_time: now,
    });
    await this.database.write(db);
    const updated = await this.findById(id);
    if (!updated) throw new Error("Asset update failed");
    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.update(id, { status: "deleted", deletedAt: new Date().toISOString() });
  }

  async restore(id: string): Promise<void> {
    await this.update(id, { status: "active", deletedAt: undefined });
  }

  async batchUpdateValidity(ids: string[], validUntil: string): Promise<void> {
    const db = await this.database.read();
    db.t_asset = db.t_asset.map((asset) => (ids.includes(String(asset.asset_id)) ? { ...asset, valid_until: validUntil } : asset));
    await this.database.write(db);
  }

  private sort(items: Asset[], sortBy: string, sortOrder: "asc" | "desc"): Asset[] {
    const direction = sortOrder === "asc" ? 1 : -1;
    return items.sort((a, b) => {
      if (sortBy === "上传日期" || sortBy === "创建时间") return direction * a.createdAt.localeCompare(b.createdAt);
      if (sortBy === "文件大小") return direction * (a.sizeBytes - b.sizeBytes);
      if (sortBy === "素材名称") return direction * a.name.localeCompare(b.name, "zh-CN");
      return direction * ((a.view + a.download + a.share) - (b.view + b.download + b.share));
    });
  }

  private getMime(format: string, mediaType: string): string {
    if (mediaType === "图片") return `image/${format.toLowerCase()}`;
    if (mediaType === "视频") return `video/${format.toLowerCase()}`;
    return "application/octet-stream";
  }

  private syncTags(db: Awaited<ReturnType<JsonDatabase["read"]>>, assetId: number, tagNames: string[], tagType: "custom" | "ai", now: string) {
    const normalizedNames = [...new Set(tagNames.map((name) => name.trim()).filter(Boolean))];
    db.t_asset_tag_rel = db.t_asset_tag_rel.filter((rel) => !(rel.asset_id === assetId && rel.tag_type === tagType));
    for (const name of normalizedNames) {
      let tag = db.t_asset_tag.find((item) => item.tag_name === name && item.tag_type === tagType && item.deleted_flag === 0);
      if (!tag) {
        const nextId = Math.max(0, ...db.t_asset_tag.map((item) => item.tag_id)) + 1;
        tag = {
          tag_id: nextId,
          tag_name: name,
          tag_code: this.generateTagCode(name, db.t_asset_tag.map((item) => item.tag_code)),
          parent_id: 0,
          level: 0,
          tag_type: tagType,
          ai_source: tagType === "ai" ? 1 : 0,
          ai_recognition_enabled: 1,
          is_visible: 1,
          status: 1,
          sort_order: Math.max(0, ...db.t_asset_tag.map((item) => item.sort_order)) + 1,
          description: null,
          created_by: tagType === "ai" ? null : 1,
          deleted_flag: 0,
          create_time: now,
          update_time: now,
        };
        db.t_asset_tag.push(tag);
      }
      db.t_asset_tag_rel.push({
        rel_id: Math.max(0, ...db.t_asset_tag_rel.map((rel) => rel.rel_id)) + 1,
        asset_id: assetId,
        tag_id: tag.tag_id,
        tag_type: tagType,
        create_time: now,
      });
    }
  }

  private generateTagCode(name: string, existingCodes: string[]) {
    const ascii = name
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .toLowerCase();
    const base = ascii && /^[a-z]/.test(ascii) ? ascii : "tag_" + Date.now().toString(36);
    const existing = new Set(existingCodes);
    let code = base;
    let index = 1;
    while (existing.has(code)) {
      code = base + "_" + index;
      index += 1;
    }
    return code;
  }
}
