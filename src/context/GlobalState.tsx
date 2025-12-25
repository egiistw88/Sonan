
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

const STORAGE_KEY = 'sonan_transactions_v2'; 
const TARGETS_KEY = 'sonan_user_targets';
const ONBOARDING_KEY = 'sonan_onboarding_done';

interface AppState {
  transactions: Transaction[];
  targets: DailyTargets;
  isOnboardingDone: boolean;
  user: UserProfile | null; 
  isSyncing: boolean; 
}

type Action =
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'DELETE_TRANSACTION'; payload: string } 
  | { type: 'SET_TARGETS'; payload: DailyTargets }
  | { type: 'COMPLETE_ONBOARDING'; payload: DailyTargets }
  | { type: 'IMPORT_DATA'; payload: { transactions: Transaction[]; targets: DailyTargets } }
  | { type: 'RESET_DATA' }
  | { type: 'SET_USER'; payload: UserProfile | null } 
  | { type: 'SYNC_START' }
  | { type: 'SYNC_SUCCESS'; payload: { transactions: Transaction[], targets?: DailyTargets } };

const initialState: AppState = {
  transactions: [],
  targets: DEFAULT_TARGETS,
  isOnboardingDone: false,
  user: null,
  isSyncing: false,
};

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
      return { ...initialState, user: state.user }; 
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
          isOnboardingDone: true 
      };
    default:
      return state;
  }
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>; 
  activeTransactions: Transaction[];
  handleCloudAction: (action: Action) => void; 
} | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
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

  useEffect(() => {
      if (!state.user) return; 

      dispatch({ type: 'SYNC_START' });

      const unsubTx = subscribeToTransactions(state.user.uid, (cloudTxs) => {
          dispatch({ 
              type: 'SYNC_SUCCESS', 
              payload: { transactions: cloudTxs } 
          });
      });

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

  useEffect(() => {
    const handler = setTimeout(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.transactions));
        localStorage.setItem(TARGETS_KEY, JSON.stringify(state.targets));
        if (state.isOnboardingDone) localStorage.setItem(ONBOARDING_KEY, 'true');
    }, 1000);
    return () => clearTimeout(handler);
  }, [state]);

  const handleCloudAction = (action: Action) => {
      dispatch(action);

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

  const activeTransactions = useMemo(() => {
    return state.transactions.filter(t => !t.deletedAt);
  }, [state.transactions]);

  return (
    <AppContext.Provider value={{ state, dispatch, activeTransactions, handleCloudAction }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppStore = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppStore must be used within an AppProvider");
  }
  return context;
};
