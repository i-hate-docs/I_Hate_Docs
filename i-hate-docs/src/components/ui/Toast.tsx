import { useAppStore } from '@/stores/appStore';
import { X } from 'lucide-react';

export function Toasts() {
  const toasts = useAppStore((s) => s.toasts);
  const removeToast = useAppStore((s) => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="toast flex items-center gap-3"
          onClick={() => removeToast(t.id)}
        >
          <span className="flex-1">{t.message}</span>
          <X size={14} className="shrink-0 opacity-50" />
        </div>
      ))}
    </div>
  );
}
