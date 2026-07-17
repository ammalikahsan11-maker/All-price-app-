import React, { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Bell, X, TrendingDown, Eye } from "lucide-react";

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  itemName: string;
  currentPrice: number;
  targetPrice: number;
  currencySymbol: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onClose: (id: string) => void;
  onAction: () => void;
  language: "en" | "hinglish";
}

export const ToastContainer: React.FC<ToastProps> = ({
  toasts,
  onClose,
  onAction,
  language
}) => {
  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 w-full max-w-sm sm:max-w-md px-4 sm:px-0"
      id="global-toast-container"
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onClose={onClose}
            onAction={onAction}
            language={language}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

interface ToastItemProps {
  toast: ToastMessage;
  onClose: (id: string) => void;
  onAction: () => void;
  language: "en" | "hinglish";
}

const ToastItem: React.FC<ToastItemProps> = ({
  toast,
  onClose,
  onAction,
  language
}) => {
  // Automatically dismiss after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, 10000);
    return () => clearTimeout(timer);
  }, [toast.id, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-4 shadow-2xl flex flex-col gap-3 relative overflow-hidden"
      id={`toast-item-${toast.id}`}
    >
      {/* Visual pulse line for urgency */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-400 animate-pulse" />

      {/* Main Toast Content */}
      <div className="flex items-start gap-3 mt-1.5">
        <div className="bg-emerald-500/20 text-emerald-400 p-2 rounded-xl shrink-0 border border-emerald-500/30 animate-pulse">
          <TrendingDown size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-black text-white flex items-center gap-1.5 tracking-tight">
            <Bell size={14} className="text-amber-400 fill-amber-400" />
            <span>{toast.title}</span>
          </h4>
          <p className="text-xs text-slate-300 mt-1 font-semibold leading-relaxed">
            {toast.message}
          </p>
          
          {/* Price Comparer Visual inside Toast */}
          <div className="mt-2.5 flex items-center justify-between gap-2 bg-slate-950/80 p-2 rounded-xl border border-slate-800/60 text-[11px] font-extrabold font-mono">
            <div>
              <span className="text-slate-500 block text-[9px] uppercase tracking-wider">
                {language === "hinglish" ? "ABHI KA DAAM" : "CURRENT PRICE"}
              </span>
              <span className="text-emerald-400 text-xs">
                {toast.currencySymbol}{toast.currentPrice.toLocaleString()}
              </span>
            </div>
            <div className="text-slate-700 font-normal">→</div>
            <div className="text-right">
              <span className="text-slate-500 block text-[9px] uppercase tracking-wider">
                {language === "hinglish" ? "TARGET DAAM" : "TARGET PRICE"}
              </span>
              <span className="text-slate-300 text-xs">
                {toast.currencySymbol}{toast.targetPrice.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={() => onClose(toast.id)}
          className="text-slate-400 hover:text-white p-1 rounded-lg transition shrink-0 hover:bg-white/10 cursor-pointer"
          id={`close-toast-${toast.id}`}
        >
          <X size={15} />
        </button>
      </div>

      {/* Actions row */}
      <div className="flex justify-end gap-2 border-t border-slate-800/80 pt-2.5 mt-0.5">
        <button
          onClick={() => onClose(toast.id)}
          className="px-3 py-1.5 text-[11px] font-bold text-slate-400 hover:text-white transition cursor-pointer"
          id={`dismiss-btn-${toast.id}`}
        >
          {language === "hinglish" ? "Dismiss" : "Dismiss"}
        </button>
        <button
          onClick={() => {
            onAction();
            onClose(toast.id);
          }}
          className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 px-3.5 py-1.5 rounded-xl text-[11px] font-black transition flex items-center gap-1 cursor-pointer"
          id={`action-btn-${toast.id}`}
        >
          <Eye size={12} />
          <span>{language === "hinglish" ? "Watchlist Dekhein" : "Go to Watchlist"}</span>
        </button>
      </div>
    </motion.div>
  );
};
