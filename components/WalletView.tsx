
import React, { memo } from 'react';
import { HistorySpots } from './HistorySpots';
import { Transaction } from '../types';

interface WalletViewProps {
  stats: {
    realCash: number;
    gasFundBudget: number; // Anggaran
    appBalance: number;
    serviceFund: number;
    cleanProfit: number;
    expenses: number;
    revenue: number;
    dailyInstallment: number;
  };
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

export const WalletView: React.FC<WalletViewProps> = memo(({ stats, transactions, onDelete }) => {
  
  // Hitung persentase penggunaan budget operasional
  // Jika expenses > budget, berarti overbudget (merah)
  const expensePercentage = stats.gasFundBudget > 0 
    ? (stats.expenses / stats.gasFundBudget) * 100 
    : 0;

  const isOverBudget = stats.expenses > stats.gasFundBudget;

  return (
    <div className="min-h-screen bg-slate-900 pb-24 animate-fade-in">
      {/* Wallet Header */}
      <div className="bg-slate-900 p-6 pb-4 border-b border-slate-800 sticky top-0 z-30 shadow-md">
         <h1 className="text-xl font-bold text-slate-200 flex items-center gap-2 tracking-wide">
            MANAJEMEN DOMPET
         </h1>
      </div>

      <div className="p-4 space-y-6 max-w-lg mx-auto">
        
        {/* HERO: Real Cash Balance */}
        <div className="relative">
           <div className="absolute inset-0 bg-green-500 blur-[40px] opacity-10 rounded-full"></div>
           <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700 relative z-10 shadow-xl overflow-hidden">
              <div className="flex justify-between items-start mb-2">
                 <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Uang Tunai Di Tangan</p>
                 <span className="text-[10px] bg-slate-800 border border-slate-600 px-2 py-0.5 rounded text-slate-300">
                    Real-time
                 </span>
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

        {/* ALOKASI POS WAJIB & JATAH RUMAH */}
        <div>
           <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="text-slate-400 font-bold text-xs uppercase tracking-wider">Pos Keuangan</h3>
              <span className="text-[10px] text-slate-500 italic">Otomatisasi Mental</span>
           </div>
           
           <div className="grid grid-cols-2 gap-3">
              
              {/* Jatah Rumah - Highlighted (Full Width) */}
              <div className="col-span-2 bg-gradient-to-r from-yellow-600 to-yellow-700 p-5 rounded-2xl border border-yellow-500/50 relative overflow-hidden shadow-lg group">
                 <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <svg className="w-24 h-24 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3zm5 15h-2v-6H9v6H7v-7.81l5-4.5 5 4.5V18z"/></svg>
                 </div>
                 <div className="relative z-10">
                    <div className="flex justify-between items-center mb-1">
                        <p className="text-[10px] text-yellow-200 font-bold uppercase tracking-wider">Jatah Rumah (Bersih)</p>
                        {stats.cleanProfit > 0 && (
                            <span className="text-[10px] bg-black/20 text-yellow-100 px-2 py-0.5 rounded-full font-bold">
                                Aman dibawa pulang
                            </span>
                        )}
                    </div>
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-sm text-yellow-300 font-bold">Rp</span>
                        <h2 className="text-4xl font-black text-white tracking-tight">
                            {Math.max(0, stats.cleanProfit).toLocaleString('id-ID')}
                        </h2>
                    </div>
                    {stats.cleanProfit < 0 && (
                        <div className="mt-2 text-[10px] text-red-200 bg-red-900/30 px-2 py-1 rounded inline-block">
                            ⚠️ Belum nutup modal/cicilan
                        </div>
                    )}
                 </div>
              </div>
              
              {/* Cicilan Wajib (Fixed Cost) */}
              <div className="col-span-2 bg-red-900/20 p-4 rounded-xl border border-red-500/30 relative overflow-hidden flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-500/20 rounded-lg text-red-500 border border-red-500/30">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div>
                        <p className="text-[10px] text-red-400 font-bold uppercase">Cicilan Harian (Wajib)</p>
                        <p className="text-lg font-bold text-white">Rp {stats.dailyInstallment.toLocaleString('id-ID')}</p>
                    </div>
                 </div>
                 {stats.dailyInstallment > 0 && stats.realCash > stats.dailyInstallment && (
                     <div className="bg-green-500/20 text-green-400 border border-green-500/30 text-[10px] font-bold px-2 py-1 rounded">
                         Dana Tersedia
                     </div>
                 )}
              </div>

              {/* 1. Operasional (Budget vs Realisasi) */}
              <div className={`bg-slate-800 p-4 rounded-xl border relative overflow-hidden group transition-colors ${isOverBudget ? 'border-red-500/50' : 'border-slate-700 hover:border-orange-500/50'}`}>
                 <div className="flex justify-between items-start mb-2">
                     <div className={`p-2 rounded-lg ${isOverBudget ? 'bg-red-500/10 text-red-500' : 'bg-orange-500/10 text-orange-500'}`}>
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.77 7.23l.01-.01-3.72-3.72L15 4.56l2.11 2.11c-.94.36-1.61 1.26-1.61 2.33a2.5 2.5 0 002.5 2.5c.36 0 .69-.08 1-.21v7.21c0 .55-.45 1-1 1s-1-.45-1-1V14a2 2 0 00-2-2h-1V5c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v16h10v-7.5h1.5v5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V9c0-.69-.28-1.32-.73-1.77zM12 10H6V5h6v5zm6 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/></svg>
                     </div>
                     <span className={`text-[10px] font-bold ${isOverBudget ? 'text-red-400' : 'text-slate-500'}`}>
                         {isOverBudget ? 'OVER!' : '20%'}
                     </span>
                 </div>
                 <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Bensin & Makan</p>
                 
                 {/* Realisasi vs Budget Display */}
                 <p className="text-lg font-bold text-white">Rp {stats.expenses.toLocaleString('id-ID')}</p>
                 <p className="text-[10px] text-slate-500 mt-1">
                     Budget: Rp {stats.gasFundBudget.toLocaleString('id-ID')}
                 </p>

                 <div className="w-full bg-slate-700 h-1 mt-2 rounded-full overflow-hidden">
                    <div 
                        className={`h-full ${isOverBudget ? 'bg-red-500' : 'bg-orange-500'}`} 
                        style={{width: `${Math.min(expensePercentage, 100)}%`}}
                    ></div>
                 </div>
              </div>

              {/* 2. Saldo Aplikasi (Estimasi) */}
              <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 relative overflow-hidden group hover:border-purple-500/50 transition-colors">
                 <div className="flex justify-between items-start mb-2">
                     <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.15-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39h-2.05c-.15-.8-.84-1.69-2.68-1.69-1.71 0-2.34.86-2.34 1.54 0 .93.96 1.46 2.96 1.99 2.1.6 3.88 1.63 3.88 3.55 0 1.93-1.41 3.19-3.27 3.57z"/></svg>
                     </div>
                     <span className="text-[10px] text-slate-500 font-bold">15%</span>
                 </div>
                 <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Penyisihan App</p>
                 <p className="text-lg font-bold text-white">Rp {stats.appBalance.toLocaleString('id-ID')}</p>
                 <p className="text-[10px] text-slate-500 mt-1">Wajib Topup</p>
              </div>

           </div>
        </div>

        {/* History Spots Component */}
        <HistorySpots transactions={transactions} onDelete={onDelete} />
      </div>
    </div>
  );
});
