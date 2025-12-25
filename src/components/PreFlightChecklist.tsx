
import React, { useState, useEffect } from 'react';
import { triggerHaptic } from '../services/smartService';

interface PreFlightChecklistProps {
  onClose: () => void;
}

const CHECKLIST_ITEMS = [
  { id: 'sim_stnk', label: 'SIM & STNK Aktif', icon: '🪪' },
  { id: 'helm', label: 'Helm Penumpang Bersih & Wangi', icon: '⛑️' },
  { id: 'jas_hujan', label: 'Jas Hujan (Atasan + Bawahan)', icon: '🌧️' },
  { id: 'bensin', label: 'Bensin Terisi > 50%', icon: '⛽' },
  { id: 'powerbank', label: 'Powerbank / Charger Ready', icon: '🔋' },
  { id: 'uang_kembalian', label: 'Uang Kembalian (Receh)', icon: '💵' },
  { id: 'masker', label: 'Masker Cadangan', icon: '😷' },
];

export const PreFlightChecklist: React.FC<PreFlightChecklistProps> = ({ onClose }) => {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  
  useEffect(() => {
    const today = new Date().toDateString();
    const saved = localStorage.getItem('sonan_checklist_' + today);
    if (saved) {
        setCheckedItems(JSON.parse(saved));
    }
  }, []);

  const toggleItem = (id: string) => {
    triggerHaptic('light'); 
    const newState = { ...checkedItems, [id]: !checkedItems[id] };
    setCheckedItems(newState);
    
    const today = new Date().toDateString();
    localStorage.setItem('sonan_checklist_' + today, JSON.stringify(newState));
  };

  const allChecked = CHECKLIST_ITEMS.every(item => checkedItems[item.id]);

  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-slate-900 w-full sm:max-w-sm rounded-t-[2rem] sm:rounded-2xl border-t sm:border border-slate-700 shadow-2xl overflow-hidden animate-slide-up max-h-[90vh] flex flex-col">
        
        <div className="bg-yellow-500 p-6 pb-8 -mb-4 pt-8">
            <h3 className="text-slate-900 font-black text-2xl flex items-center gap-2">
                🛫 Pre-Flight Check
            </h3>
            <p className="text-slate-900/80 text-sm font-medium">SOP Driver Profesional sebelum On-Bid.</p>
        </div>

        <div className="p-6 bg-slate-900 rounded-t-[2rem] flex-1 overflow-y-auto">
            <div className="space-y-3">
                {CHECKLIST_ITEMS.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => toggleItem(item.id)}
                        className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all active:scale-95 ${
                            checkedItems[item.id] 
                            ? 'bg-green-500/10 border-green-500/50 text-green-400' 
                            : 'bg-slate-800 border-slate-700 text-slate-400'
                        }`}
                    >
                        <div className="flex items-center gap-4">
                            <span className="text-2xl">{item.icon}</span>
                            <span className={`font-bold text-sm ${checkedItems[item.id] ? 'line-through decoration-2 opacity-70' : ''}`}>
                                {item.label}
                            </span>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            checkedItems[item.id] ? 'bg-green-500 border-green-500' : 'border-slate-600'
                        }`}>
                            {checkedItems[item.id] && <span className="text-slate-900 font-bold text-xs">✓</span>}
                        </div>
                    </button>
                ))}
            </div>

            <button
                onClick={() => {
                    if (allChecked) triggerHaptic('success');
                    else triggerHaptic('medium');
                    onClose();
                }}
                className={`w-full mt-8 py-4 rounded-xl font-black text-lg transition-all ${
                    allChecked 
                    ? 'bg-green-500 text-white shadow-lg shadow-green-500/30 hover:bg-green-400' 
                    : 'bg-slate-700 text-slate-300'
                }`}
            >
                {allChecked ? "SIAP TERBANG, KAPTEN! 🚀" : "SELESAIKAN PENGECEKAN"}
            </button>
        </div>
      </div>
    </div>
  );
};
