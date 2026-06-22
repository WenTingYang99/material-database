export function PageHeader({ title, eyebrow, actions }: { title: string; eyebrow?: string; actions?: React.ReactNode }) {
  return (
    <section className="bg-white px-7 py-5">
      <p className="mb-2 text-sm text-slate-500">{eyebrow || `全部 - ${title}`}</p>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">{title}</h1>
        {actions ? <div className="flex gap-2">{actions}</div> : null}
      </div>
    </section>
  );
}
