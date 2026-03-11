"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";

type AlertType = "success" | "error" | "warning" | "info";

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: "default" | "cancel" | "destructive";
}

interface SweetAlertProps {
  visible: boolean;
  type: AlertType;
  title: string;
  message: string;
  buttons?: AlertButton[];
  onClose: () => void;
}

const icons: Record<AlertType, { svg: string; color: string; bg: string }> = {
  success: {
    svg: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
    color: "text-green-600",
    bg: "bg-green-50",
  },
  error: {
    svg: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z",
    color: "text-red-500",
    bg: "bg-red-50",
  },
  warning: {
    svg: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
    color: "text-yellow-500",
    bg: "bg-yellow-50",
  },
  info: {
    svg: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
};

export default function SweetAlert({
  visible,
  type,
  title,
  message,
  buttons = [{ text: "OK" }],
  onClose,
}: SweetAlertProps) {
  useEffect(() => {
    if (visible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [visible]);

  if (!visible) return null;

  const { svg, color, bg } = icons[type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-sm bg-white shadow-2xl p-6 flex flex-col items-center gap-4 animate-in fade-in zoom-in-95 duration-200">
        {/* Icon */}
        <div className={cn("w-14 h-14 rounded-full flex items-center justify-center", bg)}>
          <svg
            className={cn("w-7 h-7", color)}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d={svg} />
          </svg>
        </div>

        {/* Text */}
        <div className="text-center">
          <h3 className="text-base font-semibold text-gray-800 mb-1">{title}</h3>
          <p className="text-sm text-gray-500">{message}</p>
        </div>

        {/* Buttons */}
        <div className={cn("flex gap-2 w-full", buttons.length > 1 ? "flex-row" : "flex-col")}>
          {buttons.map((btn, i) => (
            <button
              key={i}
              onClick={() => {
                btn.onPress?.();
                onClose();
              }}
              className={cn(
                "flex-1 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80",
                btn.style === "cancel"
                  ? "bg-gray-100 text-gray-600"
                  : btn.style === "destructive"
                  ? "bg-red-500 text-white"
                  : "text-white"
              )}
              style={
                btn.style !== "cancel" && btn.style !== "destructive"
                  ? { background: "linear-gradient(to right, #6366f1, #8b5cf6)" }
                  : undefined
              }
            >
              {btn.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
