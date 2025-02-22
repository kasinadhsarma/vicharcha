"use client";

import { useEffect } from "react";
import { useToast, Toast } from "./use-toast";
import { AnimatePresence, motion } from "framer-motion";

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { toasts, dismiss } = useToast();
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        toasts.forEach((toast) => dismiss(toast.id));
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [toasts, dismiss]);

  if (toasts.length === 0) return <>{children}</>;

  return (
    <>
      {children}
      <div className="fixed bottom-0 right-0 z-50 p-4 space-y-4 pointer-events-none">
        <AnimatePresence mode="sync">
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="pointer-events-auto"
            >
              <ToastItem toast={toast} onDismiss={dismiss} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  return (
    <div
      role="alert"
      className={`
        flex items-start justify-between p-4 rounded-lg shadow-lg max-w-sm w-full
        transition-colors duration-200
        ${toast.variant === "destructive" 
          ? "bg-destructive text-destructive-foreground"
          : "bg-background text-foreground"}
      `}
    >
      <div className="flex-1 mr-2">
        <h3 className="font-semibold">{toast.title}</h3>
        {toast.description && (
          <p className="mt-1 text-sm opacity-90">{toast.description}</p>
        )}
      </div>
      <div className="flex items-start gap-2">
        {toast.action && (
          <button
            onClick={() => {
              toast.action?.onClick();
              onDismiss(toast.id);
            }}
            className={`
              text-sm font-medium px-2 py-1 rounded hover:opacity-80
              ${toast.variant === "destructive"
                ? "hover:bg-destructive-foreground/10"
                : "hover:bg-accent"}
            `}
          >
            {toast.action.label}
          </button>
        )}
        <button
          onClick={() => onDismiss(toast.id)}
          className={`
            -mr-1 p-1 text-sm opacity-50 hover:opacity-100 rounded
            ${toast.variant === "destructive"
              ? "hover:bg-destructive-foreground/10"
              : "hover:bg-accent"}
          `}
        >
          ×
        </button>
      </div>
    </div>
  );
}
