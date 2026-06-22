import { JsonDatabase } from "@/lib/db/json/JsonDatabase";
import type { CreateShareInput, DbShareRecord, IShareRepository } from "@/lib/db/repositories/interfaces";

function nowText() {
  return new Date().toISOString().slice(0, 19).replace("T", " ");
}

function randomCode(prefix: string) {
  return `${prefix}${Math.random().toString(36).slice(2, 8)}`;
}

export class JsonShareRepository implements IShareRepository {
  constructor(private readonly database = new JsonDatabase()) {}

  async findAll(): Promise<DbShareRecord[]> {
    const db = await this.database.read();
    return [...db.t_share_record].sort((a, b) => b.create_time.localeCompare(a.create_time));
  }

  async findByCode(code: string): Promise<DbShareRecord | null> {
    const db = await this.database.read();
    return db.t_share_record.find((share) => share.share_code === code) || null;
  }

  async create(data: CreateShareInput): Promise<DbShareRecord> {
    const db = await this.database.read();
    const shareId = Math.max(0, ...db.t_share_record.map((share) => share.share_id)) + 1;
    const code = randomCode("s_");
    const now = nowText();
    const share: DbShareRecord = {
      share_id: shareId,
      share_name: data.share_name,
      creator_id: data.creator_id || 1,
      target_type: data.target_type,
      access_level: data.access_level,
      allow_download: data.allow_download ? 1 : 0,
      include_attachment: data.include_attachment ? 1 : 0,
      password: data.password || null,
      share_code: code,
      share_link: `/share/${code}`,
      expires_at: data.expires_at || null,
      visit_count: 0,
      view_count: 0,
      download_count: 0,
      status: "active",
      create_time: now,
      update_time: now,
    };
    db.t_share_record.unshift(share);
    const nextRelId = Math.max(0, ...db.t_share_target_rel.map((rel) => rel.rel_id)) + 1;
    data.target_ids.forEach((targetId, index) => {
      if (data.target_type === "basket") {
        db.t_share_target_rel.push({ rel_id: nextRelId + index, share_id: shareId, target_type: "asset", target_id: targetId, create_time: now });
      } else {
        db.t_share_target_rel.push({ rel_id: nextRelId + index, share_id: shareId, target_type: data.target_type, target_id: targetId, create_time: now });
      }
    });
    await this.database.write(db);
    return share;
  }
}
