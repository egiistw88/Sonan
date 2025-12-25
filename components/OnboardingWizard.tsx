
import React, { useState } from 'react';
import { DailyTargets, DEFAULT_TARGETS } from '../types';
import { triggerHaptic } from '../services/smartService';

interface OnboardingWizardProps {
  onFinish: (targets: DailyTargets) => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onFinish }) => {
  const [step, setStep] = useState(1);
  const [orders, setOrders] = useState('20');
  const [revenue, setRevenue] = useState('200000');
  const [installment, setInstallment] = useState('0');

  const handleNext = () => {
    if (step < 3) {
        triggerHaptic('light');
        setStep(step + 1);
    } else {
        triggerHaptic('success');
        onFinish({
            orders: parseInt(orders) || 20,
            revenue: parseInt(revenue) || 200000,
            dailyInstallment: parseInt(installment) || 0
        });
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
        
        {/* Progress Dots */}
        <div className="flex gap-2 mb-8">
            <div className={`w-3 h-3 rounded-full transition-all ${step >= 1 ? 'bg-yellow-500' : 'bg-slate-800'}`}></div>
            <div className={`w-3 h-3 rounded-full transition-all ${step >= 2 ? 'bg-yellow-500' : 'bg-slate-800'}`}></div>
            <div className={`w-3 h-3 rounded-full transition-all ${step >= 3 ? 'bg-yellow-500' : 'bg-slate-800'}`}></div>
        </div>

        <div className="w-full max-w-sm">
            {step === 1 && (
                <div className="animate-slide-up">
                    <span className="text-6xl mb-4 block">🎯</span>
                    <h1 className="text-3xl font-black text-white mb-2">Target Order?</h1>
                    <p className="text-slate-400 mb-8">Berapa tarikan yang realistis buat lu hari ini?</p>
                    
                    <div className="relative mb-8">
                         <input 
                            type="number" 
                            value={orders}
                            onChange={(e) => setOrders(e.target.value)}
                            className="bg-transparent border-b-2 border-yellow-500 text-6xl font-black text-center w-full focus:outline-none text-white py-2"
                            autoFocus
                         />
                         <span className="text-slate-500 text-sm font-bold uppercase mt-2 block">Trip / Hari</span>
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="animate-slide-up">
                    <span className="text-6xl mb-4 block">💰</span>
                    <h1 className="text-3xl font-black text-white mb-2">Target Rupiah?</h1>
                    <p className="text-slate-400 mb-8">Berapa duit kotor yang mau dibawa pulang?</p>
                    
                    <div className="relative mb-8">
                         <span className="text-2xl text-green-500 font-bold absolute left-0 top-4">Rp</span>
                         <input 
                            type="number" 
                            value={revenue}
                            onChange={(e) => setRevenue(e.target.value)}
                            className="bg-transparent border-b-2 border-green-500 text-5xl font-black text-center w-full focus:outline-none text-white py-2 pl-8"
                            autoFocus
                         />
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="animate-slide-up">
                    <span className="text-6xl mb-4 block">🧾</span>
                    <h1 className="text-3xl font-black text-white mb-2">Ada Cicilan?</h1>
                    <p className="text-slate-400 mb-8">Cicilan motor/HP yang WAJIB disisihkan per hari.</p>
                    
                    <div className="relative mb-8">
                         <span className="text-2xl text-red-500 font-bold absolute left-0 top-4">Rp</span>
                         <input 
                            type="number" 
                            value={installment}
                            onChange={(e) => setInstallment(e.target.value)}
                            className="bg-transparent border-b-2 border-red-500 text-5xl font-black text-center w-full focus:outline-none text-white py-2 pl-8"
                            placeholder="0"
                            autoFocus
                         />
                         <span className="text-slate-500 text-[10px] mt-2 block">Isi 0 jika tidak ada</span>
                    </div>
                </div>
            )}

            <button 
                onClick={handleNext}
                className="w-full bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-black py-4 rounded-xl shadow-lg shadow-yellow-500/20 active:scale-95 transition-all text-lg"
            >
                {step === 3 ? "GASPOL MULAI! 🚀" : "LANJUT 👉"}
            </button>
        </div>
    </div>
  );
};
