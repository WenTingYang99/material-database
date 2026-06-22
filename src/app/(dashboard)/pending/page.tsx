import { createRepositories } from "@/lib/db/repositories/factory";
import { AssetWorkspace } from "@/components/assets/AssetWorkspace";

export default async function PendingPage() {
  const { assets, groups } = createRepositories();
  const [assetResult, groupItems] = await Promise.all([
    assets.findAll({ status: "pending", sortBy: "创建时间" }),
    groups.findAll(),
  ]);
  return <AssetWorkspace initialAssets={assetResult.items} initialTotal={assetResult.total} groups={groupItems} title="待入库" />;
}
