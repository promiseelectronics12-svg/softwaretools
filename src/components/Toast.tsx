"use client";

export default function Toast() {
  return null;
}

export function ToastContainer({ message, onClose }: { message: string; onClose: () => void }) {
  if (!message) return null;
  return (
    <div className="fixed bottom-[84px] md:bottom-6 left-1/2 -translate-x-1/2 z-50 toast-animate max-w-[90vw]">
      <div className="glass px-6 py-3.5 rounded-2xl shadow-xl shadow-slate-200/50 flex items-center gap-4 border border-green-500/15">
        <span className="text-sm font-bold text-slate-800 leading-none">{message}</span>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors text-xs font-bold cursor-pointer border-none bg-transparent">✕</button>
      </div>
    </div>
  );
}
