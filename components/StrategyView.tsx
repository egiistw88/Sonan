import React, { useState, useEffect } from 'react';
import { StrategyTip } from '../types';
import { getDriverStrategy } from '../services/geminiService';

export const StrategyView: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'TEKNIS' | 'MARKETING' | 'MENTAL'>('TEKNIS');
  const [tips, setTips] = useState<StrategyTip[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTips = async () => {
        setLoading(true);
        const data = await getDriverStrategy(activeCategory);
        setTips(data);
        setLoading(false);
    };
    fetchTips();
  }, [activeCategory]);

  return (
    <div className="min-h-screen bg-slate-900 pb-24 animate-fade-in">
        {/* Header */}
        <div className="bg-slate-900 p-6 pb-4 border-b border-slate-800 sticky top-0 z-30 shadow-md">
            <h1 className="text-xl font-bold text-white flex items-center gap-2 tracking-wide">
                <span>🎓</span> AKADEMI GACOR
            </h1>
            <p className="text-xs text-slate-400 mt-1">Rahasia dapur senior & teknik marketing jalanan.</p>
        </div>

        {/* Categories */}
        <div className="p-4">
            <div className="flex bg-slate-800 p-1 rounded-xl mb-6">
                <button 
                    onClick={() => setActiveCategory('TEKNIS')}
                    className={`flex-1 py-2 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${activeCategory === 'TEKNIS' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'}`}
                >
                    TEKNIS APP
                </button>
                <button 
                    onClick={() => setActiveCategory('MARKETING')}
                    className={`flex-1 py-2 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${activeCategory === 'MARKETING' ? 'bg-yellow-500 text-slate-900 shadow-lg' : 'text-slate-400'}`}
                >
                    MARKETING
                </button>
                <button 
                    onClick={() => setActiveCategory('MENTAL')}
                    className={`flex-1 py-2 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${activeCategory === 'MENTAL' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400'}`}
                >
                    MENTAL
                </button>
            </div>

            {/* Content List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-10">
                        <div className="inline-block w-8 h-8 border-4 border-slate-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-slate-500 text-sm mt-3 animate-pulse">Menghubungi Mentor...</p>
                    </div>
                ) : (
                    tips.map((tip, idx) => (
                        <div 
                            key={idx} 
                            className="bg-slate-800 rounded-xl p-5 border border-slate-700 shadow-sm relative overflow-hidden group hover:border-slate-500 transition-colors"
                        >
                            {/* Difficulty Badge */}
                            <div className="absolute top-0 right-0 p-3">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                    tip.difficulty === 'SENIOR' 
                                    ? 'bg-red-900/30 text-red-400 border-red-800' 
                                    : 'bg-green-900/30 text-green-400 border-green-800'
                                }`}>
                                    LEVEL: {tip.difficulty}
                                </span>
                            </div>

                            <div className="flex items-start gap-3 mb-3">
                                <div className={`p-2 rounded-lg mt-1 ${
                                    activeCategory === 'TEKNIS' ? 'bg-blue-500/10 text-blue-400' :
                                    activeCategory === 'MARKETING' ? 'bg-yellow-500/10 text-yellow-400' :
                                    'bg-purple-500/10 text-purple-400'
                                }`}>
                                    {activeCategory === 'TEKNIS' && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                                    {activeCategory === 'MARKETING' && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>}
                                    {activeCategory === 'MENTAL' && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                                </div>
                                <h3 className="text-lg font-bold text-white pt-1">{tip.title}</h3>
                            </div>
                            
                            <div className="bg-slate-900/50 p-4 rounded-lg text-sm text-slate-300 leading-relaxed border border-slate-700/50">
                                {tip.content}
                            </div>

                            <div className="mt-3 flex justify-end">
                                <button className="text-[10px] text-slate-500 hover:text-white transition-colors">
                                    Simpan Tips Ini 🔖
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    </div>
  );
};