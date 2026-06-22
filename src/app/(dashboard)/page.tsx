import { createRepositories } from "@/lib/db/repositories/factory";
import { AssetWorkspace } from "@/components/assets/AssetWorkspace";

export default async function DashboardPage() {
  const { assets, groups } = createRepositories();
  const [assetResult, groupItems] = await Promise.all([
    assets.findAll({ status: "active", sortBy: "素材热度" }),
    groups.findAll(),
  ]);

  return <AssetWorkspace initialAssets={assetResult.items} initialTotal={assetResult.total} groups={groupItems} />;
}
