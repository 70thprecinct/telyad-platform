'use client';
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { cx } from './primitives';

interface ToastItem {
  id: number;
  title: string;
  message?: string;
  tone: 'default' | 'success' | 'danger';
}
interface ToastApi {
  toast: (title: string, message?: string, tone?: ToastItem['tone']) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const counter = useRef(0);
  const toast = useCallback<ToastApi['toast']>((title, message, tone = 'default') => {
    const id = Date.now() + counter.current++;
    setItems((prev) => [...prev, { id, title, message, tone }]);
    setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 4200);
  }, []);
  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="tly-toast-stack">
        {items.map((t) => (
          <div key={t.id} className={cx('tly-toast', t.tone !== 'default' && t.tone)}>
            <strong>{t.title}</strong>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) return { toast: () => undefined };
  return ctx;
}
