import { create } from "zustand";

export interface Toast {
  id: string;
  title: string;
  description?: string;
  duration?: number;
  variant?: "default" | "destructive";
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastState {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => string;
  removeToast: (id: string) => void;
}

const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).slice(2);
    set((state) => ({
      toasts: [
        ...state.toasts,
        {
          ...toast,
          id,
        },
      ],
    }));
    return id;
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));

export function useToast() {
  const store = useToastStore();

  const toast = ({
    title,
    description,
    duration = 5000,
    variant = "default",
    action,
  }: Omit<Toast, "id">) => {
    const id = store.addToast({ title, description, duration, variant, action });

    if (duration) {
      setTimeout(() => {
        store.removeToast(id);
      }, duration);
    }

    return id;
  };

  return {
    toast,
    toasts: store.toasts,
    dismiss: store.removeToast,
  };
}
