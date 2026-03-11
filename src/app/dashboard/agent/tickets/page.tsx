"use client";

import { useEffect, useState } from "react";
import { ticketService } from "@/services/ticketService";
import { Ticket } from "@/types";
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

export default function AgentTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [alert, setAlert] = useState<AlertState>({
    visible: false, type: "success", title: "", message: "", buttons: [],
  });

  const showAlert = (type: AlertState["type"], title: string, message: string) => {
    setAlert({ visible: true, type, title, message, buttons: [{ text: "OK" }] });
  };

  const fetchTickets = async () => {
    try {
      const res = await ticketService.getAssigned();
      const tData = res.data.data;
      setTickets(tData?.tickets ?? []);
    } catch {
      // silently fail — data stays empty
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleCompleteTicket = async (ticketId: string) => {
    setUpdating(ticketId);
    try {
      await ticketService.complete(ticketId);
      showAlert("success", "Success", "Ticket completed successfully");
      await fetchTickets();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to complete ticket";
      showAlert("error", "Error", msg);
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Tickets</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your assigned tickets</p>
        </div>

        {/* Tickets Table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {tickets.length === 0 ? (
            <div className="px-6 py-10 text-center text-gray-400 text-sm">No tickets assigned yet.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{ticket.subject}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {TICKET_TYPE_LABELS[ticket.type] ?? ticket.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <TicketStatusBadge status={ticket.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <TicketPriorityBadge priority={ticket.priority} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                      {ticket.user?.name ?? "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        {ticket.status === "IN_PROGRESS" && (
                          <button
                            onClick={() => handleCompleteTicket(ticket.id)}
                            disabled={updating === ticket.id}
                            className="px-3 py-1 bg-green-100 text-green-700 rounded-md text-xs font-medium hover:bg-green-200 disabled:opacity-50"
                          >
                            {updating === ticket.id ? "Completing..." : "Complete"}
                          </button>
                        )}
                        {ticket.status === "CLOSED" && (
                          <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-md text-xs font-medium">Completed</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <SweetAlert
        visible={alert.visible}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        buttons={alert.buttons}
        onClose={() => setAlert((prev) => ({ ...prev, visible: false }))}
      />
    </>
  );
}
