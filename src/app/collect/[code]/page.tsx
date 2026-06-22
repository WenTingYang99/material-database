import { submitCollectTaskAction } from "@/app/actions/collect.actions";
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
  const submissions = await collect.findSubmissions(task.task_id);
  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <h1 className="text-2xl font-bold">{task.theme}</h1>
      <div className="mt-4 rounded-ui bg-white p-5 shadow-sm">
        <p className="text-slate-600">任务码：{task.access_code}</p>
        <p className="mt-2 text-slate-600">说明：{task.description || "-"}</p>
        <p className="mt-2 text-slate-600">允许类型：{task.allowed_file_types.join("、")}</p>
        <p className="mt-2 text-slate-600">失效时间：{task.expires_at || "永久有效"}</p>
      </div>
      <form action={submitCollectTaskAction} className="mt-4 grid gap-3 rounded-ui bg-white p-5 shadow-sm md:grid-cols-2">
        <input name="task_id" type="hidden" value={task.task_id} />
        <label className="text-sm font-medium text-slate-700">提交人<input className="mt-2 w-full rounded-ui border border-slate-300 px-3 py-2" name="uploader_name" /></label>
        <label className="text-sm font-medium text-slate-700">联系方式<input className="mt-2 w-full rounded-ui border border-slate-300 px-3 py-2" name="contact" /></label>
        <label className="text-sm font-medium text-slate-700 md:col-span-2">上传文件<input className="mt-2 w-full rounded-ui border border-slate-300 px-3 py-2" name="files" multiple type="file" /></label>
        <label className="text-sm font-medium text-slate-700 md:col-span-2">备注<input className="mt-2 w-full rounded-ui border border-slate-300 px-3 py-2" name="remark" /></label>
        <div className="md:col-span-2"><button className="rounded-ui bg-brand px-5 py-2 font-semibold text-white" type="submit">提交</button></div>
      </form>
      <div className="mt-4 rounded-ui bg-white p-5 shadow-sm">
        <h2 className="font-bold">已提交记录</h2>
        <div className="mt-3 space-y-2 text-sm text-slate-600">
          {submissions.map((item) => <p key={item.submission_id}>{item.create_time} · {item.uploader_name || "匿名"} · {item.remark || "-"}</p>)}
          {!submissions.length ? <p>暂无提交</p> : null}
        </div>
      </div>
    </main>
  );
}
