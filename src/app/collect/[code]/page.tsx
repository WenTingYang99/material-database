export default function CollectLandingPage({ params }: { params: { code: string } }) {
  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <h1 className="text-2xl font-bold">收集任务落地页</h1>
      <p className="mt-3 text-slate-600">任务码：{params.code}</p>
    </main>
  );
}
