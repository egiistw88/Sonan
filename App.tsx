
import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { AppProvider, useAppStore } from './context/GlobalState';
import { TransactionForm } from './components/TransactionForm';
import { BottomNav } from './components/BottomNav';
import { DashboardView } from './components/DashboardView'; // Eager load Dashboard (Landing Page)
import { DailyMotivation } from './components/DailyMotivation';
import { OnboardingWizard } from './components/OnboardingWizard';
import { Toast } from './components/Toast';
import { AnyepDoctor } from './components/AnyepDoctor';
import { TransactionType, TransactionCategory, WeatherData } from './types';
import { getDailyMotivation } from './services/smartService';
import { speakStats } from './services/audioService';
import { useGeolocation } from './hooks/useGeolocation';

// --- LAZY LOADED COMPONENTS (Performance Strategy) ---
// Menggunakan import() promise mapping karena komponen menggunakan named exports
const RadarView = React.lazy(() => import('./components/RadarView').then(module => ({ default: module.RadarView })));
const WalletView = React.lazy(() => import('./components/WalletView').then(module => ({ default: module.WalletView })));
const StrategyView = React.lazy(() => import('./components/StrategyView').then(module => ({ default: module.StrategyView })));

const LoadingScreen = () => (
  <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
    <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mb-4"></div>
    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest animate-pulse">Memuat Modul...</p>
  </div>
);

const AppContent: React.FC = () => {
  // Navigation State (Local UI State)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'radar' | 'wallet' | 'strategy'>('dashboard');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAnyepDoctor, setShowAnyepDoctor] = useState(false);
  const [showMotivation, setShowMotivation] = useState(false); 
  const [motivationMessage, setMotivationMessage] = useState('');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Global Data from Store
  const { state, dispatch, activeTransactions } = useAppStore();
  const { targets, isOnboardingDone } = state;

  // Services
  const { coords: userCoords, getLocation: getGpsLocation } = useGeolocation();

  // Weather State (Offline Friendly)
  const [weather] = useState<WeatherData>({
    locationName: 'Bandung',
    temp: '24°C',
    condition: 'Cerah Berawan',
    advice: 'Siapkan jas hujan (Sedia payung sebelum hujan).',
    loading: false
  });

  // --- INIT LOGIC ---
  useEffect(() => {
    getGpsLocation();
    
    // Show motivation if onboarding is done
    if (isOnboardingDone) {
        const msg = getDailyMotivation();
        setMotivationMessage(msg);
        // Small delay for smooth entry
        setTimeout(() => setShowMotivation(true), 1000);
    }
  }, [getGpsLocation, isOnboardingDone]);

  // --- ACTIONS ---
  const handleFinishOnboarding = (newTargets: any) => {
      dispatch({ type: 'COMPLETE_ONBOARDING', payload: newTargets });
      setToast({ msg: 'Profil Siap! Cek "SOP Pre-Flight" sekarang!', type: 'success' });
      
      const msg = getDailyMotivation();
      setMotivationMessage(msg);
      setShowMotivation(true);
  };

  const handleUpdateTargets = (newTargets: any) => {
      dispatch({ type: 'SET_TARGETS', payload: newTargets });
      setToast({ msg: 'Pengaturan Disimpan! 🎯', type: 'success' });
  };

  const handleImportData = (tx: any[], tg: any) => {
      dispatch({ type: 'IMPORT_DATA', payload: { transactions: tx, targets: tg } });
      setToast({ msg: 'Data Berhasil Dipulihkan', type: 'success' });
  };

  const handleResetData = () => {
      dispatch({ type: 'RESET_DATA' });
      window.location.reload(); 
  };

  const handleAddTransaction = (amount: number, type: TransactionType, category: TransactionCategory, description: string, isOrder: boolean, coords?: { lat: number; lng: number }) => {
    const newTx = {
      id: Date.now().toString(),
      amount,
      type,
      category,
      description,
      timestamp: Date.now(),
      isOrder,
      coords
    };
    dispatch({ type: 'ADD_TRANSACTION', payload: newTx });
    setToast({ msg: 'Data Berhasil Disimpan!', type: 'success' });
  };

  const handleDeleteTransaction = (id: string) => {
    if (window.confirm("Yakin ingin menghapus catatan ini?")) {
        dispatch({ type: 'DELETE_TRANSACTION', payload: id });
        setToast({ msg: 'Data Dihapus (Soft Delete)', type: 'info' });
    }
  };

  // --- STATS CALCULATION (Computed Properties) ---
  const stats = useMemo(() => {
    const revenue = activeTransactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = activeTransactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + t.amount, 0);

    const orders = activeTransactions.filter(t => t.isOrder).length;
    
    const realCash = revenue - expenses; 
    const appBalance = Math.floor(revenue * 0.15); 
    const gasFundBudget = Math.floor(revenue * 0.20);      
    const serviceFund = Math.floor(revenue * 0.05);  
    const dailyInstallment = targets.dailyInstallment || 0;
    const totalObligations = appBalance + serviceFund + dailyInstallment;
    const cleanProfit = realCash - totalObligations;
    
    return { 
      revenue, expenses, orders, realCash, 
      gasFundBudget, appBalance, serviceFund, 
      dailyInstallment, cleanProfit 
    };
  }, [activeTransactions, targets.dailyInstallment]);

  const handleVoiceReport = () => {
      speakStats(stats.orders, targets.orders, stats.realCash, "Semangat pejuang keluarga!");
      setToast({ msg: '🔊 Membacakan Laporan...', type: 'info' });
  };

  // --- RENDER ROUTER ---
  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard':
        return (
          <DashboardView 
            weather={weather}
            onRefreshWeather={() => setToast({msg: "Cuaca offline (Statik)", type: "info"})}
            stats={stats}
            transactions={activeTransactions}
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
        return (
          <Suspense fallback={<LoadingScreen />}>
            <RadarView transactions={activeTransactions} />
          </Suspense>
        );
      case 'wallet':
        return (
           <Suspense fallback={<LoadingScreen />}>
            <WalletView 
              stats={stats}
              transactions={activeTransactions}
              onDelete={handleDeleteTransaction}
            />
          </Suspense>
        );
      case 'strategy':
        return (
          <Suspense fallback={<LoadingScreen />}>
            <StrategyView />
          </Suspense>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-yellow-500 selection:text-black overflow-hidden relative">
      <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-yellow-600/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10">
        {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
        
        {!isOnboardingDone && <OnboardingWizard onFinish={handleFinishOnboarding} />}

        {showMotivation && isOnboardingDone && (
            <DailyMotivation message={motivationMessage} loading={false} onClose={() => setShowMotivation(false)} />
        )}

        {showAnyepDoctor && <AnyepDoctor onClose={() => setShowAnyepDoctor(false)} userCoords={userCoords} />}

        {renderContent()}
        
        {showAddModal && <TransactionForm onAdd={handleAddTransaction} onClose={() => setShowAddModal(false)} />}

        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} onFabClick={() => setShowAddModal(true)} />
      </div>
    </div>
  );
};

// Root Component wrapped with Provider
const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
