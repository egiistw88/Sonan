import React, { useState, useEffect } from 'react';
import { getFinancialConsultation } from '../services/geminiService';
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
    const fetchAdvice = async () => {
      // Small delay for UX effect
      await new Promise(r => setTimeout(r, 800));
      const msg = await getFinancialConsultation(
        revenue, 
        expenses, 
        DEFAULT_TARGETS.revenue, 
        maintenanceFund, 
        wifeDeposit
      );
      setAdvice(msg || "Analisa selesai.");
    };
    fetchAdvice();
  }, [revenue, expenses, maintenanceFund, wifeDeposit]);

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-slate-800 w-full max-w-sm rounded-2xl border border-yellow-500/30 shadow-2xl overflow-hidden relative">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-4 flex justify-between items-center">
          <h2 className="text-slate-900 font-black text-lg flex items-center gap-2">
            👨‍💼 KATA KONSULTAN
          </h2>
          <button onClick={onClose} className="bg-black/20 hover:bg-black/40 text-slate-900 rounded-full w-8 h-8 font-bold">✕</button>
        </div>

        <div className="p-6">
          
          {/* AI Message */}
          <div className="bg-slate-900 p-5 rounded-xl border border-slate-700 relative shadow-inner">
             <div className="flex justify-center mb-4">
                 <div className="bg-slate-800 p-3 rounded-full border border-slate-600">
                    <span className="text-3xl">🧐</span>
                 </div>
             </div>
            <p className="text-base text-slate-200 text-center font-medium leading-relaxed">"{advice}"</p>
          </div>

          <p className="text-center text-xs text-slate-500 mt-6 mb-4">
            *Perhitungan detail sudah diterapkan di menu Dompet.
          </p>

          <button 
            onClick={onClose}
            className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl transition-colors"
          >
            Siap, Mengerti!
          </button>

        </div>
      </div>
    </div>
  );
};