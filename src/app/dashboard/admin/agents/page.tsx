"use client";

import { useEffect, useState } from "react";
import { agentService } from "@/services/agentService";
import { Agent, AgentStatus } from "@/types";
import SweetAlert from "@/components/ui/SweetAlert";

const STATUS_OPTIONS: { value: AgentStatus; label: string }[] = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "SUSPENDED", label: "Suspended" },
];

const STATUS_STYLES: Record<AgentStatus, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  INACTIVE: "bg-gray-100 text-gray-600",
  SUSPENDED: "bg-red-100 text-red-700",
};

type AlertState = {
  visible: boolean;
  type: "error" | "success" | "warning" | "info";
  title: string;
  message: string;
  buttons: { text: string; onPress?: () => void; style?: "default" | "cancel" | "destructive" }[];
};

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [createForm, setCreateForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [editForm, setEditForm] = useState({ id: "", name: "", email: "", phone: "", status: "ACTIVE" as AgentStatus, password: "" });
  const [alert, setAlert] = useState<AlertState>({
    visible: false, type: "success", title: "", message: "", buttons: [],
  });

  const showAlert = (type: AlertState["type"], title: string, message: string) => {
    setAlert({ visible: true, type, title, message, buttons: [{ text: "OK" }] });
  };

  const fetchAgents = async () => {
    try {
      const res = await agentService.getAll();
      const data = res.data.data;
      setAgents(data?.agents ?? []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const handleCreate = async () => {
    if (!createForm.name || !createForm.email || !createForm.password) {
      showAlert("error", "Error", "Please fill in all required fields");
      return;
    }
    setSubmitting(true);
    try {
      await agentService.create({ name: createForm.name, email: createForm.email, password: createForm.password, phone: createForm.phone || undefined });
      setShowCreateModal(false);
      setCreateForm({ name: "", email: "", password: "", phone: "" });
      showAlert("success", "Success", "Agent created successfully");
      fetchAgents();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Something went wrong";
      showAlert("error", "Error", msg);
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (agent: Agent) => {
    setEditForm({
      id: agent.id,
      name: agent.name,
      email: agent.email,
      phone: agent.phone ?? "",
      status: agent.status,
      password: "",
    });
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    setSubmitting(true);
    try {
      await agentService.update(editForm.id, {
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone || undefined,
        status: editForm.status,
        password: editForm.password || undefined,
      });
      setShowEditModal(false);
      showAlert("success", "Success", "Agent updated successfully");
      fetchAgents();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Something went wrong";
      showAlert("error", "Error", msg);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "w-full bg-gray-50 px-4 py-3 rounded-xl text-sm text-gray-800 border border-gray-100 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition placeholder-gray-400";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agents</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your support agents</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-90"
          style={{ background: "linear-gradient(to right, #6366f1, #8b5cf6)" }}
        >
          + Add Agent
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : agents.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">No agents yet. Add your first agent.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {agents.map((agent) => (
                <tr key={agent.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-800 capitalize">{agent.name ?? "—"}</td>
                  <td className="px-6 py-4 text-gray-500">{agent.email ?? "—"}</td>
                  <td className="px-6 py-4 text-gray-500">{agent.phone ?? "—"}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${STATUS_STYLES[agent.status] ?? "bg-gray-100 text-gray-500"}`}>
                      {agent.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => openEditModal(agent)}
                      className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-medium hover:bg-indigo-100 transition-colors"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
          <div className="relative w-full max-w-sm bg-white/90 backdrop-blur-2xl p-6 shadow-2xl border border-gray-100 rounded-2xl">
            <h2 className="text-lg font-bold text-gray-800 mb-5">Add Agent</h2>
            <div className="flex flex-col gap-3 mb-5">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5 ml-1">Name <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="Full name"
                  value={createForm.name}
                  onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5 ml-1">Email <span className="text-red-400">*</span></label>
                <input
                  type="email"
                  className={inputClass}
                  placeholder="agent@example.com"
                  value={createForm.email}
                  onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5 ml-1">Password <span className="text-red-400">*</span></label>
                <input
                  type="password"
                  className={inputClass}
                  placeholder="••••••••"
                  value={createForm.password}
                  onChange={(e) => setCreateForm((f) => ({ ...f, password: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5 ml-1">Phone</label>
                <input
                  type="tel"
                  className={inputClass}
                  placeholder="Optional"
                  value={createForm.phone}
                  onChange={(e) => setCreateForm((f) => ({ ...f, phone: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowCreateModal(false)}
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
                {submitting ? "Creating..." : "Add Agent"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowEditModal(false)} />
          <div className="relative w-full max-w-sm bg-white/90 backdrop-blur-2xl p-6 shadow-2xl border border-gray-100 rounded-2xl">
            <h2 className="text-lg font-bold text-gray-800 mb-5">Edit Agent</h2>
            <div className="flex flex-col gap-3 mb-5">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5 ml-1">Name</label>
                <input
                  type="text"
                  className={inputClass}
                  value={editForm.name}
                  onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5 ml-1">Email</label>
                <input
                  type="email"
                  className={inputClass}
                  value={editForm.email}
                  onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5 ml-1">Phone</label>
                <input
                  type="tel"
                  className={inputClass}
                  placeholder="Optional"
                  value={editForm.phone}
                  onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5 ml-1">New Password</label>
                <input
                  type="password"
                  className={inputClass}
                  placeholder="Leave blank to keep current"
                  value={editForm.password}
                  onChange={(e) => setEditForm((f) => ({ ...f, password: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5 ml-1">Status</label>
                <select
                  className={inputClass + " cursor-pointer"}
                  value={editForm.status}
                  onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value as AgentStatus }))}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-70"
                style={{ background: "linear-gradient(to right, #6366f1, #8b5cf6)" }}
              >
                {submitting ? "Saving..." : "Save Changes"}
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
