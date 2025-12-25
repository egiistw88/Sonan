
import React, { useState } from 'react';
import { DailyTargets } from '../types';
import { triggerHaptic } from '../services/smartService';

interface TargetFormProps {
  currentTargets: DailyTargets;
  onSave: (newTargets: DailyTargets) => void;
  onClose: () => void;
}

export const TargetForm: React.FC<TargetFormProps> = ({ currentTargets, onSave, onClose }) => {
  const [orders, setOrders] = useState(currentTargets.orders.toString());
  const [revenue, setRevenue] = useState(currentTargets.revenue.toString());
  const [installment, setInstallment] = useState(currentTargets.dailyInstallment?.toString() || '0');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic('success');
    onSave({
        orders: parseInt(orders) || 0,
        revenue: parseInt(revenue) || 0,
        dailyInstallment: parseInt(installment) || 0
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
       <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose}></div>
       
       <div className="relative bg-slate-900 w-full max-w-sm rounded-2xl border border-slate-700 shadow-2xl overflow-hidden animate-slide-up">
          <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
              <h3 className="text-white font-bold text-lg">🎯 Atur Target Harian</h3>
              <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
              
              {/* Target Order */}
              <div>
                  <label className="block text-slate-400 text-xs font-bold uppercase mb-2">Target Order (Trip)</label>
                  <div className="relative">
                      <input 
                        type="number" 
                        value={orders}
                        onChange={(e) => setOrders(e.target.value)}
                        className="w-full bg-slate-950 text-white text-xl font-bold p-3 rounded-xl border border-slate-700 focus:border-yellow-500 focus:outline-none"
                      />
                      <span className="absolute right-4 top-4 text-slate-500 text-sm font-bold">Trip</span>
                  </div>
              </div>

              {/* Target Rupiah */}
              <div>
                  <label className="block text-slate-400 text-xs font-bold uppercase mb-2">Target Pendapatan (Kotor)</label>
                  <div className="relative">
                      <span className="absolute left-4 top-4 text-slate-500 text-base font-bold">Rp</span>
                      <input 
                        type="number" 
                        value={revenue}
                        onChange={(e) => setRevenue(e.target.value)}
                        className="w-full bg-slate-950 text-white text-xl font-bold p-3 pl-10 rounded-xl border border-slate-700 focus:border-green-500 focus:outline-none"
                      />
                  </div>
              </div>

               {/* Cicilan Wajib */}
               <div>
                  <label className="block text-red-400 text-xs font-bold uppercase mb-2 flex justify-between">
                      <span>Cicilan/Beban Tetap Harian</span>
                      <span className="text-[9px] bg-red-900/30 px-1 rounded">WAJIB</span>
                  </label>
                  <div className="relative">
                      <span className="absolute left-4 top-4 text-slate-500 text-base font-bold">Rp</span>
                      <input 
                        type="number" 
                        value={installment}
                        onChange={(e) => setInstallment(e.target.value)}
                        placeholder="Contoh: 30000 (Motor)"
                        className="w-full bg-slate-950 text-white text-xl font-bold p-3 pl-10 rounded-xl border border-red-900/50 focus:border-red-500 focus:outline-none"
                      />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 italic">
                      *Cicilan Motor, HP, atau Atribut yang harus disisihkan per hari.
                  </p>
              </div>

              <div className="pt-2">
                  <button 
                    type="submit"
                    className="w-full bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold py-3 rounded-xl shadow-lg shadow-yellow-500/20 active:scale-95 transition-all"
                  >
                      SIMPAN PENGATURAN
                  </button>
              </div>
          </form>
       </div>
    </div>
  );
};
