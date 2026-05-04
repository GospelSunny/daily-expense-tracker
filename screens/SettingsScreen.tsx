import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { loadBudgets, saveBudgets, loadExpenses } from '../lib/storage';
import { CURRENCY_SYMBOL } from '../lib/types';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useColorScheme } from 'react-native';

const SettingsScreen: React.FC = () => {
  const [dailyBudget, setDailyBudget] = useState('5000');
  const [weeklyBudget, setWeeklyBudget] = useState('25000');
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const loadSettings = async () => {
    const budgets = await loadBudgets();
    setDailyBudget(budgets.daily.toString());
    setWeeklyBudget(budgets.weekly.toString());
  };

  useFocusEffect(
    useCallback(() => {
      loadSettings();
    }, [])
  );

  const handleSaveBudgets = async () => {
    const daily = parseFloat(dailyBudget);
    const weekly = parseFloat(weeklyBudget);

    if (isNaN(daily) || daily < 0 || isNaN(weekly) || weekly < 0) {
      Alert.alert('Invalid Input', 'Please enter valid positive numbers for budgets.');
      return;
    }

    setSaving(true);
    try {
      await saveBudgets({ daily, weekly });
      Alert.alert('Success', 'Budgets updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save budgets.');
    } finally {
      setSaving(false);
    }
  };

  const exportToCSV = async () => {
    setExporting(true);
    try {
      const expenses = await loadExpenses();
      if (expenses.length === 0) {
        Alert.alert('No Data', 'There are no expenses to export.');
        return;
      }

      // Create CSV content
      let csvContent = 'Date,Category,Amount (NGN),Note\n';
      expenses.forEach(exp => {
        const note = exp.note ? `"${exp.note.replace(/"/g, '""')}"` : '';
        csvContent += `${exp.date},${exp.category},${exp.amount},${note}\n`;
      });

      const fileName = `expense_export_${new Date().toISOString().split('T')[0]}.csv`;
      const fileUri = FileSystem.documentDirectory + fileName;

      await FileSystem.writeAsStringAsync(fileUri, csvContent, {
        encoding: 'utf8' as any,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: 'Export Expenses',
        });
      } else {
        Alert.alert('Success', `CSV saved to ${fileUri}`);
      }
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Export Failed', 'Could not export your data. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const styles = getStyles(isDark);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Manage your preferences</Text>
      </View>

      {/* Currency Info */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Currency</Text>
        <View style={styles.currencyRow}>
          <Ionicons name="cash-outline" size={24} color="#10b981" />
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.currencyText}>Nigerian Naira (NGN)</Text>
            <Text style={styles.currencySub}>Symbol: ₦ • All amounts in Naira</Text>
          </View>
        </View>
      </View>

      {/* Budget Settings */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Budget Limits</Text>
        <Text style={styles.cardSubtitle}>Set your spending limits in NGN</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Daily Budget ({CURRENCY_SYMBOL})</Text>
          <TextInput
            style={styles.input}
            value={dailyBudget}
            onChangeText={setDailyBudget}
            keyboardType="numeric"
            placeholder="5000"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Weekly Budget ({CURRENCY_SYMBOL})</Text>
          <TextInput
            style={styles.input}
            value={weeklyBudget}
            onChangeText={setWeeklyBudget}
            keyboardType="numeric"
            placeholder="25000"
          />
        </View>

        <TouchableOpacity 
          style={[styles.saveButton, saving && styles.disabled]} 
          onPress={handleSaveBudgets}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? 'Saving...' : 'Save Budgets'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Export */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Data Export</Text>
        <Text style={styles.cardSubtitle}>Download your transactions as CSV</Text>
        <TouchableOpacity 
          style={[styles.exportButton, exporting && styles.disabled]} 
          onPress={exportToCSV}
          disabled={exporting}
        >
          <Ionicons name="download-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.exportText}>
            {exporting ? 'Exporting...' : 'Export to CSV'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Info */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>About Daily Expense Tracker</Text>
        <Text style={styles.infoText}>
          Track your daily spending in NGN. All data is stored securely on your device using local storage. Your finances stay private.
        </Text>
        <Text style={styles.version}>v1.0.0 • Built with React Native + Expo</Text>
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
  card: {
    backgroundColor: isDark ? '#1f2937' : '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: isDark ? 1 : 0,
    borderColor: isDark ? '#374151' : '#e5e7eb',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: isDark ? '#f3f4f6' : '#111827',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: isDark ? '#9ca3af' : '#6b7280',
    marginBottom: 16,
  },
  currencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#10b981',
  },
  currencySub: {
    fontSize: 13,
    color: isDark ? '#9ca3af' : '#6b7280',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: isDark ? '#d1d5db' : '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: isDark ? '#374151' : '#f3f4f6',
    borderRadius: 12,
    padding: 14,
    fontSize: 18,
    color: isDark ? '#f3f4f6' : '#111827',
    borderWidth: isDark ? 1 : 0,
    borderColor: isDark ? '#4b5563' : '#d1d5db',
  },
  saveButton: {
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  disabled: {
    backgroundColor: '#6b7280',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  exportButton: {
    backgroundColor: '#3b82f6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  exportText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: isDark ? '#1f2937' : '#f1f5f9',
    borderRadius: 16,
    padding: 20,
    marginTop: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: isDark ? '#f3f4f6' : '#111827',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: isDark ? '#d1d5db' : '#475569',
    lineHeight: 20,
  },
  version: {
    fontSize: 12,
    color: isDark ? '#6b7280' : '#9ca3af',
    marginTop: 12,
    textAlign: 'center',
  },
});

export default SettingsScreen;