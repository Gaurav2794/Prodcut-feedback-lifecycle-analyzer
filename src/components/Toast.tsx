"use client";
import React, { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  title: string;
  message?: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  toast: (options: { title: string; message?: string; type?: ToastType; duration?: number }) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({
      title,
      message,
      type = "info",
      duration = 4000,
    }: {
      title: string;
      message?: string;
      type?: ToastType;
      duration?: number;
    }) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: Toast = { id, title, message, type, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback((title: string, message?: string) => addToast({ title, message, type: "success" }), [addToast]);
  const error = useCallback((title: string, message?: string) => addToast({ title, message, type: "error" }), [addToast]);
  const info = useCallback((title: string, message?: string) => addToast({ title, message, type: "info" }), [addToast]);
  const warning = useCallback((title: string, message?: string) => addToast({ title, message, type: "warning" }), [addToast]);

  return (
    <ToastContext.Provider value={{ toast: addToast, success, error, info, warning }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => {
            const icons = {
              success: <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />,
              error: <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />,
              warning: <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />,
              info: <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />,
            };

            const bgBorders = {
              success: "bg-white border-emerald-200 shadow-emerald-900/10",
              error: "bg-white border-rose-200 shadow-rose-900/10",
              warning: "bg-white border-amber-200 shadow-amber-900/10",
              info: "bg-white border-blue-200 shadow-blue-900/10",
            };

            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={`pointer-events-auto p-4 rounded-2xl border shadow-lg backdrop-blur-md flex items-start gap-3 ${bgBorders[t.type]}`}
              >
                {icons[t.type]}
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-[#051F20]">{t.title}</div>
                  {t.message && (
                    <div className="text-[11px] text-[#536E67] mt-0.5 leading-snug">{t.message}</div>
                  )}
                </div>
                <button
                  onClick={() => removeToast(t.id)}
                  className="text-slate-400 hover:text-slate-600 p-0.5 rounded-md transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
