
import React, { useState, useEffect } from 'react';
import { ACADEMY_MODULES, QUIZ_DATA, CHAT_TEMPLATES, AcademyModule, QuizQuestion } from '../data/academyData';
import { triggerHaptic } from '../services/smartService';

export const StrategyView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'BELAJAR' | 'KUIS' | 'TOOLS'>('BELAJAR');
  const [selectedModule, setSelectedModule] = useState<AcademyModule | null>(null);
  
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isQuizFinished, setIsQuizFinished] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  const [shuffledQuiz, setShuffledQuiz] = useState<QuizQuestion[]>([]);

  useEffect(() => {
    setShuffledQuiz([...QUIZ_DATA].sort(() => 0.5 - Math.random()));
  }, []);

  const handleModuleClick = (module: AcademyModule) => {
      triggerHaptic('light');
      setSelectedModule(module);
  };

  const handleAnswerClick = (index: number) => {
      if (showExplanation) return; 

      setSelectedAnswer(index);
      setShowExplanation(true);
      
      const currentQ = shuffledQuiz[currentQuizIndex];
      if (index === currentQ.correctIndex) {
          triggerHaptic('success');
          setQuizScore(s => s + 1);
      } else {
          triggerHaptic('error');
      }
  };

  const handleNextQuestion = () => {
      triggerHaptic('light');
      if (currentQuizIndex < shuffledQuiz.length - 1) {
          setCurrentQuizIndex(p => p + 1);
          setShowExplanation(false);
          setSelectedAnswer(null);
      } else {
          setIsQuizFinished(true);
          triggerHaptic('success');
      }
  };

  const resetQuiz = () => {
      triggerHaptic('medium');
      setShuffledQuiz([...QUIZ_DATA].sort(() => 0.5 - Math.random()));
      setCurrentQuizIndex(0);
      setQuizScore(0);
      setShowExplanation(false);
      setIsQuizFinished(false);
      setSelectedAnswer(null);
  };

  const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text);
      triggerHaptic('success');
      alert("Teks berhasil disalin! Tinggal tempel di chat.");
  };

  return (
    <div className="min-h-screen bg-slate-900 pb-24 animate-fade-in relative">
        
        <div className="bg-slate-900 p-6 pb-4 border-b border-slate-800 sticky top-0 z-30 shadow-md">
            <h1 className="text-xl font-bold text-white flex items-center gap-2 tracking-wide">
                <span>🎓</span> AKADEMI SONAN
            </h1>
            <p className="text-xs text-slate-400 mt-1">Upgrade skill, dompet terisi.</p>
        </div>

        <div className="px-4 mt-4">
            <div className="flex bg-slate-800 p-1 rounded-xl mb-6 border border-slate-700">
                <button 
                    onClick={() => { triggerHaptic('light'); setActiveTab('BELAJAR'); }}
                    className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'BELAJAR' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'}`}
                >
                    MODUL
                </button>
                <button 
                    onClick={() => { triggerHaptic('light'); setActiveTab('KUIS'); }}
                    className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'KUIS' ? 'bg-yellow-500 text-slate-900 shadow-lg' : 'text-slate-400'}`}
                >
                    ASAH OTAK
                </button>
                <button 
                    onClick={() => { triggerHaptic('light'); setActiveTab('TOOLS'); }}
                    className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'TOOLS' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400'}`}
                >
                    TOOLS
                </button>
            </div>
        </div>

        <div className="px-4">
            
            {activeTab === 'BELAJAR' && (
                <div className="space-y-4 animate-slide-up">
                    <div className="grid grid-cols-2 gap-3">
                        {ACADEMY_MODULES.map((mod) => (
                            <button 
                                key={mod.id}
                                onClick={() => handleModuleClick(mod)}
                                className="bg-slate-800 p-4 rounded-2xl border border-slate-700 text-left hover:border-slate-500 transition-all active:scale-95 group"
                            >
                                <div className={`${mod.color} w-10 h-10 rounded-full flex items-center justify-center text-xl mb-3 shadow-lg`}>
                                    {mod.icon}
                                </div>
                                <h3 className="text-white font-bold text-sm leading-tight mb-1">{mod.title}</h3>
                                <p className="text-[10px] text-slate-400 line-clamp-2">{mod.description}</p>
                            </button>
                        ))}
                    </div>
                    
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-dashed border-slate-700 text-center">
                        <p className="text-xs text-slate-500 italic">
                            "Investasi terbaik adalah investasi leher ke atas. Driver pinter, rejeki banter."
                        </p>
                    </div>
                </div>
            )}

            {activeTab === 'KUIS' && (
                <div className="animate-slide-up">
                    {!isQuizFinished ? (
                        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl relative overflow-hidden">
                            {shuffledQuiz.length > 0 && (
                                <>
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-[10px] font-bold bg-slate-700 px-2 py-1 rounded text-slate-300">
                                            Soal {currentQuizIndex + 1} / {shuffledQuiz.length}
                                        </span>
                                        <span className="text-xs font-bold text-yellow-500">Skor: {quizScore}00</span>
                                    </div>
                                    
                                    <h3 className="text-white font-bold text-lg mb-6 leading-relaxed">
                                        {shuffledQuiz[currentQuizIndex].question}
                                    </h3>

                                    <div className="space-y-3">
                                        {shuffledQuiz[currentQuizIndex].options.map((opt, idx) => {
                                            const isSelected = selectedAnswer === idx;
                                            const isCorrect = idx === shuffledQuiz[currentQuizIndex].correctIndex;
                                            
                                            let btnClass = "bg-slate-700 border-slate-600 text-slate-300";
                                            if (showExplanation) {
                                                if (isCorrect) btnClass = "bg-green-600 border-green-500 text-white";
                                                else if (isSelected && !isCorrect) btnClass = "bg-red-600 border-red-500 text-white";
                                                else btnClass = "bg-slate-700 border-slate-600 text-slate-500 opacity-50";
                                            }

                                            return (
                                                <button
                                                    key={idx}
                                                    onClick={() => handleAnswerClick(idx)}
                                                    disabled={showExplanation}
                                                    className={`w-full p-4 rounded-xl border text-left text-sm font-bold transition-all ${btnClass} ${!showExplanation ? 'hover:bg-slate-600 active:scale-98' : ''}`}
                                                >
                                                    {opt}
                                                </button>
                                            )
                                        })}
                                    </div>

                                    {showExplanation && (
                                        <div className="mt-6 animate-fade-in">
                                            <div className="bg-blue-900/30 p-4 rounded-xl border border-blue-500/30 mb-4">
                                                <p className="text-blue-200 text-xs leading-relaxed">
                                                    <span className="font-bold">Penjelasan:</span> {shuffledQuiz[currentQuizIndex].explanation}
                                                </p>
                                            </div>
                                            <button 
                                                onClick={handleNextQuestion}
                                                className="w-full bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold py-3 rounded-xl shadow-lg"
                                            >
                                                {currentQuizIndex < shuffledQuiz.length - 1 ? "LANJUT 👉" : "LIHAT HASIL 🏁"}
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="text-center bg-slate-800 rounded-2xl p-8 border border-slate-700 shadow-xl animate-fade-in">
                            <div className="text-6xl mb-4">{quizScore > 2 ? '🏆' : '📚'}</div>
                            <h2 className="text-2xl font-black text-white mb-2">Kuis Selesai!</h2>
                            <p className="text-slate-400 mb-6">Kamu menjawab benar {quizScore} dari {shuffledQuiz.length} soal.</p>
                            
                            <div className="bg-slate-900 p-4 rounded-xl mb-6">
                                <p className="text-yellow-500 font-bold text-lg">
                                    Nilai: {Math.round((quizScore / shuffledQuiz.length) * 100)}
                                </p>
                            </div>

                            <button 
                                onClick={resetQuiz}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl shadow-lg"
                            >
                                Ulangi Kuis
                            </button>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'TOOLS' && (
                <div className="space-y-4 animate-slide-up">
                    <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-5 rounded-2xl shadow-lg text-white mb-4">
                        <h3 className="font-bold text-lg mb-1">💬 Template Chat Sakti</h3>
                        <p className="text-xs opacity-80">Klik tombol untuk menyalin teks. Hemat waktu ngetik!</p>
                    </div>

                    {CHAT_TEMPLATES.map((tpl, idx) => (
                        <div key={idx} className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex gap-4 items-start">
                            <div className="flex-1">
                                <h4 className="text-cyan-400 text-xs font-bold uppercase mb-2">{tpl.label}</h4>
                                <p className="text-slate-300 text-sm italic bg-slate-900/50 p-2 rounded border border-slate-700/50">
                                    "{tpl.text}"
                                </p>
                            </div>
                            <button 
                                onClick={() => copyToClipboard(tpl.text)}
                                className="bg-slate-700 hover:bg-slate-600 text-white p-3 rounded-xl active:scale-90 transition-transform"
                            >
                                📋
                            </button>
                        </div>
                    ))}
                </div>
            )}

        </div>

        {selectedModule && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm" onClick={() => setSelectedModule(null)}></div>
                <div className="bg-slate-900 w-full max-w-md rounded-2xl border border-slate-700 shadow-2xl relative overflow-hidden flex flex-col max-h-[85vh] animate-slide-up">
                    
                    <div className={`${selectedModule.color} p-6 pb-8`}>
                        <div className="flex justify-between items-start">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center text-3xl shadow-inner">
                                {selectedModule.icon}
                            </div>
                            <button onClick={() => setSelectedModule(null)} className="bg-black/20 hover:bg-black/40 text-white rounded-full w-8 h-8 font-bold">✕</button>
                        </div>
                        <h2 className="text-2xl font-black text-white mt-4">{selectedModule.title}</h2>
                        <p className="text-white/80 text-sm mt-1">{selectedModule.description}</p>
                    </div>

                    <div className="p-6 overflow-y-auto space-y-6 bg-slate-900 flex-1">
                        {selectedModule.content.map((section, idx) => (
                            <div key={idx} className="border-l-2 border-slate-700 pl-4">
                                <h4 className="text-yellow-500 font-bold text-sm mb-2 uppercase tracking-wide">
                                    {section.subtitle}
                                </h4>
                                <p className="text-slate-300 text-sm leading-relaxed">
                                    {section.body}
                                </p>
                            </div>
                        ))}
                        
                        <div className="pt-4">
                            <button 
                                onClick={() => { triggerHaptic('light'); setSelectedModule(null); }}
                                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl border border-slate-700"
                            >
                                Tutup Materi
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

    </div>
  );
};
