
import React, { useMemo } from 'react';
import { HistorySpots } from './HistorySpots';
import { Transaction, TransactionType } from '../types';
import { calculateVehicleHealth, triggerHaptic } from '../services/smartService';

interface WalletViewProps {
  stats: {
    realCash: number; 
    revenue: number;  
    expenses: number; 
    orders: number; 
  };
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

export const WalletView: React.FC<WalletViewProps> = ({ stats, transactions, onDelete }) => {
  
  const financialData = useMemo(() => {
    const estimatedAppCommission = stats.revenue * 0.15;
    const quotaSavings = 2500; 
    const maintenanceSavings = 5500;
    const hotMoney = estimatedAppCommission + quotaSavings + maintenanceSavings;
    const netProfit = stats.realCash - hotMoney;
    
    let financialHealth = 'SEHAT';
    if (netProfit < 0) financialHealth = 'KRITIS';
    else if (netProfit < 50000) financialHealth = 'WASPADA';

    return {
        appCommission: estimatedAppCommission,
        quotaSavings,
        maintenanceSavings,
        hotMoney,
        netProfit,
        financialHealth
    };
  }, [stats.revenue, stats.realCash]);

  const vehicleHealth = useMemo(() => calculateVehicleHealth(stats.orders * 10), [stats.orders]);

  return (
    <div className="min-h-screen bg-slate-900 pb-24 animate-fade-in text-slate-200">
      
      <div className="bg-slate-900 p-6 pb-4 border-b border-slate-800 sticky top-0 z-30 shadow-md flex justify-between items-center">
         <div>
             <h1 className="text-xl font-bold text-white flex items-center gap-2 tracking-wide">
                💼 MANAJEMEN ASET
             </h1>
             <p className="text-[10px] text-slate-400">Mode: Ahli Keuangan</p>
         </div>
         <div className={`px-3 py-1 rounded-full text-[10px] font-black border ${
             financialData.financialHealth === 'SEHAT' ? 'bg-green-900/30 text-green-400 border-green-500' :
             financialData.financialHealth === 'WASPADA' ? 'bg-yellow-900/30 text-yellow-400 border-yellow-500' :
             'bg-red-900/30 text-red-400 border-red-500 animate-pulse'
         }`}>
             KONDISI: {financialData.financialHealth}
         </div>
      </div>

      <div className="p-4 space-y-6 max-w-lg mx-auto">
        
        <div className="relative group">
            <div className={`absolute inset-0 blur-[20px] opacity-20 rounded-3xl transition-colors duration-500 ${financialData.netProfit >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
            <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700 shadow-2xl relative overflow-hidden">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">
                            Uang Dapur Bersih (Net)
                        </p>
                        <h2 className={`text-4xl font-black tracking-tight ${financialData.netProfit >= 0 ? 'text-white' : 'text-red-500'}`}>
                            Rp {financialData.netProfit.toLocaleString('id-ID')}
                        </h2>
                    </div>
                    <div className="text-right">
                         <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">
                            Tunai Di Dompet
                        </p>
                        <p className="text-lg font-bold text-slate-300">
                            Rp {stats.realCash.toLocaleString('id-ID')}
                        </p>
                    </div>
                </div>

                {financialData.netProfit < 0 && (
                    <div className="bg-red-500/10 border border-red-500/30 p-2 rounded-lg mb-3">
                        <p className="text-[10px] text-red-300 text-center font-bold">
                            ⚠️ ANDA SEDANG MEMAKAN MODAL / SALDO APLIKASI!
                        </p>
                    </div>
                )}

                <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden flex">
                    <div className="h-full bg-red-500" style={{width: `${Math.min((financialData.hotMoney / stats.realCash)*100, 100)}%`}}></div>
                    <div className="h-full bg-emerald-500 flex-1"></div>
                </div>
                <div className="flex justify-between mt-1 text-[9px] font-bold text-slate-500 uppercase">
                    <span>Uang Panas (Wajib Putar)</span>
                    <span>Profit Aman</span>
                </div>
            </div>
        </div>

        <div>
            <h3 className="text-slate-400 text-xs font-bold uppercase mb-3 pl-1">Pos Wajib (Sinking Funds)</h3>
            <div className="grid grid-cols-2 gap-3">
                
                <div className="col-span-2 bg-slate-800 p-4 rounded-2xl border-l-4 border-l-purple-500 border-y border-r border-slate-700 shadow-lg flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">🔄</span>
                            <p className="text-xs font-bold text-purple-300 uppercase">Wajib Top-Up Saldo</p>
                        </div>
                        <p className="text-[10px] text-slate-400">Ganti potongan komisi (15%)</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xl font-black text-white">Rp {financialData.appCommission.toLocaleString('id-ID')}</p>
                        <button 
                            onClick={() => triggerHaptic('light')}
                            className="text-[9px] bg-purple-900/50 text-purple-300 px-2 py-1 rounded border border-purple-700 mt-1 hover:bg-purple-900 transition-colors"
                        >
                            Sisihkan Sekarang
                        </button>
                    </div>
                </div>

                <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 relative overflow-hidden group hover:border-blue-500 transition-colors">
                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                        <span className="text-4xl">📶</span>
                    </div>
                    <p className="text-[10px] text-blue-400 font-bold uppercase mb-1">Nabung Kuota</p>
                    <p className="text-lg font-black text-white">Rp {financialData.quotaSavings.toLocaleString('id-ID')}</p>
                    <p className="text-[9px] text-slate-500 mt-1">Target: 75rb/bln</p>
                </div>

                <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 relative overflow-hidden group hover:border-orange-500 transition-colors">
                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                         <span className="text-4xl">🛠️</span>
                    </div>
                    <p className="text-[10px] text-orange-400 font-bold uppercase mb-1">Dana Bengkel</p>
                    <p className="text-lg font-black text-white">Rp {financialData.maintenanceSavings.toLocaleString('id-ID')}</p>
                    <p className="text-[9px] text-slate-500 mt-1">Oli & Ban</p>
                </div>
            </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <h3 className="text-slate-400 text-xs font-bold uppercase mb-3">Operasional Hari Ini</h3>
            <div className="space-y-3">
                 <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                     <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-red-900/30 flex items-center justify-center text-red-500">⛽</div>
                         <div>
                             <p className="text-sm font-bold text-slate-200">Total Pengeluaran</p>
                             <p className="text-[10px] text-slate-500">Bensin, Makan, Parkir</p>
                         </div>
                     </div>
                     <p className="text-base font-bold text-red-400">- Rp {stats.expenses.toLocaleString('id-ID')}</p>
                 </div>
                 
                 <div className="flex justify-between items-center">
                     <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">📊</div>
                         <div>
                             <p className="text-sm font-bold text-slate-200">Ratio Operasional</p>
                             <p className="text-[10px] text-slate-500">Ideal: &lt; 30% dari Omzet</p>
                         </div>
                     </div>
                     <p className={`text-base font-bold ${stats.revenue > 0 && (stats.expenses/stats.revenue) > 0.3 ? 'text-red-500' : 'text-green-500'}`}>
                         {stats.revenue > 0 ? Math.round((stats.expenses / stats.revenue) * 100) : 0}%
                     </p>
                 </div>
            </div>
        </div>

        <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700 shadow-lg opacity-80 hover:opacity-100 transition-opacity">
             <div className="flex justify-between items-center mb-4">
                 <h3 className="text-slate-400 font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                    ❤️ Kesehatan Motor
                 </h3>
                 <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded">
                     Sisa: {vehicleHealth.nextServiceIn} trip
                 </span>
             </div>

             <div className="space-y-4">
                 <div>
                     <div className="flex justify-between text-xs mb-1">
                         <span className="text-slate-300 font-bold">Oli Mesin</span>
                         <span className={vehicleHealth.oilLife < 30 ? "text-red-400 font-bold" : "text-green-400 font-bold"}>
                             {vehicleHealth.oilLife}%
                         </span>
                     </div>
                     <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                         <div 
                            className={`h-full ${vehicleHealth.oilLife < 30 ? 'bg-red-500' : 'bg-green-500'}`} 
                            style={{width: `${vehicleHealth.oilLife}%`}}
                         ></div>
                     </div>
                 </div>
             </div>
        </div>

        <HistorySpots transactions={transactions} onDelete={onDelete} />
      </div>
    </div>
  );
};
