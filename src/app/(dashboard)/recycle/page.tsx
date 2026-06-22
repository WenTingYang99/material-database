import { createRepositories } from "@/lib/db/repositories/factory";
import { AssetWorkspace } from "@/components/assets/AssetWorkspace";

export default async function RecyclePage() {
  const { assets, groups } = createRepositories();
  const [assetResult, groupItems] = await Promise.all([
    assets.findAll({ status: "deleted", sortBy: "创建时间" }),
    groups.findAll(),
  ]);
  return <AssetWorkspace initialAssets={assetResult.items} initialTotal={assetResult.total} groups={groupItems} title="回收站" breadcrumbPrefix="全部 › 更多功能" />;
}
