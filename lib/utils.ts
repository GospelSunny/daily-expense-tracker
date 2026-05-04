import { Expense, CATEGORIES } from './types';
import { format, startOfDay, endOfDay, subDays, parseISO, isWithinInterval, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

export const formatDate = (date: string | Date): string => {
  return format(typeof date === 'string' ? parseISO(date) : date, 'yyyy-MM-dd');
};

export const formatDisplayDate = (date: string): string => {
  return format(parseISO(date), 'MMM dd, yyyy');
};

export const getToday = (): string => formatDate(new Date());

export const getWeekStart = (): string => formatDate(startOfWeek(new Date(), { weekStartsOn: 1 }));

export const getMonthStart = (): string => formatDate(startOfMonth(new Date()));

export const calculateTotals = (expenses: Expense[]) => {
  const today = getToday();
  const weekStart = getWeekStart();
  const monthStart = getMonthStart();

  const todayTotal = expenses
    .filter(e => e.date === today)
    .reduce((sum, e) => sum + e.amount, 0);

  const weekTotal = expenses
    .filter(e => e.date >= weekStart)
    .reduce((sum, e) => sum + e.amount, 0);

  const monthTotal = expenses
    .filter(e => e.date >= monthStart)
    .reduce((sum, e) => sum + e.amount, 0);

  return { todayTotal, weekTotal, monthTotal };
};

export const getCategoryBreakdown = (expenses: Expense[]) => {
  const breakdown: { [key: string]: number } = {};
  CATEGORIES.forEach(cat => breakdown[cat] = 0);

  expenses.forEach(exp => {
    if (breakdown[exp.category] !== undefined) {
      breakdown[exp.category] += exp.amount;
    }
  });

  return Object.entries(breakdown)
    .map(([name, amount]) => ({ name, amount, percentage: 0 }))
    .filter(item => item.amount > 0)
    .sort((a, b) => b.amount - a.amount);
};

export const getHighestCategory = (expenses: Expense[]) => {
  const breakdown = getCategoryBreakdown(expenses);
  return breakdown.length > 0 ? breakdown[0] : null;
};

export const getDailyTrends = (expenses: Expense[], days: number = 7) => {
  const trends: { date: string; amount: number }[] = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = formatDate(subDays(today, i));
    const dayExpenses = expenses.filter(e => e.date === date);
    const amount = dayExpenses.reduce((sum, e) => sum + e.amount, 0);
    trends.push({
      date: format(parseISO(date), 'MMM dd'),
      amount,
    });
  }
  return trends;
};

export const filterExpenses = (
  expenses: Expense[],
  search: string,
  categoryFilter: string,
  dateFrom: string,
  dateTo: string
) => {
  return expenses.filter(exp => {
    const matchesSearch = !search || 
      exp.note?.toLowerCase().includes(search.toLowerCase()) ||
      exp.category.toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory = !categoryFilter || exp.category === categoryFilter;
    
    let matchesDate = true;
    if (dateFrom && dateTo) {
      matchesDate = exp.date >= dateFrom && exp.date <= dateTo;
    } else if (dateFrom) {
      matchesDate = exp.date >= dateFrom;
    } else if (dateTo) {
      matchesDate = exp.date <= dateTo;
    }
    
    return matchesSearch && matchesCategory && matchesDate;
  }).sort((a, b) => b.date.localeCompare(a.date));
};

export const checkBudgetWarning = (total: number, budget: number): { isWarning: boolean; message: string } => {
  if (budget <= 0) return { isWarning: false, message: '' };
  const percent = (total / budget) * 100;
  if (percent >= 100) {
    return { isWarning: true, message: `You've exceeded your budget by ₦${(total - budget).toFixed(0)}` };
  } else if (percent >= 80) {
    return { isWarning: true, message: `You're close to your budget (${percent.toFixed(0)}%)` };
  }
  return { isWarning: false, message: '' };
};
