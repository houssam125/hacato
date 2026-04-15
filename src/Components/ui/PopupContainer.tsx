// components/ui/PopupContainer.tsx
import type { PopupMessage } from "@/types/popup";

interface Props {
  popups: PopupMessage[];
  onDismiss: (id: number) => void;
}

const styles: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  success: { bg: "bg-green-50", border: "border-green-200", text: "text-green-800", icon: "✓" },
  error:   { bg: "bg-red-50",   border: "border-red-200",   text: "text-red-800",   icon: "✕" },
  warning: { bg: "bg-yellow-50",border: "border-yellow-200",text: "text-yellow-800",icon: "!" },
  info:    { bg: "bg-blue-50",  border: "border-blue-200",  text: "text-blue-800",  icon: "i" },
};

const PopupContainer = ({ popups, onDismiss }: Props) => {
  if (popups.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-3 w-80" dir="rtl">
      {popups.map(({ id, type, message }) => {
        const s = styles[type] || styles.info; // Fallback to 'info' if type is not found in the styles map
        return (
          <div
            key={id}
            className={`flex items-start gap-3 px-4 py-3 rounded-xl border text-sm
                        ${s.bg} ${s.border} ${s.text}
                        animate-in slide-in-from-right-5 fade-in duration-300`}
          >
            <span className="font-bold text-base leading-none mt-0.5">{s.icon}</span>
            <p className="flex-1 leading-relaxed">{message}</p>
            <button
              onClick={() => onDismiss(id)}
              className="opacity-50 hover:opacity-100 transition text-lg leading-none"
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default PopupContainer;