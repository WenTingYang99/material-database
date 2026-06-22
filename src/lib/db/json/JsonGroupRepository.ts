import type { IGroupRepository } from "@/lib/db/repositories/interfaces";
import { JsonDatabase } from "@/lib/db/json/JsonDatabase";
import type { MaterialGroup } from "@/lib/types/group";

export class JsonGroupRepository implements IGroupRepository {
  constructor(private readonly database = new JsonDatabase()) {}

  async findAll(): Promise<MaterialGroup[]> {
    const db = await this.database.read();
    return db.t_asset_group
      .filter((group) => group.status !== "deleted" && group.deleted_flag === 0)
      .map((group) => ({
        id: String(group.group_id),
        name: group.group_name,
        count: group.asset_count,
        depth: group.depth,
        parentId: group.parent_id ? String(group.parent_id) : undefined,
        system: group.is_system === 1,
        status: group.status === "deleted" ? "deleted" : "active",
      }));
  }

  async findById(id: string): Promise<MaterialGroup | null> {
    const groups = await this.findAll();
    return groups.find((group) => group.id === id) || null;
  }
}
