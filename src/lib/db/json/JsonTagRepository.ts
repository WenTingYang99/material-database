import type { CreateTagInput, ITagRepository, UpdateTagInput } from "@/lib/db/repositories/interfaces";
import { JsonDatabase } from "@/lib/db/json/JsonDatabase";
import type { Tag } from "@/lib/types/tag";

export class JsonTagRepository implements ITagRepository {
  constructor(private readonly database = new JsonDatabase()) {}

  async findAll(): Promise<Tag[]> {
    const db = await this.database.read();
    return db.t_asset_tag
      .filter((tag) => tag.status === 1 && tag.deleted_flag === 0)
      .sort((a, b) => a.sort_order - b.sort_order || b.update_time.localeCompare(a.update_time))
      .map((tag) => ({
        id: String(tag.tag_id),
        tagName: tag.tag_name,
        tagCode: tag.tag_code,
        tagType: tag.tag_type === "ai" ? 2 : 1,
        parentId: tag.parent_id || 0,
        level: tag.level,
        aiSource: tag.ai_source,
        aiRecognitionEnabled: tag.ai_recognition_enabled,
        isVisible: tag.is_visible,
        status: tag.status,
        sortOrder: tag.sort_order,
        description: tag.description || "",
        createdBy: String(tag.created_by || ""),
        createdAt: tag.create_time,
        updatedAt: tag.update_time,
      }));
  }

  async create(data: CreateTagInput): Promise<Tag> {
    const db = await this.database.read();
    const now = new Date().toISOString();
    const nextId = Math.max(0, ...db.t_asset_tag.map((tag) => tag.tag_id)) + 1;
    const tagCode = this.generateCode(data.tagName, db.t_asset_tag.map((tag) => tag.tag_code));
    const tagType = data.tagType === 2 ? "ai" : "custom";
    const parentId = Number(data.parentId || 0);
    const parent = parentId ? db.t_asset_tag.find((tag) => tag.tag_id === parentId) : null;
    db.t_asset_tag.push({
      tag_id: nextId,
      tag_name: data.tagName.trim(),
      tag_code: tagCode,
      parent_id: tagType === "ai" ? parentId : 0,
      level: tagType === "ai" && parent ? parent.level + 1 : 0,
      tag_type: tagType,
      ai_source: tagType === "ai" ? 2 : 0,
      ai_recognition_enabled: tagType === "ai" ? data.aiRecognitionEnabled ?? 0 : 1,
      is_visible: 1,
      status: 1,
      sort_order: Math.max(0, ...db.t_asset_tag.map((tag) => tag.sort_order)) + 1,
      description: data.description?.trim() || null,
      created_by: data.createdBy || 1,
      deleted_flag: 0,
      create_time: now,
      update_time: now,
    });
    await this.database.write(db);
    const created = (await this.findAll()).find((tag) => tag.id === String(nextId));
    if (!created) throw new Error("Tag create failed");
    return created;
  }

  async update(id: string, data: UpdateTagInput): Promise<Tag> {
    const db = await this.database.read();
    const index = db.t_asset_tag.findIndex((tag) => tag.tag_id === Number(id));
    if (index < 0) throw new Error("Tag not found");
    db.t_asset_tag[index] = {
      ...db.t_asset_tag[index],
      tag_name: data.tagName?.trim() || db.t_asset_tag[index].tag_name,
      description: data.description === undefined ? db.t_asset_tag[index].description : data.description.trim() || null,
      tag_type: data.tagType === 2 ? "ai" : data.tagType === 1 ? "custom" : db.t_asset_tag[index].tag_type,
      parent_id: data.parentId === undefined ? db.t_asset_tag[index].parent_id : Number(data.parentId || 0),
      status: data.status ?? db.t_asset_tag[index].status,
      ai_recognition_enabled: data.aiRecognitionEnabled ?? db.t_asset_tag[index].ai_recognition_enabled,
      update_time: new Date().toISOString(),
    };
    const parent = db.t_asset_tag[index].parent_id ? db.t_asset_tag.find((tag) => tag.tag_id === db.t_asset_tag[index].parent_id) : null;
    db.t_asset_tag[index].level = db.t_asset_tag[index].tag_type === "ai" && parent ? parent.level + 1 : 0;
    await this.database.write(db);
    const updated = (await this.findAll()).find((tag) => tag.id === id);
    if (!updated) throw new Error("Tag update failed");
    return updated;
  }

  async merge(sourceId: string, targetId: string): Promise<void> {
    if (!sourceId || !targetId || sourceId === targetId) return;
    const db = await this.database.read();
    const source = db.t_asset_tag.find((tag) => tag.tag_id === Number(sourceId));
    const target = db.t_asset_tag.find((tag) => tag.tag_id === Number(targetId));
    if (!source || !target) return;
    const now = new Date().toISOString();
    db.t_asset_tag_rel = db.t_asset_tag_rel.map((rel) => rel.tag_id === source.tag_id ? { ...rel, tag_id: target.tag_id } : rel);
    const seen = new Set<string>();
    db.t_asset_tag_rel = db.t_asset_tag_rel.filter((rel) => {
      const key = `${rel.asset_id}:${rel.tag_id}:${rel.tag_type}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    source.deleted_flag = 1;
    source.status = 0;
    source.update_time = now;
    target.update_time = now;
    await this.database.write(db);
  }

  private generateCode(name: string, existingCodes: string[]): string {
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
