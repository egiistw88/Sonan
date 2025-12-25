
import React, { createContext, useContext, useReducer, useEffect, ReactNode, useMemo, useState } from 'react';
import { Transaction, DailyTargets, DEFAULT_TARGETS, UserProfile } from '../types';
import { 
    subscribeToAuth, 
    subscribeToTransactions, 
    subscribeToTargets, 
    addTransactionToCloud, 
    updateTransactionInCloud, 
    saveUserProfile 
} from '../services/firebase';

// --- CONSTANTS ---
const STORAGE_KEY = 'sonan_transactions_v2'; 
const TARGETS_KEY = 'sonan_user_targets';
const ONBOARDING_KEY = 'sonan_onboarding_done';

// --- TYPES ---
interface AppState {
  transactions: Transaction[];
  targets: DailyTargets;
  isOnboardingDone: boolean;
  user: UserProfile | null; // New: Auth State
  isSyncing: boolean; // New: Loading state for sync
}

type Action =
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'DELETE_TRANSACTION'; payload: string } 
  | { type: 'SET_TARGETS'; payload: DailyTargets }
  | { type: 'COMPLETE_ONBOARDING'; payload: DailyTargets }
  | { type: 'IMPORT_DATA'; payload: { transactions: Transaction[]; targets: DailyTargets } }
  | { type: 'RESET_DATA' }
  | { type: 'SET_USER'; payload: UserProfile | null } // New Action
  | { type: 'SYNC_START' }
  | { type: 'SYNC_SUCCESS'; payload: { transactions: Transaction[], targets?: DailyTargets } };

// --- INITIAL STATE ---
const initialState: AppState = {
  transactions: [],
  targets: DEFAULT_TARGETS,
  isOnboardingDone: false,
  user: null,
  isSyncing: false,
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
      return { ...initialState, user: state.user }; // Keep user logged in on reset
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SYNC_START':
      return { ...state, isSyncing: true };
    case 'SYNC_SUCCESS':
      return { 
          ...state, 
          isSyncing: false, 
          transactions: action.payload.transactions,
          targets: action.payload.targets || state.targets,
          isOnboardingDone: true // If data synced, assume onboarding done
      };
    default:
      return state;
  }
};

// --- CONTEXT ---
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>; // We will wrap this dispatch
  activeTransactions: Transaction[];
  handleCloudAction: (action: Action) => void; // Special handler for cloud
} | undefined>(undefined);

// --- PROVIDER ---
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 1. Load Local Storage Initial State
  const [state, dispatch] = useReducer(appReducer, initialState, (defaultState) => {
    try {
      const savedTx = localStorage.getItem(STORAGE_KEY);
      const savedTargets = localStorage.getItem(TARGETS_KEY);
      const savedOnboarding = localStorage.getItem(ONBOARDING_KEY);

      return {
        ...defaultState,
        transactions: savedTx ? JSON.parse(savedTx) : defaultState.transactions,
        targets: savedTargets ? JSON.parse(savedTargets) : defaultState.targets,
        isOnboardingDone: savedOnboarding === 'true',
      };
    } catch (e) {
      return defaultState;
    }
  });

  // 2. Auth Listener (Firebase)
  useEffect(() => {
    const unsubscribe = subscribeToAuth((firebaseUser) => {
        if (firebaseUser) {
            dispatch({ 
                type: 'SET_USER', 
                payload: {
                    uid: firebaseUser.uid,
                    displayName: firebaseUser.displayName,
                    email: firebaseUser.email,
                    photoURL: firebaseUser.photoURL
                } 
            });
        } else {
            dispatch({ type: 'SET_USER', payload: null });
        }
    });
    return () => unsubscribe();
  }, []);

  // 3. Cloud Data Sync Listener
  useEffect(() => {
      if (!state.user) return; // If not logged in, do nothing (stay local)

      dispatch({ type: 'SYNC_START' });

      // Subscribe to Transactions
      const unsubTx = subscribeToTransactions(state.user.uid, (cloudTxs) => {
          // Check if we need to merge initial local data to cloud? 
          // For simplicity, we assume Cloud is Truth. 
          // Advanced: We could upload local data if cloud is empty.
          dispatch({ 
              type: 'SYNC_SUCCESS', 
              payload: { transactions: cloudTxs } 
          });
      });

      // Subscribe to Targets
      const unsubTargets = subscribeToTargets(state.user.uid, (cloudTargets) => {
          if (cloudTargets) {
              dispatch({ type: 'SET_TARGETS', payload: cloudTargets });
          }
      });

      return () => {
          unsubTx();
          unsubTargets();
      };
  }, [state.user?.uid]);

  // 4. Persistence Effect (Local Storage as Backup/Cache)
  useEffect(() => {
    // We still save to local storage even if logged in, for faster initial load next time
    const handler = setTimeout(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.transactions));
        localStorage.setItem(TARGETS_KEY, JSON.stringify(state.targets));
        if (state.isOnboardingDone) localStorage.setItem(ONBOARDING_KEY, 'true');
    }, 1000);
    return () => clearTimeout(handler);
  }, [state]);

  // 5. Smart Action Handler (The Interceptor)
  const handleCloudAction = (action: Action) => {
      // First, update local state (Optimistic UI)
      dispatch(action);

      // If logged in, send to Cloud
      if (state.user) {
          switch (action.type) {
              case 'ADD_TRANSACTION':
                  addTransactionToCloud(state.user.uid, action.payload);
                  break;
              case 'DELETE_TRANSACTION':
                  updateTransactionInCloud(state.user.uid, action.payload, { deletedAt: Date.now() });
                  break;
              case 'SET_TARGETS':
                  saveUserProfile(state.user.uid, action.payload);
                  break;
              case 'COMPLETE_ONBOARDING':
                  saveUserProfile(state.user.uid, action.payload);
                  break;
          }
      }
  };

  // Derived State
  const activeTransactions = useMemo(() => {
    return state.transactions.filter(t => !t.deletedAt);
  }, [state.transactions]);

  return (
    <AppContext.Provider value={{ state, dispatch, activeTransactions, handleCloudAction }}>
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
