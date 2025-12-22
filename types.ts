
export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

export type TransactionCategory = 'RIDE' | 'FOOD' | 'DELIVERY' | 'SHOP' | 'OTHER';

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  category?: TransactionCategory; // New field
  description: string;
  timestamp: number;
  isOrder: boolean; // True if it counts towards the 25 order target
  coords?: {
    lat: number;
    lng: number;
  };
}

export interface WeatherData {
  temp: string;
  condition: string;
  locationName: string;
  advice: string;
  loading: boolean;
}

export interface DailyTargets {
  orders: number;
  revenue: number;
  dailyInstallment: number; // New: Beban tetap harian (Cicilan Motor/HP)
}

export const DEFAULT_TARGETS: DailyTargets = {
  orders: 25,
  revenue: 250000,
  dailyInstallment: 0
};

export interface GacorSpot {
  name: string;
  type: string;
  reason: string;
  distance: string; // Estimasi jarak string
  coords?: { lat: number; lng: number }; // Koordinat presisi
  priority: 'TINGGI' | 'SEDANG';
  source: 'HISTORY' | 'AI'; // Pembeda sumber data
}

export interface StrategyTip {
  title: string;
  content: string;
  category: 'TEKNIS' | 'MARKETING' | 'MENTAL';
  difficulty: 'PEMULA' | 'SENIOR';
}
