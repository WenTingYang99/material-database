import { createRepositories } from "@/lib/db/repositories/factory";

export default function ShareLandingPage({ params }: { params: { code: string } }) {
  return <ShareLandingContent code={params.code} />;
}

async function ShareLandingContent({ code }: { code: string }) {
  const { shares } = createRepositories();
  const share = await shares.findByCode(code);
  if (!share) {
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
    </main>
  );
}
