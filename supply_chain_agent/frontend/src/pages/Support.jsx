import { useMemo, useState } from "react"
import { Headset, LifeBuoy, Send, ShieldCheck } from "lucide-react"
import { useOutletContext } from "react-router-dom"
import DataTable from "../components/shared/DataTable"
import Badge from "../components/ui/Badge"
import EmptyState from "../components/ui/EmptyState"
import Modal from "../components/ui/Modal"
import Spinner from "../components/ui/Spinner"
import { useToast } from "../components/ui/Toast"
import { useAuth } from "../hooks/useAuth"
import { useApi } from "../hooks/useApi"
import { api } from "../utils/api"
import { formatDateTime, statusLabel } from "../utils/formatters"

const categoryOptions = ["general", "shipment", "supplier", "inventory", "billing", "access", "bug"]
const severityOptions = ["low", "medium", "high", "critical"]
const statusOptions = ["open", "in_progress", "waiting_on_customer", "resolved", "closed"]

export default function Support() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const { alerts = [] } = useOutletContext()
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [statusFilter, setStatusFilter] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "general",
    severity: "medium",
    affected_area: ""
  })
  const [updateForm, setUpdateForm] = useState({
    status: "open",
    resolution_notes: ""
  })

  const { data, loading, error, refetch } = useApi(
    async () => {
      const tickets = await api.getTickets(statusFilter ? { status: statusFilter } : {})
      return { tickets }
    },
    [statusFilter]
  )

  const model = useMemo(() => {
    if (!data) return null
    return {
      tickets: data.tickets,
      open: data.tickets.filter((ticket) => ticket.status === "open").length,
      inProgress: data.tickets.filter((ticket) => ticket.status === "in_progress").length,
      resolved: data.tickets.filter((ticket) => ["resolved", "closed"].includes(ticket.status)).length
    }
  }, [data])

  const isInternalTeam = ["admin", "analyst"].includes(user?.role)

  const submitTicket = async (event) => {
    event.preventDefault()
    try {
      setIsSubmitting(true)
      await api.createTicket(form)
      setForm({
        title: "",
        description: "",
        category: "general",
        severity: "medium",
        affected_area: ""
      })
      showToast("Ticket submitted successfully.", "success")
      refetch()
    } catch (submitError) {
      showToast(submitError.message || "Unable to submit ticket.", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const saveTicketUpdate = async () => {
    if (!selectedTicket) return
    try {
      await api.updateTicket(selectedTicket.id, updateForm)
      showToast("Ticket updated.", "success")
      setSelectedTicket(null)
      refetch()
    } catch (updateError) {
      showToast(updateError.message || "Unable to update ticket.", "error")
    }
  }

  if (error) {
    return (
      <EmptyState
        icon={Headset}
        title="Support center unavailable"
        description={error}
        action={
          <button type="button" onClick={refetch} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white">
            Retry
          </button>
        }
      />
    )
  }

  if (loading || !model) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  const columns = [
    { key: "title", label: "Title" },
    {
      key: "category",
      label: "Category",
      render: (ticket) => <Badge label={statusLabel(ticket.category)} variant="info" />
    },
    {
      key: "severity",
      label: "Severity",
      render: (ticket) => <Badge label={statusLabel(ticket.severity)} variant={ticket.severity} />
    },
    {
      key: "status",
      label: "Status",
      render: (ticket) => <Badge label={statusLabel(ticket.status)} variant={ticket.status === "resolved" || ticket.status === "closed" ? "success" : "medium"} />
    },
    {
      key: "created_at",
      label: "Created",
      render: (ticket) => formatDateTime(ticket.created_at)
    }
  ]

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-white p-4 shadow-card">
          <p className="text-sm text-slate-500">My Open Tickets</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{model.open}</p>
        </div>
        <div className="rounded-lg border bg-white p-4 shadow-card">
          <p className="text-sm text-slate-500">In Progress</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{model.inProgress}</p>
        </div>
        <div className="rounded-lg border bg-white p-4 shadow-card">
          <p className="text-sm text-slate-500">Resolved</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{model.resolved}</p>
        </div>
        <div className="rounded-lg border bg-white p-4 shadow-card">
          <p className="text-sm text-slate-500">Recent Alerts</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{alerts.length}</p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr,1.1fr]">
        <form onSubmit={submitTicket} className="rounded-lg border bg-white p-5 shadow-card">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-3 text-primary">
              <LifeBuoy className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Raise an incident or support ticket</h2>
              <p className="text-sm text-slate-500">Customers can report delivery, supplier, inventory, access, or platform issues here.</p>
            </div>
          </div>

          <div className="mt-5 grid gap-4">
            <input
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              placeholder="Short ticket title"
              className="rounded-md border px-3 py-2.5 text-sm"
              required
            />
            <textarea
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              placeholder="Describe the issue, impact, and any affected shipment, supplier, warehouse, or order."
              className="min-h-[140px] rounded-md border px-3 py-3 text-sm"
              required
            />
            <div className="grid gap-4 md:grid-cols-3">
              <select value={form.category} onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))} className="rounded-md border px-3 py-2.5 text-sm">
                {categoryOptions.map((option) => (
                  <option key={option} value={option}>{statusLabel(option)}</option>
                ))}
              </select>
              <select value={form.severity} onChange={(event) => setForm((prev) => ({ ...prev, severity: event.target.value }))} className="rounded-md border px-3 py-2.5 text-sm">
                {severityOptions.map((option) => (
                  <option key={option} value={option}>{statusLabel(option)}</option>
                ))}
              </select>
              <input
                value={form.affected_area}
                onChange={(event) => setForm((prev) => ({ ...prev, affected_area: event.target.value }))}
                placeholder="Affected area e.g. SHIP-0001"
                className="rounded-md border px-3 py-2.5 text-sm"
              />
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border bg-slate-50 px-3 py-2 text-xs text-slate-600">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Routed through your authenticated account
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-60"
            >
              <Send className="h-4 w-4" />
              {isSubmitting ? "Submitting..." : "Submit ticket"}
            </button>
          </div>
        </form>

        <div className="rounded-lg border bg-white p-5 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{isInternalTeam ? "Ticket queue" : "My reported issues"}</h2>
              <p className="text-sm text-slate-500">{isInternalTeam ? "Analysts and admins can update statuses for customer issues." : "Track the tickets you have already raised."}</p>
            </div>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-md border px-3 py-2.5 text-sm">
              <option value="">All statuses</option>
              {statusOptions.map((option) => (
                <option key={option} value={option}>{statusLabel(option)}</option>
              ))}
            </select>
          </div>

          <div className="mt-5">
            <DataTable
              columns={columns}
              data={model.tickets}
              loading={loading}
              emptyTitle="No tickets found"
              emptyMessage="Raise an issue above to create your first ticket."
              searchPlaceholder="Search tickets..."
              onRowClick={(ticket) => {
                setSelectedTicket(ticket)
                setUpdateForm({
                  status: ticket.status,
                  resolution_notes: ticket.resolution_notes || ""
                })
              }}
            />
          </div>
        </div>
      </section>

      <Modal open={Boolean(selectedTicket)} onClose={() => setSelectedTicket(null)} title={selectedTicket?.title || "Ticket details"}>
        {selectedTicket ? (
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              <Badge label={statusLabel(selectedTicket.category)} variant="info" />
              <Badge label={statusLabel(selectedTicket.severity)} variant={selectedTicket.severity} />
              <Badge label={statusLabel(selectedTicket.status)} variant={selectedTicket.status === "resolved" || selectedTicket.status === "closed" ? "success" : "medium"} />
            </div>
            <div className="rounded-lg border bg-slate-50 p-4">
              <p className="text-sm leading-7 text-slate-700">{selectedTicket.description}</p>
              <div className="mt-4 grid gap-3 text-sm text-slate-500 md:grid-cols-2">
                <p>Created: {formatDateTime(selectedTicket.created_at)}</p>
                <p>Affected area: {selectedTicket.affected_area || "Not specified"}</p>
                <p>Reporter: {selectedTicket.reporter?.full_name || user?.full_name}</p>
                <p>Email: {selectedTicket.reporter?.email || user?.email}</p>
              </div>
            </div>

            {isInternalTeam ? (
              <div className="space-y-4 rounded-lg border bg-white p-4">
                <h3 className="font-semibold text-slate-900">Update ticket</h3>
                <select value={updateForm.status} onChange={(event) => setUpdateForm((prev) => ({ ...prev, status: event.target.value }))} className="w-full rounded-md border px-3 py-2.5 text-sm">
                  {statusOptions.map((option) => (
                    <option key={option} value={option}>{statusLabel(option)}</option>
                  ))}
                </select>
                <textarea
                  value={updateForm.resolution_notes}
                  onChange={(event) => setUpdateForm((prev) => ({ ...prev, resolution_notes: event.target.value }))}
                  placeholder="Resolution notes or next steps"
                  className="min-h-[120px] w-full rounded-md border px-3 py-3 text-sm"
                />
                <div className="flex justify-end">
                  <button type="button" onClick={saveTicketUpdate} className="rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-white">
                    Save update
                  </button>
                </div>
              </div>
            ) : selectedTicket.resolution_notes ? (
              <div className="rounded-lg border bg-emerald-50 p-4 text-sm text-emerald-800">
                <p className="font-semibold">Latest support note</p>
                <p className="mt-2 leading-7">{selectedTicket.resolution_notes}</p>
              </div>
            ) : null}
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
