"use client";

import { useEffect, useState } from "react";
import { providerService } from "@/services/providerService";
import { Provider } from "@/types";
import SweetAlert from "@/components/ui/SweetAlert";

type AlertState = {
  visible: boolean;
  type: "error" | "success" | "warning" | "info";
  title: string;
  message: string;
  buttons: { text: string; onPress?: () => void; style?: "default" | "cancel" | "destructive" }[];
};

export default function ProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", website: "", contactEmail: "", contactPhone: "" });
  const [alert, setAlert] = useState<AlertState>({
    visible: false, type: "success", title: "", message: "", buttons: [],
  });

  const showAlert = (type: AlertState["type"], title: string, message: string) => {
    setAlert({ visible: true, type, title, message, buttons: [{ text: "OK" }] });
  };

  const fetchProviders = async () => {
    try {
      const res = await providerService.getAll();
      const data = res.data.data;
      setProviders(data?.providers ?? data ?? []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const handleCreate = async () => {
    if (!form.name) {
      showAlert("error", "Error", "Provider name is required");
      return;
    }
    setSubmitting(true);
    try {
      await providerService.create({
        name: form.name,
        website: form.website || undefined,
        contactEmail: form.contactEmail || undefined,
        contactPhone: form.contactPhone || undefined,
      });
      setShowModal(false);
      setForm({ name: "", website: "", contactEmail: "", contactPhone: "" });
      showAlert("success", "Success", "Provider created successfully");
      fetchProviders();
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
          <h1 className="text-2xl font-bold text-gray-900">Providers</h1>
          <p className="text-sm text-gray-500 mt-1">Manage service providers</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-90"
          style={{ background: "linear-gradient(to right, #6366f1, #8b5cf6)" }}
        >
          + Add Provider
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : providers.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">No providers yet. Create your first provider.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Website</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {providers.map((provider) => (
                <tr key={provider._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-800">{provider.name}</td>
                  <td className="px-6 py-4 text-gray-500">{provider.website ?? "—"}</td>
                  <td className="px-6 py-4 text-gray-500">{provider.contactEmail ?? "—"}</td>
                  <td className="px-6 py-4 text-gray-500">{provider.contactPhone ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-sm bg-white/90 backdrop-blur-2xl p-6 shadow-2xl border border-gray-100 rounded-2xl">
            <h2 className="text-lg font-bold text-gray-800 mb-5">Add Provider</h2>
            <div className="flex flex-col gap-3 mb-5">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5 ml-1">Name <span className="text-red-400">*</span></label>
                <input type="text" className={inputClass} placeholder="Provider name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5 ml-1">Website</label>
                <input type="url" className={inputClass} placeholder="https://example.com" value={form.website} onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5 ml-1">Contact Email</label>
                <input type="email" className={inputClass} placeholder="contact@provider.com" value={form.contactEmail} onChange={(e) => setForm((f) => ({ ...f, contactEmail: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5 ml-1">Contact Phone</label>
                <input type="tel" className={inputClass} placeholder="+1 555 000 0000" value={form.contactPhone} onChange={(e) => setForm((f) => ({ ...f, contactPhone: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-70"
                style={{ background: "linear-gradient(to right, #6366f1, #8b5cf6)" }}
              >
                {submitting ? "Creating..." : "Create Provider"}
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
