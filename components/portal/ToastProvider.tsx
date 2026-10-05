"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";

type ToastContextValue = (message: string) => void;

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast precisa estar dentro de <ToastProvider>");
  return ctx;
}

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const [show, setShow] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setMessage(msg);
    setShow(true);
    timerRef.current = setTimeout(() => setShow(false), 3500);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div className={`pt-toast${show ? " show" : ""}`} role="status" aria-live="polite">
        <span className="pt-toast-icon">🔔</span>
        <span>{message}</span>
      </div>
    </ToastContext.Provider>
  );
}
