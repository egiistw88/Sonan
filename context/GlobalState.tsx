
import React, { createContext, useContext, useReducer, useEffect, ReactNode, useMemo } from 'react';
import { Transaction, DailyTargets, DEFAULT_TARGETS, TransactionType, TransactionCategory } from '../types';

// --- CONSTANTS ---
const STORAGE_KEY = 'sonan_transactions_v2'; // Bump version
const TARGETS_KEY = 'sonan_user_targets';
const ONBOARDING_KEY = 'sonan_onboarding_done';

// --- TYPES ---
interface AppState {
  transactions: Transaction[];
  targets: DailyTargets;
  isOnboardingDone: boolean;
}

type Action =
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'DELETE_TRANSACTION'; payload: string } // Soft Delete ID
  | { type: 'SET_TARGETS'; payload: DailyTargets }
  | { type: 'COMPLETE_ONBOARDING'; payload: DailyTargets }
  | { type: 'IMPORT_DATA'; payload: { transactions: Transaction[]; targets: DailyTargets } }
  | { type: 'RESET_DATA' };

// --- INITIAL STATE ---
const initialState: AppState = {
  transactions: [],
  targets: DEFAULT_TARGETS,
  isOnboardingDone: false,
};

// --- REDUCER (PURE FUNCTION) ---
const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'ADD_TRANSACTION':
      return {
        ...state,
        transactions: [action.payload, ...state.transactions],
      };
    case 'DELETE_TRANSACTION':
      // Soft Delete Implementation (Engineering Handbook 2.2)
      return {
        ...state,
        transactions: state.transactions.map(t => 
            t.id === action.payload ? { ...t, deletedAt: Date.now() } : t
        ),
      };
    case 'SET_TARGETS':
      return { ...state, targets: action.payload };
    case 'COMPLETE_ONBOARDING':
      return { ...state, targets: action.payload, isOnboardingDone: true };
    case 'IMPORT_DATA':
      return {
        ...state,
        transactions: action.payload.transactions,
        targets: action.payload.targets,
        isOnboardingDone: true,
      };
    case 'RESET_DATA':
      return initialState;
    default:
      return state;
  }
};

// --- CONTEXT ---
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
  activeTransactions: Transaction[]; // Helper for non-deleted items
} | undefined>(undefined);

// --- PROVIDER ---
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load initial state lazily
  const [state, dispatch] = useReducer(appReducer, initialState, (defaultState) => {
    try {
      const savedTx = localStorage.getItem(STORAGE_KEY);
      const savedTargets = localStorage.getItem(TARGETS_KEY);
      const savedOnboarding = localStorage.getItem(ONBOARDING_KEY);

      return {
        transactions: savedTx ? JSON.parse(savedTx) : defaultState.transactions,
        targets: savedTargets ? JSON.parse(savedTargets) : defaultState.targets,
        isOnboardingDone: savedOnboarding === 'true',
      };
    } catch (e) {
      console.error("Failed to load state", e);
      return defaultState;
    }
  });

  // Persistence Effect (Side Effect)
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.transactions));
    localStorage.setItem(TARGETS_KEY, JSON.stringify(state.targets));
    if (state.isOnboardingDone) {
        localStorage.setItem(ONBOARDING_KEY, 'true');
    }
  }, [state]);

  // Derived State (Memoized)
  const activeTransactions = useMemo(() => {
    return state.transactions.filter(t => !t.deletedAt);
  }, [state.transactions]);

  return (
    <AppContext.Provider value={{ state, dispatch, activeTransactions }}>
      {children}
    </AppContext.Provider>
  );
};

// --- HOOK ---
export const useAppStore = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppStore must be used within an AppProvider");
  }
  return context;
};
