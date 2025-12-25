
export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

export type TransactionCategory = 'RIDE' | 'FOOD' | 'DELIVERY' | 'SHOP' | 'OTHER';

export type PaymentMethod = 'CASH' | 'WALLET';

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  category?: TransactionCategory;
  description: string;
  timestamp: number;
  isOrder: boolean; 
  paymentMethod: PaymentMethod; // New field for accuracy
  coords?: {
    lat: number;
    lng: number;
  };
  deletedAt?: number | null;
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
  dailyInstallment: number;
}

export const DEFAULT_TARGETS: DailyTargets = {
  orders: 20,
  revenue: 250000,
  dailyInstallment: 0
};

export interface GacorSpot {
  name: string;
  type: string;
  reason: string;
  distance: string;
  distanceValue: number;
  coords?: { lat: number; lng: number };
  priority: 'TINGGI' | 'SEDANG' | 'RENDAH';
  source: 'HISTORY' | 'AI';
}

export interface StrategyTip {
  title: string;
  content: string;
  category: 'TEKNIS' | 'MARKETING' | 'MENTAL';
  difficulty: 'PEMULA' | 'SENIOR';
}

export interface VehicleHealth {
  oilLife: number;
  tireCondition: number;
  nextServiceIn: number;
}

export type PerformanceGrade = 'S' | 'A' | 'B' | 'C' | 'D';

export interface UserProfile {
    uid: string;
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
}
