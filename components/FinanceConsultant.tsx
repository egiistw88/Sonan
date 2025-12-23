
import React, { useState, useEffect } from 'react';
import { getFinancialAdviceLogic } from '../services/smartService'; // NEW IMPORT
import { DEFAULT_TARGETS } from '../types';

interface FinanceConsultantProps {
  revenue: number;
  expenses: number;
  maintenanceFund: number;
  wifeDeposit: number;
  onClose: () => void;
}

export const FinanceConsultant: React.FC<FinanceConsultantProps> = ({ revenue, expenses, maintenanceFund, wifeDeposit, onClose }) => {
  const [advice, setAdvice] = useState('Sedang mengaudit dompet Anda...');

  useEffect(() => {
    // Simulate thinking delay for UX
    const timer = setTimeout(() => {
        const msg = getFinancialAdviceLogic(revenue, expenses, DEFAULT_TARGETS.revenue);
        setAdvice(msg);
    }, 800);
    return () => clearTimeout(timer);
  }, [revenue, expenses]);

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-slate-800 w-full max-w-sm rounded-2xl border border-yellow-500/30 shadow-2xl overflow-hidden relative">
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-4 flex justify-between items-center">
          <h2 className="text-slate-900 font-black text-lg flex items-center gap-2">
            👨‍💼 KATA KONSULTAN
          </h2>
          <button onClick={onClose} className="bg-black/20 hover:bg-black/40 text-slate-900 rounded-full w-8 h-8 font-bold">✕</button>
        </div>

        <div className="p-6">
          <div className="bg-slate-900 p-5 rounded-xl border border-slate-700 relative shadow-inner">
             <div className="flex justify-center mb-4">
                 <div className="bg-slate-800 p-3 rounded-full border border-slate-600">
                    <span className="text-3xl">🧐</span>
                 </div>
             </div>
            <p className="text-base text-slate-200 text-center font-medium leading-relaxed">"{advice}"</p>
          </div>
          <button 
            onClick={onClose}
            className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl transition-colors mt-6"
          >
            Siap, Mengerti!
          </button>
        </div>
      </div>
    </div>
  );
};
