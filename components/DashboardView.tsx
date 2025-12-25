
import React, { useState, useMemo } from 'react';
import { Header } from './Header';
import { TargetForm } from './TargetForm';
import { SettingsModal } from './SettingsModal';
import { PreFlightChecklist } from './PreFlightChecklist'; 
import { Transaction, TransactionType, WeatherData, DailyTargets } from '../types';
import { calculatePerformanceGrade, triggerHaptic } from '../services/smartService';

interface DashboardViewProps {
  weather: WeatherData;
  onRefreshWeather: () => void;
  stats: { orders: number; revenue: number; cleanProfit: number; realCash: number };
  transactions: Transaction[];
  onDelete: (id: string) => void;
  targets: DailyTargets;
  onUpdateTargets: (t: DailyTargets) => void;
  onImportData: (tx: Transaction[], tg: DailyTargets) => void;
  onResetData: () => void;
  onOpenAnyepDoctor: () => void;
  onVoiceReport: () => void;
  isSyncing: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  weather,
  onRefreshWeather,
  stats,
  transactions,
  targets,
  onUpdateTargets,
  onImportData,
  onResetData,
  onOpenAnyepDoctor,
  onVoiceReport,
  isSyncing
}) => {
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showChecklist, setShowChecklist] = useState(false);

  // --- CALCS ---
  const safeTargetOrders = targets.orders > 0 ? targets.orders : 1;
  const progressPercent = Math.min((stats.orders / safeTargetOrders) * 100, 100);
  const grade = useMemo(() => calculatePerformanceGrade(stats.orders, targets.orders), [stats.orders, targets.orders]);

  // Grade Colors
  const gradeColor = {
      'S': 'text-purple-400 border-purple-500 shadow-purple-500/50',
      'A': 'text-green-400 border-green-500 shadow-green-500/50',
      'B': 'text-blue-400 border-blue-500 shadow-blue-500/50',
      'C': 'text-yellow-400 border-yellow-500 shadow-yellow-500/50',
      'D': 'text-red-400 border-red-500 shadow-red-500/50',
  }[grade];

  return (
    <>
      <Header weather={weather} onRefreshWeather={() => { triggerHaptic('light'); onRefreshWeather(); }} />
      
      {/* Quick Action Bar - Simplified Layout */}
      <div className="px-6 py-2 flex justify-between items-center relative z-20 -mt-4">
        <div className="flex gap-2">
            <button 
                onClick={() => { triggerHaptic('medium'); onVoiceReport(); }}
                className="bg-slate-800/90 backdrop-blur text-cyan-400 w-10 h-10 flex items-center justify-center rounded-xl border border-slate-700 shadow-lg active:scale-95 transition-all"
            >
               🔊
            </button>
             <button 
                onClick={() => { triggerHaptic('medium'); onOpenAnyepDoctor(); }}
                className="bg-slate-800/90 backdrop-blur text-red-500 w-10 h-10 flex items-center justify-center rounded-xl border border-slate-700 shadow-lg active:scale-95 transition-all"
            >
               🚑
            </button>
             <button 
                onClick={() => { triggerHaptic('medium'); setShowChecklist(true); }}
                className="bg-slate-800/90 backdrop-blur text-green-400 w-10 h-10 flex items-center justify-center rounded-xl border border-slate-700 shadow-lg active:scale-95 transition-all"
            >
               ✅
            </button>
        </div>
        <div className="flex gap-2">
             <button 
                onClick={() => { triggerHaptic('light'); setShowTargetModal(true); }}
                className="bg-slate-800/90 backdrop-blur text-yellow-500 text-[10px] font-bold px-3 py-2 rounded-xl border border-slate-700 shadow-lg active:scale-95 transition-all"
            >
                🎯 Target
            </button>
            <button 
                onClick={() => { triggerHaptic('light'); setShowSettingsModal(true); }}
                className={`bg-slate-800/90 backdrop-blur text-[10px] font-bold px-3 py-2 rounded-xl border border-slate-700 shadow-lg active:scale-95 transition-all flex items-center gap-1 ${isSyncing ? 'text-blue-400 animate-pulse' : 'text-slate-400'}`}
            >
                ⚙️ {isSyncing ? 'Sync...' : 'Data'}
            </button>
        </div>
      </div>

      <div className="p-4 pb-24 animate-fade-in flex flex-col items-center">
        
        {/* SCORECARD PANEL */}
        <div className="w-full max-w-sm bg-slate-800 rounded-3xl p-6 border border-slate-700 shadow-xl relative overflow-hidden mb-6">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <span className="text-8xl font-black">
                    {grade}
                </span>
            </div>

            <div className="flex justify-between items-end mb-6 relative z-10">
                <div>
                    <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest mb-1">Performa Hari Ini</p>
                    <h2 className="text-3xl font-black text-white">
                        {stats.orders} <span className="text-lg text-slate-500 font-bold">/ {targets.orders} Trip</span>
                    </h2>
                </div>
                <div className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center bg-slate-900 shadow-[0_0_20px_currentColor] ${gradeColor}`}>
                    <span className="text-3xl font-black">{grade}</span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="relative z-10 mb-6">
                <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-slate-300">Progress</span>
                    <span className="text-green-400">{Math.round(progressPercent)}%</span>
                </div>
                <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-700">
                    <div 
                        className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 transition-all duration-1000 ease-out relative"
                        style={{ width: `${progressPercent}%` }}
                    >
                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </div>
                </div>
            </div>

            {/* Financial Mini Stats - UPGRADED ACCURACY */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-700/50">
                <div className="bg-slate-900/50 p-2.5 rounded-xl border border-slate-700/30">
                    <p className="text-[9px] text-green-400 font-bold uppercase mb-0.5">Uang Tunai (Pegangan)</p>
                    <p className="text-base font-black text-white">Rp {(stats.realCash/1000).toFixed(0)}rb</p>
                </div>
                <div className="bg-slate-900/50 p-2.5 rounded-xl border border-slate-700/30 text-right">
                    <p className="text-[9px] text-slate-400 font-bold uppercase mb-0.5">Total Omzet</p>
                    <p className="text-base font-black text-white">Rp {(stats.revenue/1000).toFixed(0)}rb</p>
                </div>
            </div>
        </div>

        {/* Recent Activity Log (Compact) */}
        <div className="w-full max-w-sm">
           <div className="flex justify-between items-end mb-3 px-1">
             <h3 className="text-slate-500 font-bold text-[10px] uppercase tracking-wider">Aktivitas Terakhir</h3>
             <span className="text-[10px] text-slate-600">{transactions.length} items</span>
           </div>
           
           <div className="space-y-2">
             {transactions.slice(0, 3).map(tx => (
                 <div key={tx.id} className="bg-slate-800/40 backdrop-blur-sm rounded-xl p-3 border border-slate-700/50 flex justify-between items-center animate-slide-up">
                    <div className="flex items-center gap-3">
                        <div className={`w-1.5 h-8 rounded-full ${tx.type === TransactionType.INCOME ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <div>
                            <p className="text-slate-200 text-sm font-bold truncate w-32">{tx.description}</p>
                            <div className="flex items-center gap-2">
                                <p className="text-[10px] text-slate-500 font-mono">
                                    {new Date(tx.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                                {tx.paymentMethod === 'WALLET' && (
                                    <span className="text-[8px] bg-purple-900/50 text-purple-300 px-1 rounded border border-purple-800">NON-TUNAI</span>
                                )}
                            </div>
                        </div>
                    </div>
                    <span className={tx.type === TransactionType.INCOME ? "text-green-400 font-black text-sm" : "text-red-400 font-black text-sm"}>
                       {tx.type === TransactionType.INCOME ? '+' : ''}{Math.abs(tx.amount / 1000).toFixed(0)}rb
                    </span>
                 </div>
             ))}
             {transactions.length === 0 && (
                <div className="text-center py-4 border border-dashed border-slate-800 rounded-xl">
                    <p className="text-slate-600 text-xs italic">Belum ada tarikan.</p>
                </div>
             )}
           </div>
        </div>
      </div>

      {/* MODALS */}
      {showTargetModal && (
        <TargetForm 
            currentTargets={targets}
            onSave={onUpdateTargets}
            onClose={() => setShowTargetModal(false)}
        />
      )}

      {showSettingsModal && (
        <SettingsModal 
            transactions={transactions}
            targets={targets}
            onImport={onImportData}
            onReset={onResetData}
            onClose={() => setShowSettingsModal(false)}
        />
      )}

      {showChecklist && (
        <PreFlightChecklist onClose={() => setShowChecklist(false)} />
      )}
    </>
  );
};
