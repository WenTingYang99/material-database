import { loginAction } from "@/app/actions/auth.actions";

export default function LoginPage({ searchParams }: { searchParams?: { error?: string } }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <form action={loginAction} className="w-full max-w-sm rounded-ui bg-white p-8 shadow-sm">
        <div className="mb-7">
          <div className="mb-2 inline-flex rounded-ui bg-red-600 px-3 py-2 text-lg font-bold text-white">DPCA</div>
          <h1 className="text-2xl font-bold text-slate-900">素材库登录</h1>
        </div>
        {searchParams?.error ? <p className="mb-4 rounded-ui bg-red-50 px-3 py-2 text-sm text-red-700">用户名或密码不正确</p> : null}
        <label className="mb-4 block text-sm font-medium text-slate-700">
          用户名
          <input name="username" defaultValue="admin" className="mt-2 w-full rounded-ui border border-slate-300 px-3 py-2" />
        </label>
        <label className="mb-6 block text-sm font-medium text-slate-700">
          密码
          <input name="password" type="password" defaultValue="admin" className="mt-2 w-full rounded-ui border border-slate-300 px-3 py-2" />
        </label>
        <button className="w-full rounded-ui bg-brand px-4 py-2 font-semibold text-white" type="submit">登录</button>
      </form>
    </div>
  );
}
