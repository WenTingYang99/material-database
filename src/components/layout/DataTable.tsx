export function DataTable<T>({ columns, rows, emptyText = "暂无数据" }: { columns: { key: string; title: string; render?: (row: T) => React.ReactNode }[]; rows: T[]; emptyText?: string }) {
  return (
    <div className="overflow-hidden rounded-ui border border-slate-200 bg-white">
      <table className="w-full border-collapse text-left">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            {columns.map((column) => <th key={column.key} className="border-b border-slate-200 px-4 py-3 font-semibold">{column.title}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-b border-slate-100 last:border-b-0">
              {columns.map((column) => <td key={column.key} className="px-4 py-3">{column.render ? column.render(row) : String((row as Record<string, unknown>)[column.key] ?? "-")}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
      {!rows.length ? <div className="py-16 text-center text-slate-400">{emptyText}</div> : null}
    </div>
  );
}
