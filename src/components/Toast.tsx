
import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgClass = 
    type === 'success' ? 'bg-green-600' : 
    type === 'error' ? 'bg-red-600' : 
    'bg-slate-700';

  return (
    <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-[70] flex items-center gap-3 px-6 py-3 rounded-full shadow-2xl border border-white/10 animate-slide-down ${bgClass}`}>
      <span className="text-xl">
        {type === 'success' ? '✅' : type === 'error' ? '⚠️' : 'ℹ️'}
      </span>
      <p className="text-white text-sm font-bold tracking-wide">{message}</p>
    </div>
  );
};
