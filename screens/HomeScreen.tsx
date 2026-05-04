import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { useFocusEffect } from '@react-navigation/native';
import { Expense, CURRENCY_SYMBOL } from '../lib/types';
import { loadExpenses, loadBudgets } from '../lib/storage';
import { calculateTotals, getCategoryBreakdown, checkBudgetWarning } from '../lib/utils';
import BudgetProgress from '../components/BudgetProgress';
import { useColorScheme } from 'react-native';

const { width } = Dimensions.get('window');

const HomeScreen: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState({ daily: 5000, weekly: 25000 });
  const [refreshing, setRefreshing] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const loadData = async () => {
    const loadedExpenses = await loadExpenses();
    const loadedBudgets = await loadBudgets();
    setExpenses(loadedExpenses);
    setBudgets(loadedBudgets);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const { todayTotal, weekTotal, monthTotal } = calculateTotals(expenses);
  const breakdown = getCategoryBreakdown(expenses);
  
  const dailyWarning = checkBudgetWarning(todayTotal, budgets.daily);
  const weeklyWarning = checkBudgetWarning(weekTotal, budgets.weekly);

  const pieData = breakdown.map((item, index) => ({
    name: item.name,
    population: item.amount,
    color: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'][index % 5],
    legendFontColor: isDark ? '#d1d5db' : '#374151',
    legendFontSize: 12,
  }));

  const styles = getStyles(isDark);

  const chartConfig = {
    backgroundColor: isDark ? '#1f2937' : '#ffffff',
    backgroundGradientFrom: isDark ? '#1f2937' : '#ffffff',
    backgroundGradientTo: isDark ? '#1f2937' : '#ffffff',
    color: (opacity = 1) => isDark ? `rgba(243, 244, 246, ${opacity})` : `rgba(17, 24, 39, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>Your spending overview</Text>
      </View>

      {/* Totals Cards */}
      <View style={styles.totalsGrid}>
        <View style={[styles.totalCard, styles.todayCard]}>
          <Text style={styles.totalLabel}>Today</Text>
          <Text style={styles.totalAmount}>{CURRENCY_SYMBOL}{todayTotal.toFixed(0)}</Text>
        </View>
        <View style={[styles.totalCard, styles.weekCard]}>
          <Text style={styles.totalLabel}>This Week</Text>
          <Text style={styles.totalAmount}>{CURRENCY_SYMBOL}{weekTotal.toFixed(0)}</Text>
        </View>
        <View style={[styles.totalCard, styles.monthCard]}>
          <Text style={styles.totalLabel}>This Month</Text>
          <Text style={styles.totalAmount}>{CURRENCY_SYMBOL}{monthTotal.toFixed(0)}</Text>
        </View>
      </View>

      {/* Budget Warnings */}
      {(dailyWarning.isWarning || weeklyWarning.isWarning) && (
        <View style={styles.warningBox}>
          <Text style={styles.warningTitle}>⚠️ Budget Alert</Text>
          {dailyWarning.isWarning && <Text style={styles.warningText}>{dailyWarning.message}</Text>}
          {weeklyWarning.isWarning && <Text style={styles.warningText}>{weeklyWarning.message}</Text>}
        </View>
      )}

      {/* Budget Progress */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Budget Tracking</Text>
        <BudgetProgress label="Daily Budget" spent={todayTotal} budget={budgets.daily} isDark={isDark} />
        <BudgetProgress label="Weekly Budget" spent={weekTotal} budget={budgets.weekly} isDark={isDark} />
      </View>

      {/* Category Breakdown Chart */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Spending by Category</Text>
        {pieData.length > 0 ? (
          <PieChart
            data={pieData}
            width={width - 40}
            height={220}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            center={[10, 0]}
            absolute
          />
        ) : (
          <View style={styles.emptyChart}>
            <Text style={styles.emptyText}>No expenses yet. Add some to see breakdown!</Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Pull to refresh • Data updates automatically</Text>
      </View>
    </ScrollView>
  );
};

const getStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? '#111827' : '#f8fafc',
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: isDark ? '#f3f4f6' : '#111827',
  },
  subtitle: {
    fontSize: 16,
    color: isDark ? '#9ca3af' : '#6b7280',
    marginTop: 4,
  },
  totalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  totalCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: isDark ? '#1f2937' : '#ffffff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.3 : 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: isDark ? 1 : 0,
    borderColor: isDark ? '#374151' : '#e5e7eb',
  },
  todayCard: { borderLeftWidth: 4, borderLeftColor: '#10b981' },
  weekCard: { borderLeftWidth: 4, borderLeftColor: '#3b82f6' },
  monthCard: { borderLeftWidth: 4, borderLeftColor: '#8b5cf6' },
  totalLabel: {
    fontSize: 13,
    color: isDark ? '#9ca3af' : '#6b7280',
    marginBottom: 6,
  },
  totalAmount: {
    fontSize: 22,
    fontWeight: '700',
    color: isDark ? '#f3f4f6' : '#111827',
  },
  warningBox: {
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  warningTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 6,
  },
  warningText: {
    fontSize: 14,
    color: '#92400e',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: isDark ? '#f3f4f6' : '#111827',
    marginBottom: 12,
  },
  emptyChart: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: isDark ? '#1f2937' : '#ffffff',
    borderRadius: 16,
    borderWidth: isDark ? 1 : 0,
    borderColor: isDark ? '#374151' : '#e5e7eb',
  },
  emptyText: {
    fontSize: 14,
    color: isDark ? '#9ca3af' : '#6b7280',
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 12,
    color: isDark ? '#6b7280' : '#9ca3af',
  },
});

export default HomeScreen;