"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ticketService } from "@/services/ticketService";
import { agentService } from "@/services/agentService";
import { Ticket, Agent } from "@/types";
import TicketStatusBadge from "@/components/dashboard/TicketStatusBadge";
import TicketPriorityBadge from "@/components/dashboard/TicketPriorityBadge";
import SweetAlert from "@/components/ui/SweetAlert";

const TICKET_TYPE_LABELS: Record<string, string> = {
  BILLING: "Billing",
  TECHNICAL: "Technical",
  PLAN_CHANGE: "Plan Change",
  CANCELLATION: "Cancellation",
  GENERAL: "General",
};

type AlertState = {
  visible: boolean;
  type: "error" | "success" | "warning" | "info";
  title: string;
  message: string;
  buttons: { text: string; onPress?: () => void; style?: "default" | "cancel" | "destructive" }[];
};

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState("");
  const [alert, setAlert] = useState<AlertState>({
    visible: false, type: "success", title: "", message: "", buttons: [],
  });

  const showAlert = (type: AlertState["type"], title: string, message: string) => {
    setAlert({ visible: true, type, title, message, buttons: [{ text: "OK" }] });
  };

  const fetchTicket = async () => {
    try {
      const res = await ticketService.getById(id);
      const data = res.data.data;
      setTicket(data);
      setSelectedAgentId(data?.agentId ?? "");
    } catch {
      showAlert("error", "Error", "Failed to load ticket");
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const res = await agentService.getAll();
      setAgents(res.data.data?.agents ?? []);
    } catch {
      // silent
    }
  };

  useEffect(() => {
    if (!id) return;
    fetchTicket();
    fetchAgents();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleAssign = async () => {
    if (!selectedAgentId) return;
    setAssigning(true);
    try {
      await ticketService.assign(id, selectedAgentId);
      showAlert("success", "Success", "Agent assigned successfully");
      await fetchTicket();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to assign agent";
      showAlert("error", "Error", msg);
    } finally {
      setAssigning(false);
    }
  };

  const inputClass = "w-full bg-gray-50 px-4 py-3 rounded-xl text-sm text-gray-800 border border-gray-100 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition placeholder-gray-400";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center py-16 text-gray-400 text-sm">
        Ticket not found.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back button + Header */}
      <div>
        <button
          onClick={() => router.push("/dashboard/admin/tickets")}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors mb-4 inline-flex items-center gap-1"
        >
          &larr; Back to Tickets
        </button>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-gray-400 font-mono">#{ticket.id.slice(-6)}</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-600">
                {TICKET_TYPE_LABELS[ticket.type] ?? ticket.type}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{ticket.subject}</h1>
            <div className="text-xs text-gray-400 flex gap-4 mt-2">
              <span>Created: {new Date(ticket.createdAt).toLocaleString()}</span>
              <span>Updated: {new Date(ticket.updatedAt).toLocaleString()}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <TicketPriorityBadge priority={ticket.priority} />
            <TicketStatusBadge status={ticket.status} />
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Customer</h3>
          <p className="text-sm font-medium text-gray-800 capitalize">{ticket.user?.name ?? "—"}</p>
          <p className="text-sm text-gray-500">{ticket.user?.email ?? "—"}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Agent</h3>
          {ticket.agent ? (
            <>
              <p className="text-sm font-medium text-gray-800 capitalize">{ticket.agent.name}</p>
              <p className="text-sm text-gray-500">{ticket.agent.email}</p>
            </>
          ) : (
            <p className="text-sm text-gray-400">Unassigned</p>
          )}
        </div>
      </div>

      {/* Assign Agent */}
      {ticket.status !== "CLOSED" && (
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            {ticket.agent ? "Reassign Agent" : "Assign Agent"}
          </h3>
          <div className="flex gap-3">
            <select
              className={inputClass + " cursor-pointer flex-1"}
              value={selectedAgentId}
              onChange={(e) => setSelectedAgentId(e.target.value)}
            >
              <option value="">Select an agent</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name} ({agent.email})
                </option>
              ))}
            </select>
            <button
              onClick={handleAssign}
              disabled={assigning || !selectedAgentId}
              className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ background: "linear-gradient(to right, #6366f1, #8b5cf6)" }}
            >
              {assigning ? "Assigning..." : "Assign"}
            </button>
          </div>
        </div>
      )}

      {/* Providers */}
      {ticket.providers && (
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Broadband Providers
            </h3>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="font-medium text-gray-700">{ticket.providers.zip}</span>
              <span>&middot;</span>
              <span>{ticket.providers.city}, {ticket.providers.state}</span>
              <span>&middot;</span>
              <span>{ticket.providers.total} providers</span>
            </div>
          </div>
          {ticket.providers.list.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Provider</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Technology</th>
                    <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Download</th>
                    <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Upload</th>
                    <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Low Latency</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Service</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {ticket.providers.list.map((p, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-800">{p.brand}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700">
                          {p.tech}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600">{p.dl} Mbps</td>
                      <td className="px-4 py-3 text-right text-gray-600">{p.ul} Mbps</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs font-bold ${p.ll ? "text-green-600" : "text-gray-400"}`}>
                          {p.ll ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{p.svc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-400">No provider data available for this ZIP.</p>
          )}
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
