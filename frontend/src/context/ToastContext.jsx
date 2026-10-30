import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, X, XCircle } from "lucide-react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback(
    (message, type = "success") => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((current) => [...current, { id, message, type }]);
      window.setTimeout(() => dismiss(id), 3500);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <div aria-live="polite" className="toast-stack">
        {toasts.map((toast) => (
          <div
            className={`toast toast-${toast.type}`}
            key={toast.id}
            role="status"
          >
            {toast.type === "error" ? (
              <XCircle size={18} />
            ) : (
              <CheckCircle2 size={18} />
            )}
            <span>{toast.message}</span>
            <button
              aria-label="Dismiss notification"
              onClick={() => dismiss(toast.id)}
              type="button"
            >
              <X size={15} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}
