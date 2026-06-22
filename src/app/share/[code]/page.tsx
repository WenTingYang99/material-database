import { createRepositories } from "@/lib/db/repositories/factory";

export default function ShareLandingPage({ params }: { params: { code: string } }) {
  return <ShareLandingContent code={params.code} />;
}

async function ShareLandingContent({ code }: { code: string }) {
  const { assets, shares } = createRepositories();
  const share = await shares.findByCode(code);
  if (!share) {
    return <main className="min-h-screen bg-slate-100 p-8"><h1 className="text-2xl font-bold">分享不存在或已失效</h1></main>;
  }
  const targets = await shares.findTargets(share.share_id);
  const directAssets = (await Promise.all(targets.filter((target) => target.target_type === "asset").map((target) => assets.findById(String(target.target_id))))).filter(Boolean);
  const groupAssets = (await Promise.all(targets.filter((target) => target.target_type === "group").map((target) => assets.findAll({ groupId: String(target.target_id), status: "active" })))).flatMap((result) => result.items);
  const targetAssets = [...directAssets, ...groupAssets].filter((asset, index, items) => asset && items.findIndex((item) => item?.id === asset.id) === index);
  const expired = share.expires_at ? new Date(share.expires_at.replace(" ", "T")).getTime() < Date.now() : false;
  if (expired || share.status !== "active") {
    return <main className="min-h-screen bg-slate-100 p-8"><h1 className="text-2xl font-bold">分享不存在或已失效</h1></main>;
  }
  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <h1 className="text-2xl font-bold">{share.share_name}</h1>
      <div className="mt-4 rounded-ui bg-white p-5 shadow-sm">
        <p className="text-slate-600">分享码：{share.share_code}</p>
        <p className="mt-2 text-slate-600">访问范围：{share.access_level}</p>
        <p className="mt-2 text-slate-600">过期时间：{share.expires_at || "永久有效"}</p>
        <p className="mt-2 text-slate-600">允许下载：{share.allow_download ? "是" : "否"}</p>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {targetAssets.map((asset) => asset ? (
          <article key={asset.id} className="rounded-ui bg-white p-4 shadow-sm">
            <img alt={asset.name} className="aspect-[4/3] w-full rounded-ui object-cover" src={`/${asset.src}`} />
            <h2 className="mt-3 font-bold">{asset.name}</h2>
            <p className="text-sm text-slate-500">{asset.format}</p>
          </article>
        ) : null)}
        {!targetAssets.length ? <div className="rounded-ui bg-white p-5 text-slate-500 shadow-sm">暂无可展示素材</div> : null}
      </div>
    </main>
  );
}
