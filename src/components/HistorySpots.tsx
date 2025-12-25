
import React, { memo, useState, useEffect } from 'react';
import { Transaction, TransactionType } from '../types';

interface HistorySpotsProps {
  transactions: Transaction[];
  onDelete?: (id: string) => void;
}

const getCategoryIcon = (category?: string) => {
    switch(category) {
        case 'RIDE': return '🏍️';
        case 'FOOD': return '🍔';
        case 'DELIVERY': return '📦';
        case 'SHOP': return '🛒';
        default: return '📄';
    }
};

const PAGE_SIZE = 10;

export const HistorySpots: React.FC<HistorySpotsProps> = memo(({ transactions, onDelete }) => {
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE);
  
  useEffect(() => {
    setDisplayCount(PAGE_SIZE);
  }, [transactions.length]);

  const visibleTransactions = transactions.slice(0, displayCount);
  const hasMore = displayCount < transactions.length;

  const handleLoadMore = () => {
    setDisplayCount(prev => prev + PAGE_SIZE);
  };

  const openMaps = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  };

  return (
    <div className="mt-8">
      <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
        <span>🗺️</span> Jejak Rejeki Hari Ini
      </h3>
      
      <div className="space-y-3">
        {transactions.length === 0 ? (
          <div className="text-center p-8 bg-slate-800/30 rounded-xl border border-dashed border-slate-700">
            <p className="text-slate-500 text-sm">Belum ada jejak hari ini.</p>
            <p className="text-slate-600 text-xs mt-1">Orderan masuk akan muncul di sini beserta lokasinya.</p>
          </div>
        ) : (
          <>
            {visibleTransactions.map(tx => (
                <div key={tx.id} className="bg-slate-800 rounded-xl p-4 border border-slate-700 shadow-sm relative overflow-hidden group">
                <div className="flex justify-between items-start">
                    <div className="flex gap-3">
                    <div className={`mt-1 w-1.5 h-full absolute left-0 top-0 bottom-0 ${tx.type === TransactionType.INCOME ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    
                    <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-lg shrink-0 border border-slate-700">
                        {tx.type === TransactionType.INCOME ? getCategoryIcon(tx.category) : '💸'}
                    </div>

                    <div className="pl-1">
                        <p className="font-bold text-slate-100 text-sm line-clamp-1">{tx.description}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-[10px] text-slate-400 font-mono bg-slate-900 px-1.5 py-0.5 rounded">
                            {new Date(tx.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {tx.type === TransactionType.INCOME && tx.coords && (
                            <span className="text-[10px] text-blue-400 border border-blue-900/50 bg-blue-900/20 px-1.5 py-0.5 rounded uppercase tracking-wider">
                            📍 Ada Lokasi
                            </span>
                        )}
                        </div>
                    </div>
                    </div>
                    
                    <div className="text-right">
                    <p className={`font-bold ${tx.type === TransactionType.INCOME ? 'text-green-400' : 'text-red-400'}`}>
                        {tx.type === TransactionType.INCOME ? '+' : '-'} {Math.abs(tx.amount / 1000).toFixed(0)}rb
                    </p>
                    {onDelete && (
                        <button 
                            onClick={() => onDelete(tx.id)}
                            className="text-[10px] text-slate-600 hover:text-red-500 mt-2 p-1"
                        >
                            Hapus
                        </button>
                    )}
                    </div>
                </div>

                {tx.type === TransactionType.INCOME && tx.coords && (
                    <div className="mt-3 pt-3 border-t border-slate-700/50 flex justify-end">
                    <button 
                        onClick={() => tx.coords && openMaps(tx.coords.lat, tx.coords.lng)}
                        className="flex items-center gap-2 text-[10px] font-bold bg-slate-700 hover:bg-blue-600 hover:text-white text-slate-300 px-3 py-2 rounded-lg transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        Navigasi
                    </button>
                    </div>
                )}
                </div>
            ))}
            
            {hasMore && (
                <button 
                    onClick={handleLoadMore}
                    className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-400 font-bold text-xs rounded-xl border border-slate-700 transition-all"
                >
                    Tampilkan Lebih Banyak ({transactions.length - displayCount} lagi)
                </button>
            )}
          </>
        )}
      </div>
    </div>
  );
});
