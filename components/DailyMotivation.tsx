import React from 'react';

interface DailyMotivationProps {
  message: string;
  onClose: () => void;
  loading: boolean;
}

export const DailyMotivation: React.FC<DailyMotivationProps> = ({ message, onClose, loading }) => {
  return (
    <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-md flex items-center justify-center z-[60] p-6 animate-fade-in">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 w-full max-w-sm rounded-3xl p-1 shadow-2xl border border-yellow-500/30 relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-yellow-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
        
        <div className="bg-slate-900/80 rounded-[1.3rem] p-6 text-center backdrop-blur-sm h-full flex flex-col items-center justify-center min-h-[300px]">
            
            <div className="mb-6 bg-yellow-500/20 p-4 rounded-full">
                <span className="text-4xl animate-bounce">🔥</span>
            </div>

            <h2 className="text-white font-black text-xl uppercase tracking-widest mb-4">
                Starter Pack Mental
            </h2>

            {loading ? (
                <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-400 text-sm animate-pulse">Meracik semangat...</p>
                </div>
            ) : (
                <p className="text-yellow-100 text-lg font-medium leading-relaxed italic">
                    "{message}"
                </p>
            )}

            {!loading && (
                <button 
                    onClick={onClose}
                    className="mt-8 bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-black py-4 px-8 rounded-xl w-full shadow-lg shadow-yellow-500/20 transform transition-all active:scale-95"
                >
                    SIAP GASPOL! 🚀
                </button>
            )}
        </div>
      </div>
    </div>
  );
};