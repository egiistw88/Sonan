
import React, { useState, useEffect } from 'react';
import { TransactionType, TransactionCategory } from '../types';
import { useGeolocation } from '../hooks/useGeolocation';

interface TransactionFormProps {
  onAdd: (amount: number, type: TransactionType, category: TransactionCategory, description: string, isOrder: boolean, coords?: { lat: number; lng: number }) => void;
  onClose: () => void;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ onAdd, onClose }) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<TransactionType>(TransactionType.INCOME);
  const [category, setCategory] = useState<TransactionCategory>('RIDE');
  const [isOrder, setIsOrder] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { coords, loading: gpsLoading, getLocation } = useGeolocation();

  useEffect(() => {
    getLocation();
  }, [getLocation]);

  useEffect(() => {
    if (type === TransactionType.EXPENSE) {
        setIsOrder(false);
        setCategory('OTHER');
    } else {
        setIsOrder(true);
        setCategory('RIDE'); // Default back to ride
    }
  }, [type]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isSubmitting) return;

    setIsSubmitting(true);
    
    // Slight delay for tactile feel
    setTimeout(() => {
        onAdd(
          parseFloat(amount), 
          type,
          type === TransactionType.INCOME ? category : 'OTHER',
          description || (type === TransactionType.INCOME ? `${category} Order` : 'Pengeluaran'), 
          type === TransactionType.INCOME ? isOrder : false,
          coords || undefined
        );
        setIsSubmitting(false);
        onClose();
    }, 200);
  };

  // Quick Amount Grid (Bigger Buttons)
  const quickAmounts = [
    { label: '5rb', val: 5000 },
    { label: '8rb', val: 8000 },
    { label: '10rb', val: 10000 },
    { label: '12rb', val: 12000 },
    { label: '15rb', val: 15000 },
    { label: '20rb', val: 20000 },
    { label: '30rb', val: 30000 },
    { label: '50rb', val: 50000 },
  ];

  const categories: { id: TransactionCategory; label: string; icon: string }[] = [
      { id: 'RIDE', label: 'Motor', icon: '🏍️' },
      { id: 'FOOD', label: 'Food', icon: '🍔' },
      { id: 'DELIVERY', label: 'Kirim', icon: '📦' },
      { id: 'SHOP', label: 'Belanja', icon: '🛒' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center h-[100dvh]">
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      <div className="relative w-full max-w-md bg-slate-900 rounded-t-[2rem] border-t border-slate-700 shadow-2xl animate-slide-up flex flex-col max-h-[95dvh]">
        
        {/* Handle for visual cue */}
        <div className="w-full flex justify-center pt-4 pb-2 shrink-0">
            <div className="w-16 h-1.5 bg-slate-700 rounded-full"></div>
        </div>

        <div className="p-6 pt-2 overflow-y-auto no-scrollbar">
            
            {/* Header: Toggle Type */}
            <div className="flex bg-slate-800 p-1.5 rounded-2xl mb-6">
                <button
                    type="button"
                    onClick={() => setType(TransactionType.INCOME)}
                    className={`flex-1 py-3 rounded-xl text-sm font-black uppercase tracking-wide transition-all ${type === TransactionType.INCOME ? 'bg-green-500 text-slate-900 shadow-lg' : 'text-slate-500'}`}
                >
                    Pemasukan
                </button>
                <button
                    type="button"
                    onClick={() => setType(TransactionType.EXPENSE)}
                    className={`flex-1 py-3 rounded-xl text-sm font-black uppercase tracking-wide transition-all ${type === TransactionType.EXPENSE ? 'bg-red-500 text-white shadow-lg' : 'text-slate-500'}`}
                >
                    Pengeluaran
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* BIG INPUT AMOUNT */}
                <div className="text-center">
                    <label className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Nominal</label>
                    <div className="flex items-center justify-center gap-1 mt-1">
                         <span className={`text-3xl font-bold ${type === TransactionType.INCOME ? 'text-green-500' : 'text-red-500'}`}>Rp</span>
                         <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0"
                            inputMode="numeric"
                            autoFocus
                            className="bg-transparent text-6xl font-black text-white w-full text-center focus:outline-none placeholder-slate-800 caret-yellow-400 p-0 m-0"
                        />
                    </div>
                </div>

                {/* Quick Buttons Grid (Thumb Friendly) */}
                <div className="grid grid-cols-4 gap-3">
                    {quickAmounts.map((item) => (
                    <button
                        key={item.val}
                        type="button"
                        onClick={() => setAmount(item.val.toString())}
                        className="bg-slate-800 hover:bg-slate-700 active:bg-slate-600 active:scale-95 text-slate-300 font-bold py-3 rounded-xl border border-slate-700 transition-all text-sm shadow-sm"
                    >
                        {item.label}
                    </button>
                    ))}
                </div>

                {/* CATEGORY & GPS INFO */}
                {type === TransactionType.INCOME && (
                    <div className="grid grid-cols-4 gap-2">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() => setCategory(cat.id)}
                                className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all active:scale-95 ${
                                    category === cat.id 
                                    ? 'bg-yellow-500/20 border-yellow-500 text-yellow-500' 
                                    : 'bg-slate-800 border-transparent text-slate-500'
                                }`}
                            >
                                <span className="text-2xl mb-1 grayscale filter opacity-80">{cat.icon}</span>
                                <span className="text-[9px] font-bold uppercase">{cat.label}</span>
                            </button>
                        ))}
                    </div>
                )}
                
                {/* GPS Status (Tiny) */}
                <div className="flex items-center justify-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${gpsLoading ? 'bg-yellow-500 animate-pulse' : coords ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase">
                        {gpsLoading ? 'Mencari Satelit...' : coords ? 'Lokasi Tercatat' : 'Tanpa Lokasi'}
                    </span>
                </div>

                {/* Confirm Button (Huge) */}
                <button
                    type="submit"
                    disabled={!amount || isSubmitting}
                    className={`w-full py-5 rounded-2xl font-black text-lg text-white shadow-2xl transform active:scale-[0.98] transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:grayscale ${
                        type === TransactionType.INCOME 
                        ? 'bg-gradient-to-r from-green-600 to-emerald-500 shadow-green-500/30' 
                        : 'bg-gradient-to-r from-red-600 to-rose-500 shadow-red-500/30'
                    }`}
                >
                    {isSubmitting ? "MENYIMPAN..." : type === TransactionType.INCOME ? "TERIMA UANG 💰" : "CATAT PENGELUARAN 💸"}
                </button>
                
                {/* Spacer for iPhone Home Bar */}
                <div className="h-4"></div>
            </form>
        </div>
      </div>
    </div>
  );
};
