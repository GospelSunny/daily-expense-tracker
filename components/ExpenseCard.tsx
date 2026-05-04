import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Expense } from '../lib/types';
import { CURRENCY_SYMBOL } from '../lib/types';
import { formatDisplayDate } from '../lib/utils';
import { Ionicons } from '@expo/vector-icons';

interface ExpenseCardProps {
  expense: Expense;
  onDelete: (id: string) => void;
  isDark: boolean;
}

const ExpenseCard: React.FC<ExpenseCardProps> = ({ expense, onDelete, isDark }) => {
  const styles = getStyles(isDark);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.category}>{expense.category}</Text>
          <Text style={styles.date}>{formatDisplayDate(expense.date)}</Text>
        </View>
        <View style={styles.amountContainer}>
          <Text style={styles.amount}>{CURRENCY_SYMBOL}{expense.amount.toFixed(0)}</Text>
        </View>
      </View>
      {expense.note && <Text style={styles.note}>{expense.note}</Text>}
      <TouchableOpacity 
        style={styles.deleteButton} 
        onPress={() => onDelete(expense.id)}
      >
        <Ionicons name="trash-outline" size={18} color={isDark ? '#ff6b6b' : '#e63946'} />
      </TouchableOpacity>
    </View>
  );
};

const getStyles = (isDark: boolean) => StyleSheet.create({
  card: {
    backgroundColor: isDark ? '#1f2937' : '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.3 : 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: isDark ? 1 : 0,
    borderColor: isDark ? '#374151' : '#e5e7eb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  category: {
    fontSize: 16,
    fontWeight: '600',
    color: isDark ? '#f3f4f6' : '#111827',
  },
  date: {
    fontSize: 13,
    color: isDark ? '#9ca3af' : '#6b7280',
    marginTop: 2,
  },
  amountContainer: {
    backgroundColor: isDark ? '#374151' : '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#e63946',
  },
  note: {
    fontSize: 14,
    color: isDark ? '#d1d5db' : '#4b5563',
    marginTop: 8,
    fontStyle: 'italic',
  },
  deleteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 4,
  },
});

export default ExpenseCard;