import React, { useEffect } from 'react';
import { BellRing, X, Sparkles, CheckCircle2 } from 'lucide-react';

interface InAppNotificationToastProps {
  message: string | null;
  onClose: () => void;
  title?: string;
}

export const InAppNotificationToast: React.FC<InAppNotificationToastProps> = ({
  message,
  onClose,
  title = 'Rappel NutriPulse 🔔',
}) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className="fixed top-4 right-4 left-4 sm:left-auto sm:max-w-md z-50 animate-bounce-short">
      <div className="bg-zinc-950 border-2 border-lime-400 p-4 rounded-2xl shadow-2xl shadow-lime-400/20 backdrop-blur-xl flex items-start space-x-3 text-white">
        <div className="w-10 h-10 rounded-xl bg-lime-400 text-black flex items-center justify-center shrink-0 font-black shadow-md">
          <BellRing className="w-5 h-5 stroke-[2.5]" />
        </div>

        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center space-x-1.5 mb-0.5">
            <span className="text-[10px] font-mono uppercase tracking-widest text-lime-400 font-extrabold">
              {title}
            </span>
          </div>
          <p className="text-xs font-semibold text-zinc-100 leading-snug">
            {message}
          </p>
        </div>

        <button
          onClick={onClose}
          className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
