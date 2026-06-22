import { createRepositories } from "@/lib/db/repositories/factory";

export default function CollectLandingPage({ params }: { params: { code: string } }) {
  return <CollectLandingContent code={params.code} />;
}

async function CollectLandingContent({ code }: { code: string }) {
  const { collect } = createRepositories();
  const task = await collect.findTaskByCode(code);
  if (!task) {
    return <main className="min-h-screen bg-slate-100 p-8"><h1 className="text-2xl font-bold">收集任务不存在或已失效</h1></main>;
  }
  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <h1 className="text-2xl font-bold">{task.theme}</h1>
      <div className="mt-4 rounded-ui bg-white p-5 shadow-sm">
        <p className="text-slate-600">任务码：{task.access_code}</p>
        <p className="mt-2 text-slate-600">说明：{task.description || "-"}</p>
        <p className="mt-2 text-slate-600">允许类型：{task.allowed_file_types.join("、")}</p>
        <p className="mt-2 text-slate-600">失效时间：{task.expires_at || "永久有效"}</p>
      </div>
    </main>
  );
}
