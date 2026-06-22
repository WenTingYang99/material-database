import type { ITagRepository } from "@/lib/db/repositories/interfaces";
import { JsonDatabase } from "@/lib/db/json/JsonDatabase";
import type { Tag } from "@/lib/types/tag";

export class JsonTagRepository implements ITagRepository {
  constructor(private readonly database = new JsonDatabase()) {}

  async findAll(): Promise<Tag[]> {
    const db = await this.database.read();
    return db.t_asset_tag
      .filter((tag) => tag.status === 1 && tag.deleted_flag === 0)
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
}
