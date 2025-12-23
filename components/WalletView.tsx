
import React, { useMemo } from 'react';
import { HistorySpots } from './HistorySpots';
import { Transaction } from '../types';
import { calculateVehicleHealth } from '../services/smartService';

interface WalletViewProps {
  stats: {
    realCash: number;
    gasFundBudget: number;
    appBalance: number;
    serviceFund: number;
    cleanProfit: number;
    expenses: number;
    revenue: number;
    dailyInstallment: number;
    orders: number; // needed for health calc
  };
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

export const WalletView: React.FC<WalletViewProps> = ({ stats, transactions, onDelete }) => {
  
  // Calculate Vehicle Health based on total orders today + assumption of previous history (mocked for now as just today * 10 for demo effect, normally would be persistent)
  const health = useMemo(() => calculateVehicleHealth(stats.orders * 10), [stats.orders]); // Multiplier for demo visualization
  
  const expensePercentage = stats.gasFundBudget > 0 
    ? (stats.expenses / stats.gasFundBudget) * 100 
    : 0;

  const isOverBudget = stats.expenses > stats.gasFundBudget;

  return (
    <div className="min-h-screen bg-slate-900 pb-24 animate-fade-in">
      <div className="bg-slate-900 p-6 pb-4 border-b border-slate-800 sticky top-0 z-30 shadow-md">
         <h1 className="text-xl font-bold text-slate-200 flex items-center gap-2 tracking-wide">
            MANAJEMEN ARMADA
         </h1>
      </div>

      <div className="p-4 space-y-6 max-w-lg mx-auto">
        
        {/* VEHICLE HEALTH MONITOR */}
        <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700 shadow-lg">
             <div className="flex justify-between items-center mb-4">
                 <h3 className="text-slate-400 font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                    🛠️ Kesehatan Motor
                 </h3>
                 <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded">
                     Est. Ganti Oli: {health.nextServiceIn} trip lagi
                 </span>
             </div>

             <div className="space-y-4">
                 {/* Oil Life */}
                 <div>
                     <div className="flex justify-between text-xs mb-1">
                         <span className="text-slate-300 font-bold">Oli Mesin</span>
                         <span className={health.oilLife < 30 ? "text-red-400 font-bold" : "text-green-400 font-bold"}>
                             {health.oilLife}%
                         </span>
                     </div>
                     <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                         <div 
                            className={`h-full ${health.oilLife < 30 ? 'bg-red-500' : 'bg-green-500'}`} 
                            style={{width: `${health.oilLife}%`}}
                         ></div>
                     </div>
                 </div>

                 {/* Tire/General Wear */}
                 <div>
                     <div className="flex justify-between text-xs mb-1">
                         <span className="text-slate-300 font-bold">Kampas & Ban</span>
                         <span className="text-blue-400 font-bold">{health.tireCondition}%</span>
                     </div>
                     <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                         <div 
                            className="h-full bg-blue-500" 
                            style={{width: `${health.tireCondition}%`}}
                         ></div>
                     </div>
                 </div>
             </div>
             
             <div className="mt-4 pt-3 border-t border-slate-700 text-center">
                 <p className="text-[10px] text-slate-500">
                     *Sisihkan <strong>Rp {stats.serviceFund.toLocaleString('id-ID')}</strong> hari ini untuk dana servis.
                 </p>
             </div>
        </div>

        {/* HERO: Real Cash Balance */}
        <div className="relative">
           <div className="absolute inset-0 bg-green-500 blur-[40px] opacity-10 rounded-full"></div>
           <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700 relative z-10 shadow-xl overflow-hidden">
              <div className="flex justify-between items-start mb-2">
                 <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Uang Tunai Di Tangan</p>
              </div>
              <h2 className={`text-4xl font-black ${stats.realCash >= 0 ? 'text-white' : 'text-red-400'} drop-shadow-sm`}>
                  Rp {stats.realCash.toLocaleString('id-ID')}
              </h2>
              <div className="flex items-center gap-2 mt-4">
                 <div className="bg-green-500/10 text-green-400 text-[10px] font-bold px-2 py-1.5 rounded border border-green-500/20 flex items-center gap-1">
                    <span>⬇️</span> Masuk: Rp {stats.revenue.toLocaleString('id-ID')}
                 </div>
                 <div className="bg-red-500/10 text-red-400 text-[10px] font-bold px-2 py-1.5 rounded border border-red-500/20 flex items-center gap-1">
                    <span>⬆️</span> Keluar: Rp {stats.expenses.toLocaleString('id-ID')}
                 </div>
              </div>
           </div>
        </div>

        {/* ALOKASI POS WAJIB */}
        <div className="grid grid-cols-2 gap-3">
              {/* Jatah Rumah */}
              <div className="col-span-2 bg-gradient-to-r from-yellow-600 to-yellow-700 p-5 rounded-2xl border border-yellow-500/50 relative overflow-hidden shadow-lg group">
                 <div className="relative z-10">
                    <div className="flex justify-between items-center mb-1">
                        <p className="text-[10px] text-yellow-200 font-bold uppercase tracking-wider">Jatah Rumah (Bersih)</p>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-sm text-yellow-300 font-bold">Rp</span>
                        <h2 className="text-4xl font-black text-white tracking-tight">
                            {Math.max(0, stats.cleanProfit).toLocaleString('id-ID')}
                        </h2>
                    </div>
                 </div>
              </div>

              {/* Budget Ops */}
              <div className={`bg-slate-800 p-4 rounded-xl border relative overflow-hidden ${isOverBudget ? 'border-red-500/50' : 'border-slate-700'}`}>
                 <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Bensin & Makan</p>
                 <p className="text-lg font-bold text-white">Rp {stats.expenses.toLocaleString('id-ID')}</p>
                 <div className="w-full bg-slate-700 h-1 mt-2 rounded-full overflow-hidden">
                    <div className={`h-full ${isOverBudget ? 'bg-red-500' : 'bg-orange-500'}`} style={{width: `${Math.min(expensePercentage, 100)}%`}}></div>
                 </div>
              </div>
              
               {/* Cicilan Wajib */}
              <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                 <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Cicilan Wajib</p>
                 <p className="text-lg font-bold text-white">Rp {stats.dailyInstallment.toLocaleString('id-ID')}</p>
              </div>
        </div>

        <HistorySpots transactions={transactions} onDelete={onDelete} />
      </div>
    </div>
  );
};
