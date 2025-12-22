
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { TransactionForm } from './components/TransactionForm';
import { BottomNav } from './components/BottomNav';
import { DashboardView } from './components/DashboardView';
import { WalletView } from './components/WalletView';
import { RadarView } from './components/RadarView';
import { StrategyView } from './components/StrategyView';
import { DailyMotivation } from './components/DailyMotivation';
import { OnboardingWizard } from './components/OnboardingWizard';
import { Toast } from './components/Toast';
import { AnyepDoctor } from './components/AnyepDoctor';
import { Transaction, TransactionType, TransactionCategory, WeatherData, DEFAULT_TARGETS, DailyTargets } from './types';
import { fetchWeatherAndInsight, getSmartAssistantAnalysis } from './services/geminiService';
import { speakStats } from './services/audioService';
import { useGeolocation } from './hooks/useGeolocation';

const STORAGE_KEY = 'sonan_transactions_v1';
const LAST_DATE_KEY = 'sonan_last_date';
const TARGETS_KEY = 'sonan_user_targets';
const ONBOARDING_KEY = 'sonan_onboarding_done';

const App: React.FC = () => {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'radar' | 'wallet' | 'strategy'>('dashboard');

  // Data State
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [targets, setTargets] = useState<DailyTargets>(DEFAULT_TARGETS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAnyepDoctor, setShowAnyepDoctor] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  // UX State
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null);

  // AI States (Motivation Only)
  const [showMotivation, setShowMotivation] = useState(false); // Default false, trigger after load
  const [motivationMessage, setMotivationMessage] = useState('');
  const [motivationLoading, setMotivationLoading] = useState(true);
  
  // Weather State
  const [weather, setWeather] = useState<WeatherData>({
    locationName: 'Mencari Lokasi...',
    temp: '--',
    condition: '',
    advice: 'Memuat data asisten...',
    loading: true
  });

  const { coords: weatherCoords, error: weatherError, getLocation: getWeatherLocation } = useGeolocation();

  // --- PERSISTENCE & INIT ---
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const lastDate = localStorage.getItem(LAST_DATE_KEY);
      const savedTargets = localStorage.getItem(TARGETS_KEY);
      const isOnboardingDone = localStorage.getItem(ONBOARDING_KEY);
      const todayStr = new Date().toDateString();

      // Load Targets
      if (savedTargets) {
          const parsed = JSON.parse(savedTargets);
          setTargets({ ...DEFAULT_TARGETS, ...parsed });
      }

      // Check Onboarding
      if (!isOnboardingDone) {
          setShowOnboarding(true);
      } else {
          // Only show motivation if onboarding is already done
          setShowMotivation(true); 
      }

      // Load Transactions & Reset Daily
      if (saved && lastDate === todayStr) {
        setTransactions(JSON.parse(saved));
      } else {
        localStorage.setItem(LAST_DATE_KEY, todayStr);
        setTransactions([]);
      }
    } catch (e) {
      console.error("Failed to load data", e);
      setTransactions([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  }, [transactions]);

  const handleFinishOnboarding = (newTargets: DailyTargets) => {
      setTargets(newTargets);
      localStorage.setItem(TARGETS_KEY, JSON.stringify(newTargets));
      localStorage.setItem(ONBOARDING_KEY, 'true');
      setShowOnboarding(false);
      
      // Trigger motivation after onboarding
      setTimeout(() => setShowMotivation(true), 500);
      setToast({ msg: 'Profil Siap! Selamat Bekerja! 🚀', type: 'success' });
  };

  const handleUpdateTargets = (newTargets: DailyTargets) => {
      setTargets(newTargets);
      localStorage.setItem(TARGETS_KEY, JSON.stringify(newTargets));
      setToast({ msg: 'Pengaturan Disimpan! 🎯', type: 'success' });
  };

  const handleImportData = (tx: Transaction[], tg: DailyTargets) => {
      setTransactions(tx);
      setTargets(tg);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tx));
      localStorage.setItem(TARGETS_KEY, JSON.stringify(tg));
      setToast({ msg: 'Data Berhasil Dipulihkan', type: 'success' });
  };

  const handleResetData = () => {
      setTransactions([]);
      setTargets(DEFAULT_TARGETS);
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(TARGETS_KEY);
      localStorage.removeItem(ONBOARDING_KEY);
      window.location.reload(); // Reload to trigger onboarding again
  };

  // --- STATS CALCULATION (CORE LOGIC FIX) ---
  const stats = useMemo(() => {
    const revenue = transactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = transactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + t.amount, 0);

    const orders = transactions.filter(t => t.isOrder).length;
    
    // 1. Uang Real di Kantong
    const realCash = revenue - expenses; 

    // 2. Estimasi Kewajiban (Hutang ke diri sendiri/Aplikasi)
    // Saldo App ~15% dari pendapatan kotor (Estimasi aman)
    const appBalance = Math.floor(revenue * 0.15); 
    
    // Budget Ideal Bensin/Makan (20%) - Ini hanya indikator budget, bukan pengurang saldo
    const gasFundBudget = Math.floor(revenue * 0.20);      
    
    // Tabungan Service ~5% dari pendapatan kotor
    const serviceFund = Math.floor(revenue * 0.05);  
    
    // Cicilan Wajib (Fixed)
    const dailyInstallment = targets.dailyInstallment || 0;

    // 3. Total Kewajiban yang harus disisihkan dari Uang Real
    const totalObligations = appBalance + serviceFund + dailyInstallment;
    
    // 4. Bersih = Uang Real - Kewajiban
    // Jika expenses besar (misal beli bensin banyak), realCash turun, otomatis cleanProfit turun.
    const cleanProfit = realCash - totalObligations;
    
    return { 
      revenue, 
      expenses, 
      orders, 
      realCash, 
      gasFundBudget, // Renamed for clarity 
      appBalance, 
      serviceFund, 
      dailyInstallment,
      cleanProfit 
    };
  }, [transactions, targets.dailyInstallment]);

  const handleVoiceReport = () => {
      speakStats(stats.orders, targets.orders, stats.realCash, weather.advice);
      setToast({ msg: '🔊 Membacakan Laporan...', type: 'info' });
  };

  // --- AI: MOTIVATION ---
  useEffect(() => {
    getWeatherLocation();
    
    if (showMotivation) {
        const initMotivation = async () => {
        setMotivationLoading(true);
        // Only fetch if we don't have a message or it's a fresh start
        if (!motivationMessage) {
            const msg = await getSmartAssistantAnalysis(0, 0, targets.orders, targets.revenue);
            setMotivationMessage(msg);
        }
        setMotivationLoading(false);
        };
        initMotivation();
    }
  }, [getWeatherLocation, targets, showMotivation]); 

  // --- AI: WEATHER ---
  useEffect(() => {
    const updateWeather = async () => {
      if (weatherCoords) {
        const result = await fetchWeatherAndInsight(weatherCoords.lat, weatherCoords.lng);
        setWeather({
          locationName: result.location || "Lokasi",
          temp: result.temp || "--",
          condition: result.condition || "",
          advice: result.advice || "Hati-hati di jalan.",
          loading: false
        });
      } else if (weatherError) {
        setWeather(prev => ({ ...prev, loading: false, locationName: 'GPS Error', advice: 'Cek pengaturan lokasi.' }));
      }
    };

    if (weatherCoords) updateWeather();
  }, [weatherCoords, weatherError]);

  const handleAddTransaction = useCallback((amount: number, type: TransactionType, category: TransactionCategory, description: string, isOrder: boolean, coords?: { lat: number; lng: number }) => {
    const newTx: Transaction = {
      id: Date.now().toString(),
      amount,
      type,
      category,
      description,
      timestamp: Date.now(),
      isOrder,
      coords
    };
    setTransactions(prev => [newTx, ...prev]);
    setToast({ msg: 'Data Berhasil Disimpan!', type: 'success' });
  }, []);

  const handleDeleteTransaction = useCallback((id: string) => {
    if (window.confirm("Yakin ingin menghapus catatan ini?")) {
        setTransactions(prev => prev.filter(t => t.id !== id));
        setToast({ msg: 'Data Dihapus', type: 'info' });
    }
  }, []);

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard':
        return (
          <DashboardView 
            weather={weather}
            onRefreshWeather={getWeatherLocation}
            stats={stats}
            transactions={transactions}
            onDelete={handleDeleteTransaction}
            targets={targets}
            onUpdateTargets={handleUpdateTargets}
            onImportData={handleImportData}
            onResetData={handleResetData}
            onOpenAnyepDoctor={() => setShowAnyepDoctor(true)}
            onVoiceReport={handleVoiceReport}
          />
        );
      case 'radar':
        return <RadarView transactions={transactions} />;
      case 'wallet':
        return (
          <WalletView 
            stats={stats}
            transactions={transactions}
            onDelete={handleDeleteTransaction}
          />
        );
      case 'strategy':
        return <StrategyView />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-yellow-500 selection:text-black overflow-hidden relative">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-yellow-600/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10">
        {toast && (
            <Toast 
                message={toast.msg} 
                type={toast.type} 
                onClose={() => setToast(null)} 
            />
        )}

        {showOnboarding && (
            <OnboardingWizard onFinish={handleFinishOnboarding} />
        )}

        {showMotivation && !showOnboarding && (
            <DailyMotivation 
            message={motivationMessage} 
            loading={motivationLoading}
            onClose={() => setShowMotivation(false)} 
            />
        )}

        {showAnyepDoctor && (
            <AnyepDoctor 
                onClose={() => setShowAnyepDoctor(false)} 
                userCoords={weatherCoords} // Pass the coords we already have
            />
        )}

        {renderContent()}
        
        {showAddModal && (
            <TransactionForm 
                onAdd={handleAddTransaction} 
                onClose={() => setShowAddModal(false)} 
            />
        )}

        <BottomNav 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
            onFabClick={() => setShowAddModal(true)} 
        />
      </div>
      
    </div>
  );
};

export default App;
