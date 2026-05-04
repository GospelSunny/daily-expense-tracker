export interface Expense {
  id: string;
  amount: number;
  category: string;
  date: string; // YYYY-MM-DD
  note?: string;
}

export interface Budgets {
  daily: number;
  weekly: number;
}

export const CATEGORIES = ['Food', 'Transport', 'Bills', 'Shopping', 'Others'] as const;
export type Category = typeof CATEGORIES[number];

export const CURRENCY = 'NGN';
export const CURRENCY_SYMBOL = '₦';
