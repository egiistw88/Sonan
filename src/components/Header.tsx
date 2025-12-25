
import React, { useState, useEffect, memo } from 'react';
import { WeatherData } from '../types';
import { useAppStore } from '../context/GlobalState';

const LiveClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const dateStr = time.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });
  const timeStr = time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  return (
      <div className="text-right">
          <h2 className="text-3xl font-black text-white leading-none tracking-tighter">{timeStr}</h2>
          <p className="text-[10px] text-yellow-500 font-bold uppercase tracking-widest">{dateStr}</p>
      </div>
  );
};

interface HeaderProps {
  weather: WeatherData;
  onRefreshWeather: () => void;
}

export const Header: React.FC<HeaderProps> = memo(({ weather, onRefreshWeather }) => {
  const { state } = useAppStore();
  const { isSyncing, user } = state;
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
      const handleStatusChange = () => setIsOnline(navigator.onLine);
      window.addEventListener('online', handleStatusChange);
      window.addEventListener('offline', handleStatusChange);
      return () => {
          window.removeEventListener('online', handleStatusChange);
          window.removeEventListener('offline', handleStatusChange);
      };
  }, []);

  return (
    <header className="bg-slate-900 pt-safe px-6 pb-6 rounded-b-[2rem] shadow-xl border-b border-slate-800 relative z-30">
        <div className="flex justify-between items-center">
            {/* Left: Weather & Connection Status */}
            <div className="flex items-center gap-3">
                <button 
                    onClick={onRefreshWeather}
                    className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xl shadow-inner active:scale-95 transition-transform"
                >
                    {weather.loading ? '⏳' : weather.condition.toLowerCase().includes('hujan') ? '🌧️' : '🌥️'}
                </button>
                <div>
                    <p className="text-xl font-bold text-white leading-none">{weather.temp}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                        {/* Sync/Online Indicator */}
                        {user ? (
                            isSyncing ? (
                                <span className="w-2 h-2 rounded-full bg-yellow-500 animate-ping" title="Syncing..."></span>
                            ) : isOnline ? (
                                <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]" title="Online & Synced"></span>
                            ) : (
                                <span className="w-2 h-2 rounded-full bg-slate-500 border border-slate-400" title="Offline Mode"></span>
                            )
                        ) : (
                            <span className="w-2 h-2 rounded-full bg-slate-600" title="Local Mode"></span>
                        )}
                        <p className="text-[10px] text-slate-500 font-bold uppercase max-w-[80px] truncate">
                            {weather.locationName.split(',')[0]}
                        </p>
                    </div>
                </div>
            </div>

            {/* Right: Clock */}
            <LiveClock />
        </div>
        
        {/* Ticker Tape Advice */}
        {weather.advice && (
            <div className="mt-4 bg-slate-950/50 rounded-lg p-2 border border-slate-800/50 flex items-center gap-2 overflow-hidden">
                <span className="text-yellow-500 text-xs shrink-0">💡</span>
                <p className="text-[10px] text-slate-400 font-medium truncate w-full">
                    {weather.advice}
                </p>
            </div>
        )}
    </header>
  );
});
