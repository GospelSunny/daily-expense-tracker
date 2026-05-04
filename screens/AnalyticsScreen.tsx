import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { useFocusEffect } from '@react-navigation/native';
import { Expense, CURRENCY_SYMBOL } from '../lib/types';
import { loadExpenses } from '../lib/storage';
import { getCategoryBreakdown, getDailyTrends, getHighestCategory } from '../lib/utils';
import { useColorScheme } from 'react-native';

const { width } = Dimensions.get('window');

const AnalyticsScreen: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const loadData = async () => {
    const loaded = await loadExpenses();
    setExpenses(loaded);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const breakdown = getCategoryBreakdown(expenses);
  const highest = getHighestCategory(expenses);
  const trends = getDailyTrends(expenses, 7);

  const barData = {
    labels: breakdown.length > 0 ? breakdown.map(b => b.name.substring(0, 5)) : ['No Data'],
    datasets: [{
      data: breakdown.length > 0 ? breakdown.map(b => b.amount) : [0],
    }]
  };

  const lineData = {
    labels: trends.map(t => t.date),
    datasets: [{
      data: trends.length > 0 ? trends.map(t => t.amount) : [0],
      color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
      strokeWidth: 3,
    }]
  };

  const styles = getStyles(isDark);

  const chartConfig = {
    backgroundColor: isDark ? '#1f2937' : '#ffffff',
    backgroundGradientFrom: isDark ? '#1f2937' : '#ffffff',
    backgroundGradientTo: isDark ? '#1f2937' : '#ffffff',
    color: (opacity = 1) => isDark ? `rgba(243, 244, 246, ${opacity})` : `rgba(17, 24, 39, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.6,
    useShadowColorFromDataset: false,
    propsForDots: {
      r: '5',
      strokeWidth: '2',
      stroke: '#10b981',
    },
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Analytics</Text>
        <Text style={styles.subtitle}>Insights into your spending habits</Text>
      </View>

      {/* Highest Spending */}
      <View style={styles.insightCard}>
        <Text style={styles.insightLabel}>HIGHEST SPENDING CATEGORY</Text>
        {highest ? (
          <>
            <Text style={styles.insightValue}>{highest.name}</Text>
            <Text style={styles.insightAmount}>{CURRENCY_SYMBOL}{highest.amount.toFixed(0)}</Text>
          </>
        ) : (
          <Text style={styles.noData}>Add expenses to see insights</Text>
        )}
      </View>

      {/* Category Bar Chart */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Category Breakdown</Text>
        {breakdown.length > 0 ? (
          <BarChart
            data={barData}
            width={width - 40}
            height={240}
            chartConfig={chartConfig}
            verticalLabelRotation={0}
            fromZero
            showValuesOnTopOfBars
            yAxisLabel=""
            yAxisSuffix=""
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No data available yet</Text>
          </View>
        )}
      </View>

      {/* Spending Trends Line Chart */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Spending Trends (Last 7 Days)</Text>
        {trends.length > 0 && trends.some(t => t.amount > 0) ? (
          <LineChart
            data={lineData}
            width={width - 40}
            height={240}
            chartConfig={chartConfig}
            bezier
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Not enough data for trends</Text>
          </View>
        )}
      </View>

      <View style={styles.tipCard}>
        <Text style={styles.tipTitle}>💡 Tip</Text>
        <Text style={styles.tipText}>
          Tracking daily helps you identify patterns. Try setting realistic budgets to stay on track!
        </Text>
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
  insightCard: {
    backgroundColor: isDark ? '#1f2937' : '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: isDark ? 1 : 0,
    borderColor: isDark ? '#374151' : '#e5e7eb',
    alignItems: 'center',
  },
  insightLabel: {
    fontSize: 12,
    color: isDark ? '#9ca3af' : '#6b7280',
    letterSpacing: 1,
  },
  insightValue: {
    fontSize: 26,
    fontWeight: '700',
    color: '#10b981',
    marginTop: 8,
  },
  insightAmount: {
    fontSize: 20,
    color: isDark ? '#d1d5db' : '#374151',
    marginTop: 4,
  },
  noData: {
    fontSize: 16,
    color: isDark ? '#9ca3af' : '#6b7280',
    marginTop: 12,
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
  emptyState: {
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: isDark ? '#1f2937' : '#ffffff',
    borderRadius: 16,
    borderWidth: isDark ? 1 : 0,
    borderColor: isDark ? '#374151' : '#e5e7eb',
  },
  emptyText: {
    color: isDark ? '#9ca3af' : '#6b7280',
  },
  tipCard: {
    backgroundColor: '#ecfdf5',
    borderRadius: 16,
    padding: 18,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#065f46',
    marginBottom: 6,
  },
  tipText: {
    fontSize: 14,
    color: '#065f46',
    lineHeight: 20,
  },
});

export default AnalyticsScreen;