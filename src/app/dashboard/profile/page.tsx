"use client";

import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { userService } from "@/services/userService";
import SweetAlert from "@/components/ui/SweetAlert";

type AlertState = {
  visible: boolean;
  type: "error" | "success" | "warning" | "info";
  title: string;
  message: string;
  buttons: { text: string; onPress?: () => void; style?: "default" | "cancel" | "destructive" }[];
};

export default function ProfilePage() {
  const { user, setAuth, token } = useAppStore();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: user?.name ?? "",
    phone: user?.phone ?? "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    password: "",
    confirmPassword: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [alert, setAlert] = useState<AlertState>({
    visible: false, type: "success", title: "", message: "", buttons: [],
  });

  const showAlert = (type: AlertState["type"], title: string, message: string) => {
    setAlert({ visible: true, type, title, message, buttons: [{ text: "OK" }] });
  };

  const handleUpdateProfile = async () => {
    if (!form.name) {
      showAlert("error", "Error", "Name is required");
      return;
    }
    setSaving(true);
    try {
      const res = await userService.updateProfile({
        name: form.name,
        phone: form.phone || undefined,
      });
      const updated = res.data.data;
      if (updated && token) {
        setAuth({ ...user!, name: updated.name ?? user!.name }, token);
      }
      showAlert("success", "Success", "Profile updated successfully");
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Something went wrong";
      showAlert("error", "Error", msg);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.password) {
      showAlert("error", "Error", "Please fill in all password fields");
      return;
    }
    if (passwordForm.password !== passwordForm.confirmPassword) {
      showAlert("error", "Error", "New passwords do not match");
      return;
    }
    setChangingPassword(true);
    try {
      await userService.updateProfile({
        password: passwordForm.password,
        currentPassword: passwordForm.currentPassword,
      });
      setPasswordForm({ currentPassword: "", password: "", confirmPassword: "" });
      showAlert("success", "Success", "Password changed successfully");
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Something went wrong";
      showAlert("error", "Error", msg);
    } finally {
      setChangingPassword(false);
    }
  };

  const inputClass = "w-full bg-gray-50 px-4 py-3 rounded-xl text-sm text-gray-800 border border-gray-100 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition placeholder-gray-400";

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your account settings</p>
      </div>

      {/* Profile Info */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-800 mb-4">Personal Information</h2>
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5 ml-1">Email</label>
            <input
              type="email"
              className={inputClass + " bg-gray-100 cursor-not-allowed"}
              value={user?.email ?? ""}
              disabled
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5 ml-1">Name</label>
            <input
              type="text"
              className={inputClass}
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5 ml-1">Phone</label>
            <input
              type="tel"
              className={inputClass}
              placeholder="Optional"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            />
          </div>
          <div>
            <button
              onClick={handleUpdateProfile}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-70"
              style={{ background: "linear-gradient(to right, #6366f1, #8b5cf6)" }}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-800 mb-4">Change Password</h2>
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5 ml-1">Current Password</label>
            <input
              type="password"
              className={inputClass}
              placeholder="Enter current password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm((f) => ({ ...f, currentPassword: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5 ml-1">New Password</label>
            <input
              type="password"
              className={inputClass}
              placeholder="Enter new password"
              value={passwordForm.password}
              onChange={(e) => setPasswordForm((f) => ({ ...f, password: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5 ml-1">Confirm New Password</label>
            <input
              type="password"
              className={inputClass}
              placeholder="Confirm new password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm((f) => ({ ...f, confirmPassword: e.target.value }))}
            />
          </div>
          <div>
            <button
              onClick={handleChangePassword}
              disabled={changingPassword}
              className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-70"
              style={{ background: "linear-gradient(to right, #6366f1, #8b5cf6)" }}
            >
              {changingPassword ? "Changing..." : "Change Password"}
            </button>
          </div>
        </div>
      </div>

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
