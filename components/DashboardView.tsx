
import React, { useState } from 'react';
import { Header } from './Header';
import { TargetForm } from './TargetForm';
import { SettingsModal } from './SettingsModal';
import { Transaction, TransactionType, WeatherData, DailyTargets } from '../types';

interface DashboardViewProps {
  weather: WeatherData;
  onRefreshWeather: () => void;
  stats: { orders: number; revenue: number; cleanProfit: number };
  transactions: Transaction[];
  onDelete: (id: string) => void;
  targets: DailyTargets;
  onUpdateTargets: (t: DailyTargets) => void;
  onImportData: (tx: Transaction[], tg: DailyTargets) => void;
  onResetData: () => void;
  onOpenAnyepDoctor: () => void;
  onVoiceReport: () => void;
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
  onVoiceReport
}) => {
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // --- SAFE MATH FOR PROGRESS BAR ---
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  
  // Prevent Division by Zero if targets are 0 or uninitialized
  const safeTargetOrders = targets.orders > 0 ? targets.orders : 1;
  const safeTargetRevenue = targets.revenue > 0 ? targets.revenue : 1;

  const progressPercent = Math.min((stats.orders / safeTargetOrders) * 100, 100);
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  // Dynamic Color based on progress
  const getProgressColor = () => {
      if (progressPercent >= 100) return '#10b981'; // Emerald 500
      if (progressPercent >= 70) return '#f59e0b'; // Amber 500
      return '#ef4444'; // Red 500
  };

  // Status Pulang Logic
  const isSafeHome = stats.cleanProfit > 0 && progressPercent >= 80;

  return (
    <>
      <Header weather={weather} onRefreshWeather={onRefreshWeather} />
      
      {/* Quick Action Bar */}
      <div className="px-6 py-2 flex justify-between items-center relative z-20 -mt-4">
        <div className="flex gap-2">
            <button 
                onClick={onVoiceReport}
                className="bg-slate-800/80 backdrop-blur text-cyan-400 p-2 rounded-xl border border-slate-700 shadow-lg active:scale-95 transition-all"
                aria-label="Laporan Suara"
            >
               🔊
            </button>
             <button 
                onClick={onOpenAnyepDoctor}
                className="bg-slate-800/80 backdrop-blur text-red-500 p-2 rounded-xl border border-slate-700 shadow-lg active:scale-95 transition-all"
                aria-label="Dokter Anyep"
            >
               🚑
            </button>
        </div>
        <div className="flex gap-2">
             <button 
                onClick={() => setShowTargetModal(true)}
                className="bg-slate-800/80 backdrop-blur text-yellow-500 text-xs font-bold px-3 py-2 rounded-xl border border-slate-700 shadow-lg active:scale-95 transition-all"
            >
                🎯 Target
            </button>
            <button 
                onClick={() => setShowSettingsModal(true)}
                className="bg-slate-800/80 backdrop-blur text-slate-400 text-xs font-bold px-3 py-2 rounded-xl border border-slate-700 shadow-lg active:scale-95 transition-all"
            >
                ⚙️ Data
            </button>
        </div>
      </div>

      <div className="p-4 pb-24 animate-fade-in flex flex-col items-center">
        
        {/* COCKPIT SPEEDOMETER */}
        <div className="relative w-64 h-64 flex items-center justify-center mb-6">
            {/* Background Circle */}
            <div className="absolute inset-0 rounded-full bg-slate-900 border-[8px] border-slate-800 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]"></div>
            
            {/* SVG Ring */}
            <svg className="w-full h-full transform -rotate-90 absolute top-0 left-0 drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]">
                <circle
                    cx="128"
                    cy="128"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    className="text-slate-800"
                />
                <circle
                    cx="128"
                    cy="128"
                    r={radius}
                    stroke={getProgressColor()}
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                />
            </svg>

            {/* Center Content */}
            <div className="relative z-10 text-center flex flex-col items-center">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Trip Selesai</p>
                <div className="flex items-baseline gap-1">
                    <span className="text-6xl font-black text-white leading-none tracking-tighter">
                        {stats.orders}
                    </span>
                    <span className="text-xl text-slate-500 font-bold">/{targets.orders}</span>
                </div>
                
                {/* Secondary Stat: Money */}
                <div className="mt-4 bg-slate-800/80 px-4 py-1.5 rounded-full border border-slate-700/50 flex items-center gap-2">
                    <span className="text-green-500 font-bold text-sm">Rp</span>
                    <span className="text-white font-bold text-lg tracking-tight">{(stats.revenue / 1000).toFixed(0)}rb</span>
                </div>
            </div>

            {/* Glowing Effects */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent to-white/5 pointer-events-none"></div>
        </div>

        {/* STATUS BAR: "BOLEH PULANG?" */}
        <div className={`w-full max-w-sm mb-6 p-4 rounded-2xl border flex items-center justify-between transition-colors ${
            isSafeHome 
            ? 'bg-green-900/20 border-green-500/50 shadow-[0_0_20px_rgba(16,185,129,0.2)]' 
            : 'bg-slate-800/50 border-slate-700'
        }`}>
            <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Status Pulang</p>
                <h3 className={`text-lg font-black ${isSafeHome ? 'text-green-400' : 'text-slate-300'}`}>
                    {isSafeHome ? "AMAN PULANG! ✅" : "BELUM AMAN 🚧"}
                </h3>
            </div>
            <div className="text-right">
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Target Rupiah</p>
                <p className="text-sm font-bold text-white">
                    {Math.round((stats.revenue / safeTargetRevenue) * 100)}% <span className="text-slate-500 text-xs">Tercapai</span>
                </p>
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
                            <p className="text-[10px] text-slate-500 font-mono">
                                {new Date(tx.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                            </p>
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
    </>
  );
};
