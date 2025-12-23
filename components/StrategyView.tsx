
import React, { useState, useEffect } from 'react';
import { StrategyTip } from '../types';
import { getSmartStrategy } from '../services/smartService'; // NEW IMPORT

export const StrategyView: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'TEKNIS' | 'MARKETING' | 'MENTAL'>('TEKNIS');
  const [tips, setTips] = useState<StrategyTip[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTips = async () => {
        setLoading(true);
        // Load data statis dari knowledgeBase
        const data = await getSmartStrategy(activeCategory);
        setTips(data);
        setLoading(false);
    };
    fetchTips();
  }, [activeCategory]);

  return (
    <div className="min-h-screen bg-slate-900 pb-24 animate-fade-in">
        <div className="bg-slate-900 p-6 pb-4 border-b border-slate-800 sticky top-0 z-30 shadow-md">
            <h1 className="text-xl font-bold text-white flex items-center gap-2 tracking-wide">
                <span>🎓</span> AKADEMI GACOR
            </h1>
            <p className="text-xs text-slate-400 mt-1">Rahasia dapur senior & teknik marketing jalanan.</p>
        </div>

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

            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-10">
                        <div className="inline-block w-8 h-8 border-4 border-slate-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    tips.map((tip, idx) => (
                        <div 
                            key={idx} 
                            className="bg-slate-800 rounded-xl p-5 border border-slate-700 shadow-sm relative overflow-hidden group hover:border-slate-500 transition-colors"
                        >
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
                                    <span className="text-lg">💡</span>
                                </div>
                                <h3 className="text-lg font-bold text-white pt-1">{tip.title}</h3>
                            </div>
                            
                            <div className="bg-slate-900/50 p-4 rounded-lg text-sm text-slate-300 leading-relaxed border border-slate-700/50">
                                {tip.content}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    </div>
  );
};
