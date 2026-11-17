"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";
import { clsx } from "clsx";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({
  toast: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = "success") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-dismiss after 3.5s
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}

      {/* Toast Container */}
      <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 w-full max-w-sm px-4 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={clsx(
              "glass flex items-center gap-3 px-4 py-3 rounded-2xl pointer-events-auto animate-fade-in-up",
              t.type === "success" && "text-success-fg",
              t.type === "error" && "text-danger-fg",
              t.type === "info" && "text-primary"
            )}
          >
            {t.type === "success" && <CheckCircle2 className="w-5 h-5 shrink-0" />}
            {t.type === "error" && <AlertCircle className="w-5 h-5 shrink-0" />}
            {t.type === "info" && <AlertCircle className="w-5 h-5 shrink-0" />}
            <p className="flex-1 text-sm font-medium text-fg-strong">{t.message}</p>
            <button
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss"
              className="p-1 rounded text-fg-secondary hover:bg-fg-strong/10 transition-colors shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
