import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CATEGORIES, Expense, CURRENCY_SYMBOL, Category } from '../lib/types';
import { addExpense, loadExpenses } from '../lib/storage';
import { getToday } from '../lib/utils';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';

interface CategoryButtonProps {
  category: string;
  selected: boolean;
  onPress: () => void;
  isDark: boolean;
}

const CategoryButton: React.FC<CategoryButtonProps> = ({ category, selected, onPress, isDark }) => {
  const styles = getCategoryStyles(isDark);
  return (
    <TouchableOpacity 
      style={[styles.button, selected && styles.selected]} 
      onPress={onPress}
    >
      <Text style={[styles.text, selected && styles.selectedText]}>{category}</Text>
    </TouchableOpacity>
  );
};

const getCategoryStyles = (isDark: boolean) => StyleSheet.create({
  button: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: isDark ? '#374151' : '#f3f4f6',
    marginRight: 8,
    marginBottom: 8,
  },
  selected: {
    backgroundColor: '#10b981',
  },
  text: {
    color: isDark ? '#d1d5db' : '#374151',
    fontWeight: '500',
  },
  selectedText: {
    color: '#ffffff',
    fontWeight: '600',
  },
});

const AddExpenseScreen: React.FC = () => {
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>(CATEGORIES[0]);
  const [date, setDate] = useState(getToday());
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleSave = async () => {
    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount greater than 0.');
      return;
    }

    setLoading(true);
    try {
      const newExpense: Expense = {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2),
        amount: numAmount,
        category: selectedCategory,
        date: date,
        note: note.trim() || undefined,
      };

      await addExpense(newExpense);
      
      // Reset form
      setAmount('');
      setNote('');
      setSelectedCategory(CATEGORIES[0]);
      setDate(getToday());

      Alert.alert(
        'Expense Added!', 
        `₦${numAmount.toFixed(0)} added to ${selectedCategory}`, 
        [
          { 
            text: 'Add Another', 
            style: 'default' 
          },
          { 
            text: 'Go to Home', 
            onPress: () => navigation.navigate('Home' as never) 
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save expense. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const styles = getStyles(isDark);

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Add Expense</Text>
          <Text style={styles.subtitle}>Quickly log your spending in NGN</Text>
        </View>

        {/* Amount */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Amount ({CURRENCY_SYMBOL})</Text>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            returnKeyType="done"
          />
        </View>

        {/* Category */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.categoryContainer}>
            {CATEGORIES.map((cat) => (
              <CategoryButton
                key={cat}
                category={cat}
                selected={selectedCategory === cat}
                onPress={() => setSelectedCategory(cat)}
                isDark={isDark}
              />
            ))}
          </View>
        </View>

        {/* Date */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Date</Text>
          <View style={styles.dateContainer}>
            <TouchableOpacity 
              style={styles.dateButton} 
              onPress={() => setDate(getToday())}
            >
              <Text style={styles.dateButtonText}>Today</Text>
            </TouchableOpacity>
            <TextInput
              style={[styles.input, styles.dateInput]}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
              value={date}
              onChangeText={setDate}
            />
          </View>
          <Text style={styles.dateHint}>Format: YYYY-MM-DD (e.g. 2025-01-15)</Text>
        </View>

        {/* Note */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Note (Optional)</Text>
          <TextInput
            style={[styles.input, styles.noteInput]}
            placeholder="Lunch with team, groceries..."
            placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={3}
          />
        </View>

        <TouchableOpacity 
          style={[styles.saveButton, loading && styles.saveButtonDisabled]} 
          onPress={handleSave}
          disabled={loading}
        >
          <Ionicons name="save-outline" size={22} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.saveButtonText}>
            {loading ? 'Saving...' : 'Save Expense'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const getStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? '#111827' : '#f8fafc',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 28,
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
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: isDark ? '#d1d5db' : '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: isDark ? '#1f2937' : '#ffffff',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    color: isDark ? '#f3f4f6' : '#111827',
    borderWidth: isDark ? 1 : 0,
    borderColor: isDark ? '#374151' : '#e5e7eb',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dateButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 12,
  },
  dateButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  dateInput: {
    flex: 1,
    fontSize: 16,
  },
  dateHint: {
    fontSize: 12,
    color: isDark ? '#6b7280' : '#9ca3af',
    marginTop: 6,
  },
  noteInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  saveButton: {
    backgroundColor: '#10b981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 16,
    marginTop: 20,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonDisabled: {
    backgroundColor: '#6b7280',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default AddExpenseScreen;