import { createRepositories } from "@/lib/db/repositories/factory";
import { AssetWorkspace } from "@/components/assets/AssetWorkspace";

export default async function CreatedPage() {
  const { assets, groups } = createRepositories();
  const [assetResult, groupItems] = await Promise.all([
    assets.findAll({ status: "active", sortBy: "创建时间" }),
    groups.findAll(),
  ]);
  const mine = assetResult.items.filter((asset) => asset.owner === "Kerry");
  return <AssetWorkspace initialAssets={mine} initialTotal={mine.length} groups={groupItems} title="我创建的组" />;
}
