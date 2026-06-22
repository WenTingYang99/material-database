import type { CreateTagInput, ITagRepository } from "@/lib/db/repositories/interfaces";
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
    db.t_asset_tag.push({
      tag_id: nextId,
      tag_name: data.tagName.trim(),
      tag_code: tagCode,
      parent_id: 0,
      level: 0,
      tag_type: "custom",
      ai_source: 0,
      ai_recognition_enabled: 1,
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
