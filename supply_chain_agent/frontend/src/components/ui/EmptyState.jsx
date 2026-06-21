export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center rounded-lg border border-dashed bg-white px-6 text-center">
      {Icon ? <Icon className="mb-4 h-10 w-10 text-slate-300" /> : null}
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-slate-500">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}
