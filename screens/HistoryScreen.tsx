import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Modal, ScrollView, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Expense, CATEGORIES, CURRENCY_SYMBOL } from '../lib/types';
import { loadExpenses, deleteExpense } from '../lib/storage';
import { filterExpenses } from '../lib/utils';
import ExpenseCard from '../components/ExpenseCard';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';

const HistoryScreen: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
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

  // Apply filters
  useEffect(() => {
    const filtered = filterExpenses(expenses, search, categoryFilter, dateFrom, dateTo);
    setFilteredExpenses(filtered);
  }, [expenses, search, categoryFilter, dateFrom, dateTo]);

  const handleDelete = async (id: string) => {
    Alert.alert(
      'Delete Expense',
      'Are you sure you want to delete this transaction?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updated = await deleteExpense(id);
            setExpenses(updated);
          }
        }
      ]
    );
  };

  const clearFilters = () => {
    setSearch('');
    setCategoryFilter('');
    setDateFrom('');
    setDateTo('');
    setShowFilters(false);
  };

  const applyDateRange = (from: string, to: string) => {
    setDateFrom(from);
    setDateTo(to);
    setShowFilters(false);
  };

  const renderItem = ({ item }: { item: Expense }) => (
    <ExpenseCard expense={item} onDelete={handleDelete} isDark={isDark} />
  );

  const styles = getStyles(isDark);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Expense History</Text>
        <TouchableOpacity onPress={() => setShowFilters(true)} style={styles.filterButton}>
          <Ionicons name="filter" size={20} color={isDark ? '#f3f4f6' : '#111827'} />
          <Text style={styles.filterText}>Filter</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color={isDark ? '#9ca3af' : '#6b7280'} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by note or category..."
          placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
          value={search}
          onChangeText={setSearch}
        />
        {(search || categoryFilter || dateFrom || dateTo) && (
          <TouchableOpacity onPress={clearFilters} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color="#ef4444" />
          </TouchableOpacity>
        )}
      </View>

      {/* Active Filters */}
      {(categoryFilter || dateFrom || dateTo) && (
        <View style={styles.activeFilters}>
          {categoryFilter && (
            <View style={styles.filterChip}>
              <Text style={styles.chipText}>{categoryFilter}</Text>
              <TouchableOpacity onPress={() => setCategoryFilter('')}>
                <Ionicons name="close" size={14} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
          {(dateFrom || dateTo) && (
            <View style={styles.filterChip}>
              <Text style={styles.chipText}>
                {dateFrom || 'Any'} - {dateTo || 'Any'}
              </Text>
              <TouchableOpacity onPress={() => { setDateFrom(''); setDateTo(''); }}>
                <Ionicons name="close" size={14} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      <FlatList
        data={filteredExpenses}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={48} color={isDark ? '#374151' : '#d1d5db'} />
            <Text style={styles.emptyTitle}>No expenses found</Text>
            <Text style={styles.emptySubtitle}>
              {search || categoryFilter || dateFrom || dateTo 
                ? 'Try adjusting your filters'
                : 'Start adding expenses to see them here'}
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Filter Modal with Date Range */}
      <Modal visible={showFilters} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Expenses</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Ionicons name="close" size={24} color={isDark ? '#f3f4f6' : '#111827'} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 400 }}>
              {/* Category Filter */}
              <Text style={styles.modalLabel}>Category</Text>
              <TouchableOpacity 
                style={styles.modalSelect} 
                onPress={() => setShowCategoryModal(true)}
              >
                <Text style={styles.selectText}>{categoryFilter || 'All Categories'}</Text>
                <Ionicons name="chevron-down" size={20} color="#9ca3af" />
              </TouchableOpacity>

              {/* Date Range Filter - KEY FEATURE */}
              <Text style={styles.modalLabel}>Date Range (YYYY-MM-DD)</Text>
              <View style={styles.dateRangeContainer}>
                <View style={styles.dateInputWrapper}>
                  <Text style={styles.dateLabel}>From</Text>
                  <TextInput
                    style={styles.dateInput}
                    placeholder="2025-01-01"
                    placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
                    value={dateFrom}
                    onChangeText={setDateFrom}
                  />
                </View>
                <View style={styles.dateInputWrapper}>
                  <Text style={styles.dateLabel}>To</Text>
                  <TextInput
                    style={styles.dateInput}
                    placeholder="2025-01-31"
                    placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
                    value={dateTo}
                    onChangeText={setDateTo}
                  />
                </View>
              </View>
              <TouchableOpacity 
                style={styles.quickDateButton} 
                onPress={() => {
                  const today = new Date().toISOString().split('T')[0];
                  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                  applyDateRange(weekAgo, today);
                }}
              >
                <Text style={styles.quickDateText}>Last 7 Days</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.quickDateButton} 
                onPress={() => {
                  const today = new Date().toISOString().split('T')[0];
                  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                  applyDateRange(monthAgo, today);
                }}
              >
                <Text style={styles.quickDateText}>Last 30 Days</Text>
              </TouchableOpacity>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.clearBtn} onPress={clearFilters}>
                <Text style={styles.clearBtnText}>Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyBtn} onPress={() => setShowFilters(false)}>
                <Text style={styles.applyBtnText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Category Selection Modal */}
      <Modal visible={showCategoryModal} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowCategoryModal(false)}>
          <View style={styles.categoryModal}>
            <Text style={styles.modalTitle}>Select Category</Text>
            {['', ...CATEGORIES].map((cat, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.categoryOption} 
                onPress={() => {
                  setCategoryFilter(cat);
                  setShowCategoryModal(false);
                }}
              >
                <Text style={styles.categoryOptionText}>{cat || 'All Categories'}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const getStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? '#111827' : '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: isDark ? '#f3f4f6' : '#111827',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? '#1f2937' : '#ffffff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: isDark ? 1 : 0,
    borderColor: isDark ? '#374151' : '#e5e7eb',
  },
  filterText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
    color: isDark ? '#f3f4f6' : '#111827',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? '#1f2937' : '#ffffff',
    marginHorizontal: 20,
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: isDark ? 1 : 0,
    borderColor: isDark ? '#374151' : '#e5e7eb',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: isDark ? '#f3f4f6' : '#111827',
  },
  clearButton: {
    padding: 6,
  },
  activeFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    paddingVertical: 8,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  chipText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: isDark ? '#f3f4f6' : '#111827',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: isDark ? '#9ca3af' : '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: isDark ? '#1f2937' : '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: isDark ? '#f3f4f6' : '#111827',
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: isDark ? '#d1d5db' : '#374151',
    marginBottom: 8,
    marginTop: 16,
  },
  modalSelect: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: isDark ? '#374151' : '#f3f4f6',
    padding: 14,
    borderRadius: 12,
  },
  selectText: {
    fontSize: 16,
    color: isDark ? '#f3f4f6' : '#111827',
  },
  dateRangeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  dateInputWrapper: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    color: isDark ? '#9ca3af' : '#6b7280',
    marginBottom: 4,
  },
  dateInput: {
    backgroundColor: isDark ? '#374151' : '#f3f4f6',
    padding: 14,
    borderRadius: 12,
    fontSize: 15,
    color: isDark ? '#f3f4f6' : '#111827',
    borderWidth: isDark ? 1 : 0,
    borderColor: isDark ? '#4b5563' : '#d1d5db',
  },
  quickDateButton: {
    backgroundColor: isDark ? '#374151' : '#f3f4f6',
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
    alignItems: 'center',
  },
  quickDateText: {
    color: '#10b981',
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  clearBtn: {
    flex: 1,
    padding: 16,
    backgroundColor: isDark ? '#374151' : '#f3f4f6',
    borderRadius: 12,
    alignItems: 'center',
  },
  clearBtnText: {
    color: isDark ? '#f3f4f6' : '#374151',
    fontWeight: '600',
  },
  applyBtn: {
    flex: 1,
    padding: 16,
    backgroundColor: '#10b981',
    borderRadius: 12,
    alignItems: 'center',
  },
  applyBtnText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  categoryModal: {
    backgroundColor: isDark ? '#1f2937' : '#ffffff',
    margin: 40,
    borderRadius: 16,
    padding: 20,
  },
  categoryOption: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? '#374151' : '#e5e7eb',
  },
  categoryOptionText: {
    fontSize: 16,
    color: isDark ? '#f3f4f6' : '#111827',
  },
});

export default HistoryScreen;