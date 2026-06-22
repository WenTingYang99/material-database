import type { CreateGroupInput, IGroupRepository } from "@/lib/db/repositories/interfaces";
import { JsonDatabase } from "@/lib/db/json/JsonDatabase";
import type { MaterialGroup } from "@/lib/types/group";

export class JsonGroupRepository implements IGroupRepository {
  constructor(private readonly database = new JsonDatabase()) {}

  async findAll(): Promise<MaterialGroup[]> {
    const db = await this.database.read();
    return db.t_asset_group
      .filter((group) => group.status !== "deleted" && group.deleted_flag === 0)
      .sort((a, b) => a.depth - b.depth || a.create_time.localeCompare(b.create_time))
      .map((group) => ({
        id: String(group.group_id),
        name: group.group_name,
        count: db.t_asset.filter((asset) => asset.group_id === group.group_id && asset.deleted_flag === 0).length,
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

  async create(data: CreateGroupInput): Promise<MaterialGroup> {
    const db = await this.database.read();
    const now = new Date().toISOString();
    const parentId = data.parentId ? Number(data.parentId) : 0;
    const parent = parentId ? db.t_asset_group.find((group) => group.group_id === parentId && group.deleted_flag === 0) : null;
    const nextId = Math.max(0, ...db.t_asset_group.map((group) => group.group_id)) + 1;
    db.t_asset_group.push({
      group_id: nextId,
      group_name: data.name.trim(),
      parent_id: parentId,
      depth: parent ? parent.depth + 1 : 1,
      description: data.description || null,
      is_system: 0,
      status: "active",
      asset_count: 0,
      owner_id: data.ownerId || 1,
      deleted_flag: 0,
      create_time: now,
      update_time: now,
    });
    await this.database.write(db);
    const created = await this.findById(String(nextId));
    if (!created) throw new Error("Group create failed");
    return created;
  }

  async update(id: string, data: Partial<CreateGroupInput>): Promise<MaterialGroup> {
    const db = await this.database.read();
    const index = db.t_asset_group.findIndex((group) => group.group_id === Number(id));
    if (index < 0) throw new Error("Group not found");
    if (db.t_asset_group[index].is_system === 1) throw new Error("System group cannot be edited");
    const parentId = data.parentId === undefined ? db.t_asset_group[index].parent_id : data.parentId ? Number(data.parentId) : 0;
    const parent = parentId ? db.t_asset_group.find((group) => group.group_id === parentId && group.deleted_flag === 0) : null;
    db.t_asset_group[index] = {
      ...db.t_asset_group[index],
      group_name: data.name?.trim() || db.t_asset_group[index].group_name,
      parent_id: parentId,
      depth: parent ? parent.depth + 1 : 1,
      description: data.description ?? db.t_asset_group[index].description,
      update_time: new Date().toISOString(),
    };
    await this.database.write(db);
    const updated = await this.findById(id);
    if (!updated) throw new Error("Group update failed");
    return updated;
  }

  async delete(id: string): Promise<void> {
    const db = await this.database.read();
    const targetId = Number(id);
    const target = db.t_asset_group.find((group) => group.group_id === targetId);
    if (!target) return;
    if (target.is_system === 1) throw new Error("System group cannot be deleted");
    const now = new Date().toISOString();
    const childIds = new Set<number>([targetId]);
    let changed = true;
    while (changed) {
      changed = false;
      for (const group of db.t_asset_group) {
        if (!childIds.has(group.group_id) && childIds.has(group.parent_id)) {
          childIds.add(group.group_id);
          changed = true;
        }
      }
    }
    db.t_asset_group = db.t_asset_group.map((group) => childIds.has(group.group_id) ? { ...group, status: "deleted", deleted_flag: 1, update_time: now } : group);
    db.t_asset = db.t_asset.map((asset) => asset.group_id && childIds.has(asset.group_id) ? { ...asset, deleted_flag: 1, status: "deleted", update_time: now } : asset);
    await this.database.write(db);
  }
}
