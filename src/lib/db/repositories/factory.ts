import { JsonAssetRepository } from "@/lib/db/json/JsonAssetRepository";
import { JsonGroupRepository } from "@/lib/db/json/JsonGroupRepository";
import { JsonCollectRepository } from "@/lib/db/json/JsonCollectRepository";
import { JsonShareRepository } from "@/lib/db/json/JsonShareRepository";
import { JsonTagRepository } from "@/lib/db/json/JsonTagRepository";
import { JsonUserRepository } from "@/lib/db/json/JsonUserRepository";

export function createRepositories() {
  const store = process.env.DATA_STORE || "json";
  if (store !== "json") {
    throw new Error(`Unsupported DATA_STORE "${store}". JSON storage is implemented first; MySQL can be added behind the same interfaces.`);
  }
  return {
    assets: new JsonAssetRepository(),
    groups: new JsonGroupRepository(),
    shares: new JsonShareRepository(),
    collect: new JsonCollectRepository(),
    tags: new JsonTagRepository(),
    users: new JsonUserRepository(),
  };
}
