"use client";

import { useCallback, useRef, useState } from "react";
import { fccService, FccUploadResult } from "@/services/fccService";
import SweetAlert from "@/components/ui/SweetAlert";

type AlertState = {
  visible: boolean;
  type: "error" | "success" | "warning" | "info";
  title: string;
  message: string;
  buttons: { text: string; onPress?: () => void; style?: "default" | "cancel" | "destructive" }[];
};

export default function FccUploadPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [state, setState] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<FccUploadResult | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [alert, setAlert] = useState<AlertState>({
    visible: false, type: "success", title: "", message: "", buttons: [],
  });

  const showAlert = (type: AlertState["type"], title: string, message: string) => {
    setAlert({ visible: true, type, title, message, buttons: [{ text: "OK" }] });
  };

  const handleFile = useCallback((f: File) => {
    if (!f.name.toLowerCase().endsWith(".csv")) {
      showAlert("error", "Invalid File", "Please select a .csv file");
      return;
    }
    setFile(f);
    setResult(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setProgress(0);
    setResult(null);
    try {
      const res = await fccService.upload(
        file,
        state.trim().toUpperCase() || undefined,
        (pct) => setProgress(pct),
      );
      setResult(res.data.data);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Upload failed";
      showAlert("error", "Error", msg);
    } finally {
      setUploading(false);
    }
  };

  const inputClass = "w-full bg-gray-50 px-4 py-3 rounded-xl text-sm text-gray-800 border border-gray-100 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition placeholder-gray-400";

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">FCC Broadband Upload</h1>
        <p className="text-sm text-gray-500 mt-1">Upload FCC CSV files to populate broadband provider data</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex flex-col gap-4">
          {/* State Code */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5 ml-1">
              State Code <span className="text-gray-400">(optional, auto-detected from CSV)</span>
            </label>
            <input
              type="text"
              className={inputClass}
              placeholder="e.g. AL, CA, TX"
              maxLength={2}
              value={state}
              onChange={(e) => setState(e.target.value)}
            />
          </div>

          {/* Drop Zone */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5 ml-1">CSV File</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
                dragOver
                  ? "border-indigo-400 bg-indigo-50"
                  : "border-gray-200 bg-gray-50 hover:border-indigo-300 hover:bg-indigo-50/50"
              }`}
            >
              <div className="text-3xl mb-2">&#128462;</div>
              <p className="text-sm text-gray-500">
                Drag & drop your CSV file here<br />
                or <span className="text-indigo-600 underline">click to browse</span>
              </p>
              {file && (
                <p className="text-sm font-semibold text-indigo-600 mt-3 break-all">
                  {file.name} ({(file.size / (1024 * 1024)).toFixed(1)} MB)
                </p>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
          </div>

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="w-full py-3 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: "linear-gradient(to right, #6366f1, #8b5cf6)" }}
          >
            {uploading ? "Uploading..." : "Upload CSV"}
          </button>

          {/* Progress Bar */}
          {uploading && (
            <div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 text-center mt-2">
                {progress < 100 ? `Uploading... ${progress}%` : "Processing CSV, please wait..."}
              </p>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-5">
              <p className="text-sm font-semibold text-green-800 mb-3">Upload successful!</p>
              <table className="w-full text-sm">
                <tbody>
                  {[
                    ["File", result.file],
                    ["State", result.state],
                    ["Technologies", result.technologies.join(", ")],
                    ["Raw Rows", result.raw_rows.toLocaleString()],
                    ["ZIP Providers", result.zip_providers.toLocaleString()],
                    ["Inserted", result.inserted.toLocaleString()],
                    ["Replaced", result.replaced.toLocaleString()],
                  ].map(([label, value]) => (
                    <tr key={label}>
                      <td className="py-1 pr-4 font-semibold text-green-700 whitespace-nowrap">{label}</td>
                      <td className="py-1 text-green-600">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
