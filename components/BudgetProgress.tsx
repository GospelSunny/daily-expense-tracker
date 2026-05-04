import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CURRENCY_SYMBOL } from '../lib/types';

interface BudgetProgressProps {
  label: string;
  spent: number;
  budget: number;
  isDark: boolean;
}

const BudgetProgress: React.FC<BudgetProgressProps> = ({ label, spent, budget, isDark }) => {
  const percent = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  const isOver = spent > budget && budget > 0;
  
  const styles = getStyles(isDark);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.amounts}>
          {CURRENCY_SYMBOL}{spent.toFixed(0)} / {CURRENCY_SYMBOL}{budget.toFixed(0)}
        </Text>
      </View>
      <View style={styles.progressBarContainer}>
        <View 
          style={[
            styles.progressBar, 
            { 
              width: `${percent}%`, 
              backgroundColor: isOver ? '#e63946' : '#10b981' 
            }
          ]} 
        />
      </View>
      <Text style={[styles.percent, isOver && styles.over]}>
        {percent.toFixed(0)}% of budget used
      </Text>
    </View>
  );
};

const getStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    backgroundColor: isDark ? '#1f2937' : '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: isDark ? 1 : 0,
    borderColor: isDark ? '#374151' : '#e5e7eb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: isDark ? '#f3f4f6' : '#111827',
  },
  amounts: {
    fontSize: 14,
    color: isDark ? '#9ca3af' : '#6b7280',
    fontWeight: '500',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: isDark ? '#374151' : '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  percent: {
    fontSize: 12,
    color: '#10b981',
    marginTop: 6,
    textAlign: 'right',
  },
  over: {
    color: '#e63946',
  },
});

export default BudgetProgress;