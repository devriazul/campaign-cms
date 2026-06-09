"use client";

import React, { memo } from "react";
import { CheckCircle2, Sparkles, AlertCircle } from "lucide-react";
import { Toast } from "../types";

interface ToastNotificationsProps {
  toasts: Toast[];
}

const ToastNotifications: React.FC<ToastNotificationsProps> = ({ toasts }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 space-y-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`p-4 rounded-xl shadow-lg border text-xs font-bold flex items-center gap-2.5 min-w-[280px] bg-white transition-all duration-300 pointer-events-auto transform translate-y-0 animate-scale-in ${
            toast.type === "success" ? "border-emerald-200 text-emerald-800" :
            toast.type === "info" ? "border-sky-200 text-sky-850" : "border-red-200 text-red-800"
          }`}
        >
          {toast.type === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
          {toast.type === "info" && <Sparkles className="w-4 h-4 text-sky-500" />}
          {toast.type === "error" && <AlertCircle className="w-4 h-4 text-red-500" />}
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
};

export default memo(ToastNotifications);
