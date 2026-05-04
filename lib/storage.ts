import AsyncStorage from '@react-native-async-storage/async-storage';
import { Expense, Budgets } from './types';

const EXPENSES_KEY = 'expenses';
const BUDGETS_KEY = 'budgets';

export const saveExpenses = async (expenses: Expense[]) => {
  try {
    await AsyncStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
  } catch (error) {
    console.error('Error saving expenses:', error);
  }
};

export const loadExpenses = async (): Promise<Expense[]> => {
  try {
    const data = await AsyncStorage.getItem(EXPENSES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading expenses:', error);
    return [];
  }
};

export const saveBudgets = async (budgets: Budgets) => {
  try {
    await AsyncStorage.setItem(BUDGETS_KEY, JSON.stringify(budgets));
  } catch (error) {
    console.error('Error saving budgets:', error);
  }
};

export const loadBudgets = async (): Promise<Budgets> => {
  try {
    const data = await AsyncStorage.getItem(BUDGETS_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return { daily: 5000, weekly: 25000 }; // Default budgets in NGN
  } catch (error) {
    console.error('Error loading budgets:', error);
    return { daily: 5000, weekly: 25000 };
  }
};

export const addExpense = async (expense: Expense) => {
  const expenses = await loadExpenses();
  expenses.unshift(expense); // Newest first
  await saveExpenses(expenses);
  return expenses;
};

export const deleteExpense = async (id: string) => {
  const expenses = await loadExpenses();
  const filtered = expenses.filter(e => e.id !== id);
  await saveExpenses(filtered);
  return filtered;
};
