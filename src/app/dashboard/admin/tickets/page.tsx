"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ticketService } from "@/services/ticketService";
import { agentService } from "@/services/agentService";
import { Ticket, TicketStatus, TicketType, TicketPriority, Agent } from "@/types";
import TicketStatusBadge from "@/components/dashboard/TicketStatusBadge";
import TicketPriorityBadge from "@/components/dashboard/TicketPriorityBadge";
import SweetAlert from "@/components/ui/SweetAlert";

const TICKET_TYPES: { value: TicketType; label: string }[] = [
  { value: "BILLING", label: "Billing" },
  { value: "TECHNICAL", label: "Technical" },
  { value: "PLAN_CHANGE", label: "Plan Change" },
  { value: "CANCELLATION", label: "Cancellation" },
  { value: "GENERAL", label: "General" },
];

const PRIORITY_OPTIONS: { value: TicketPriority; label: string }[] = [
  { value: 1, label: "1 — Critical" },
  { value: 2, label: "2 — High" },
  { value: 3, label: "3 — Medium" },
  { value: 4, label: "4 — Low" },
  { value: 5, label: "5 — Lowest" },
];

const FILTER_TABS: { label: string; value: TicketStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Open", value: "OPEN" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "Closed", value: "CLOSED" },
];

type AlertState = {
  visible: boolean;
  type: "error" | "success" | "warning" | "info";
  title: string;
  message: string;
  buttons: { text: string; onPress?: () => void; style?: "default" | "cancel" | "destructive" }[];
};

export default function AdminTicketsPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<TicketStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    subject: "",
    type: "GENERAL" as TicketType,
    priority: 3 as TicketPriority,
    message: "",
    agentId: "",
  });
  const [alert, setAlert] = useState<AlertState>({
    visible: false,
    type: "success",
    title: "",
    message: "",
    buttons: [],
  });

  const showAlert = (type: AlertState["type"], title: string, message: string) => {
    setAlert({ visible: true, type, title, message, buttons: [{ text: "OK" }] });
  };

  const fetchTickets = async () => {
    try {
      const res = await ticketService.getAll();
      const tData = res.data.data;
      setTickets(tData?.tickets ?? []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const res = await agentService.getAll();
      const aData = res.data.data;
      setAgents(aData?.agents ?? []);
    } catch {
      // silent
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const filtered = tickets.filter((t) => {
    const matchStatus = activeFilter === "all" || t.status === activeFilter;
    const matchSearch =
      !search ||
      t.subject.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const handleCreate = async () => {
    if (!form.subject) {
      showAlert("error", "Error", "Subject is required");
      return;
    }
    setSubmitting(true);
    try {
      const ticketRes = await ticketService.create({
        type: form.type,
        subject: form.subject,
        priority: form.priority,
        message: form.message || undefined,
      });
      const newTicket = ticketRes.data.data;
      if (form.agentId && newTicket?.id) {
        await ticketService.assign(newTicket.id, form.agentId);
      }
      setShowModal(false);
      setForm({ subject: "", type: "GENERAL", priority: 3, message: "", agentId: "" });
      showAlert("success", "Success", "Ticket created successfully");
      await fetchTickets();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Something went wrong";
      showAlert("error", "Error", msg);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full bg-gray-50 px-4 py-3 rounded-xl text-sm text-gray-800 border border-gray-100 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition placeholder-gray-400";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tickets</h1>
          <p className="text-sm text-gray-500 mt-1">Manage all support tickets</p>
        </div>
        <button
          onClick={() => {
            setShowModal(true);
            if (agents.length === 0) fetchAgents();
          }}
          className="px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-90"
          style={{ background: "linear-gradient(to right, #6366f1, #8b5cf6)" }}
        >
          + Create Ticket
        </button>
      </div>

      {/* Filter Tabs + Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveFilter(tab.value)}
              className={
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-all " +
                (activeFilter === tab.value
                  ? "text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700")
              }
              style={
                activeFilter === tab.value
                  ? { background: "linear-gradient(to right, #6366f1, #8b5cf6)" }
                  : {}
              }
            >
              {tab.label}
            </button>
          ))}
        </div>
        <input
          type="text"
          className="flex-1 bg-white px-4 py-2 rounded-xl text-sm text-gray-800 border border-gray-100 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition placeholder-gray-400 shadow-sm"
          placeholder="Search tickets..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Ticket Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-gray-400 text-sm bg-white rounded-2xl shadow-sm">
          No tickets found.
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-white rounded-2xl shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => router.push("/dashboard/admin/tickets/" + ticket.id)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs text-gray-400 font-mono">
                      #{ticket.id.slice(-6)}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-600 capitalize">
                      {TICKET_TYPES.find((t) => t.value === ticket.type)?.label ?? ticket.type}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-2 truncate">
                    {ticket.subject}
                  </h3>
                  <div className="flex items-center gap-3 flex-wrap text-xs text-gray-500">
                    {ticket.agent?.name && <span>Agent: {ticket.agent.name}</span>}
                    {ticket.user?.name && <span>User: {ticket.user.name}</span>}
                    <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <TicketStatusBadge status={ticket.status} />
                  <TicketPriorityBadge priority={ticket.priority} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div className="relative w-full max-w-md bg-white/90 backdrop-blur-2xl p-6 shadow-2xl border border-gray-100 rounded-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-800 mb-5">Create Ticket</h2>
            <div className="flex flex-col gap-3 mb-5">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5 ml-1">
                  Subject <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="Ticket subject"
                  value={form.subject}
                  onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5 ml-1">
                  Type
                </label>
                <select
                  className={inputClass + " cursor-pointer"}
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as TicketType }))}
                >
                  {TICKET_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5 ml-1">
                  Priority
                </label>
                <select
                  className={inputClass + " cursor-pointer"}
                  value={form.priority}
                  onChange={(e) => setForm((f) => ({ ...f, priority: Number(e.target.value) as TicketPriority }))}
                >
                  {PRIORITY_OPTIONS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5 ml-1">
                  Message
                </label>
                <textarea
                  className={inputClass + " resize-none"}
                  rows={3}
                  placeholder="Initial message (optional)"
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5 ml-1">
                  Assign to Agent
                </label>
                <select
                  className={inputClass + " cursor-pointer"}
                  value={form.agentId}
                  onChange={(e) => setForm((f) => ({ ...f, agentId: e.target.value }))}
                >
                  <option value="">Unassigned</option>
                  {agents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name} ({agent.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-70"
                style={{ background: "linear-gradient(to right, #6366f1, #8b5cf6)" }}
              >
                {submitting ? "Creating..." : "Create Ticket"}
              </button>
            </div>
          </div>
        </div>
      )}

      <SweetAlert
        visible={alert.visible}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        buttons={alert.buttons}
        onClose={() => setAlert((a) => ({ ...a, visible: false }))}
      />
    </div>
  );
}
