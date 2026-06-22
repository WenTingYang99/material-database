import fs from "fs/promises";
import path from "path";
import type { MaterialDb } from "@/lib/db/repositories/interfaces";

const DEFAULT_DB_PATH = path.join(process.cwd(), "data", "db.json");

export class JsonDatabase {
  constructor(private readonly dbPath = process.env.JSON_DB_PATH || DEFAULT_DB_PATH) {}

  async read(): Promise<MaterialDb> {
    try {
      const data = await fs.readFile(this.dbPath, "utf-8");
      return JSON.parse(data) as MaterialDb;
    } catch {
      const emptyDb: MaterialDb = {
        t_employee: [],
        t_asset: [],
        t_asset_group: [],
        t_asset_tag: [],
        t_asset_tag_rel: [],
        t_asset_operation_log: [],
        t_share_record: [],
        t_collect_task: [],
      };
      await this.write(emptyDb);
      return emptyDb;
    }
  }

  async write(data: MaterialDb): Promise<void> {
    await fs.mkdir(path.dirname(this.dbPath), { recursive: true });
    await fs.writeFile(this.dbPath, JSON.stringify(data, null, 2), "utf-8");
  }
}
