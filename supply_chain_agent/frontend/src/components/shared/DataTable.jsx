import { useMemo, useState } from "react"
import { ChevronDown, ChevronUp, Search } from "lucide-react"
import clsx from "clsx"
import EmptyState from "../ui/EmptyState"
import Spinner from "../ui/Spinner"

const PAGE_SIZE = 10

export default function DataTable({
  columns,
  data,
  loading,
  emptyMessage = "No data found.",
  emptyTitle = "Nothing to show",
  onRowClick,
  searchPlaceholder = "Search table..."
}) {
  const [query, setQuery] = useState("")
  const [sortKey, setSortKey] = useState(columns[0]?.key)
  const [sortDirection, setSortDirection] = useState("asc")
  const [page, setPage] = useState(1)

  const filteredData = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return data
    return data.filter((row) =>
      JSON.stringify(row).toLowerCase().includes(normalized)
    )
  }, [data, query])

  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData
    const sorted = [...filteredData].sort((left, right) => {
      const leftValue = left[sortKey]
      const rightValue = right[sortKey]
      if (typeof leftValue === "number" && typeof rightValue === "number") {
        return leftValue - rightValue
      }
      return String(leftValue ?? "").localeCompare(String(rightValue ?? ""))
    })
    return sortDirection === "asc" ? sorted : sorted.reverse()
  }, [filteredData, sortDirection, sortKey])

  const pageCount = Math.max(1, Math.ceil(sortedData.length / PAGE_SIZE))
  const pageData = sortedData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const toggleSort = (column) => {
    if (!column.sortable) return
    setPage(1)
    if (sortKey === column.key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
      return
    }
    setSortKey(column.key)
    setSortDirection("asc")
  }

  return (
    <div className="rounded-lg border bg-white shadow-card">
      <div className="flex flex-col gap-3 border-b px-5 py-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(event) => {
              setPage(1)
              setQuery(event.target.value)
            }}
            placeholder={searchPlaceholder}
            className="w-full rounded-md border bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
        </div>
        <p className="text-sm text-slate-500">{sortedData.length} records</p>
      </div>
      {loading ? (
        <div className="flex min-h-[260px] items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : pageData.length === 0 ? (
        <div className="p-5">
          <EmptyState title={emptyTitle} description={emptyMessage} />
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className={clsx(
                        "px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500",
                        column.sortable !== false && "cursor-pointer"
                      )}
                      onClick={() => toggleSort(column)}
                    >
                      <span className="inline-flex items-center gap-1.5">
                        {column.label}
                        {sortKey === column.key ? (
                          sortDirection === "asc" ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />
                        ) : null}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pageData.map((row, index) => (
                  <tr
                    key={row.id || row.key || index}
                    onClick={() => onRowClick?.(row)}
                    className={clsx(
                      "transition hover:bg-slate-50",
                      onRowClick && "cursor-pointer"
                    )}
                  >
                    {columns.map((column) => (
                      <td key={column.key} className="px-5 py-4 align-top text-sm text-slate-700">
                        {column.render ? column.render(row) : row[column.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t px-5 py-4 text-sm">
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page === 1}
              className="rounded-md border px-3 py-1.5 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-slate-500">
              Page {page} of {pageCount}
            </span>
            <button
              type="button"
              onClick={() => setPage((prev) => Math.min(pageCount, prev + 1))}
              disabled={page === pageCount}
              className="rounded-md border px-3 py-1.5 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  )
}
