import React from 'react';

interface BottomNavProps {
  activeTab: 'dashboard' | 'radar' | 'wallet' | 'strategy';
  onTabChange: (tab: 'dashboard' | 'radar' | 'wallet' | 'strategy') => void;
  onFabClick: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange, onFabClick }) => {
  
  const getTabClass = (tabName: string, color: string) => {
      const isActive = activeTab === tabName;
      return `flex flex-col items-center gap-1.5 w-16 pt-3 pb-1 rounded-2xl transition-all duration-300 ${
          isActive 
          ? `${color} bg-slate-800` 
          : 'text-slate-500 hover:text-slate-300'
      }`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-xl border-t border-slate-800 pb-safe px-4 h-[84px] z-40 flex justify-between items-start shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
      
      {/* Home Tab */}
      <button 
        onClick={() => onTabChange('dashboard')}
        className={getTabClass('dashboard', 'text-yellow-400')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        </svg>
        <span className="text-[9px] font-bold tracking-wide">Beranda</span>
      </button>

      {/* Radar Tab */}
      <button 
        onClick={() => onTabChange('radar')}
        className={getTabClass('radar', 'text-cyan-400')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
        </svg>
        <span className="text-[9px] font-bold tracking-wide">Radar</span>
      </button>

      {/* FAB (Floating Button) - Raised with Ripple Glow */}
      <div className="relative -top-8">
        <div className="absolute inset-0 bg-yellow-500 blur-xl opacity-20 rounded-full animate-pulse-slow"></div>
        <button 
            onClick={onFabClick}
            className="relative bg-gradient-to-br from-yellow-400 to-yellow-600 text-slate-900 rounded-full w-16 h-16 flex items-center justify-center shadow-2xl shadow-yellow-500/40 transform transition-transform active:scale-90 border-[6px] border-slate-900 z-50 group"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 transition-transform group-hover:rotate-90 duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
        </button>
      </div>

      {/* Wallet Tab */}
      <button 
        onClick={() => onTabChange('wallet')}
        className={getTabClass('wallet', 'text-green-400')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
        <span className="text-[9px] font-bold tracking-wide">Dompet</span>
      </button>

       {/* Strategy Tab */}
       <button 
        onClick={() => onTabChange('strategy')}
        className={getTabClass('strategy', 'text-purple-400')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
        </svg>
        <span className="text-[9px] font-bold tracking-wide">Akademi</span>
      </button>

    </div>
  );
};