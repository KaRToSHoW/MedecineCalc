import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, Pressable } from 'react-native';
import { auth, db } from '../firebase/initFirebase';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../components/ThemeContext';
import Toast from 'react-native-toast-message';

function formatDate(ts: any) {
  try {
    const d = typeof ts === 'number' ? new Date(ts) : ts && ts.toDate ? ts.toDate() : new Date();
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Только что';
    if (diffMins < 60) return `${diffMins} мин назад`;
    if (diffHours < 24) return `${diffHours} ч назад`;
    if (diffDays < 7) return `${diffDays} дн назад`;
    
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch (e) { return '' }
}

interface HistoryItem {
  id: string;
  patientName?: string;
  result?: number;
  weightRaw?: number;
  weightKg?: number;
  weightUnit?: string;
  age?: number;
  creatinineRaw?: number;
  creatinineMgDl?: number;
  creatinineUnit?: string;
  createdAt?: any;
  female?: boolean;
}

export default function HistoryScreen() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { theme } = useTheme();

  useEffect(() => {
    let unsub: (() => void) | null = null;
    const user = auth.currentUser;
    if (!user) {
      setItems([]);
      return;
    }
    const q = query(collection(db, 'users', user.uid, 'history'), orderBy('createdAt', 'desc'));
    unsub = onSnapshot(q, snap => {
      const arr = snap.docs.map(d => ({ id: d.id, ...d.data() } as HistoryItem));
      setItems(arr);
    }, () => { });
    return () => unsub && unsub();
  }, []);

  const deleteItem = async (id: string) => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'history', id));
      Toast.show({ type: 'success', text1: 'Запись удалена' });
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Ошибка', text2: e.message });
    }
  };

  const filtered = searchQuery.trim() === '' 
    ? items 
    : items.filter(it => (it.patientName || '').toLowerCase().includes(searchQuery.trim().toLowerCase()));

  const getResultColor = (result?: number) => {
    if (!result) return theme.mutted;
    if (result < 60) return theme.danger;
    if (result < 90) return theme.warning;
    return theme.success;
  };

  const classifyClCr = (val?: number) => {
    // return a label, color and subtle background (translucent) based on theme
    const alpha = '22'; // light transparency suffix for hex
    if (val == null) return { label: '—', color: theme.mutted, bg: theme.border };
    if (val >= 90) return { label: 'Норма', color: theme.success, bg: (theme.success + alpha) };
    if (val >= 60) return { label: 'Лёгкое снижение', color: theme.warning, bg: (theme.warning + alpha) };
    if (val >= 30) return { label: 'Умеренное снижение', color: theme.warning, bg: (theme.warning + alpha) };
    if (val >= 15) return { label: 'Выраженное снижение', color: theme.danger, bg: (theme.danger + alpha) };
    return { label: 'Терминальная почечная недостаточность', color: '#7F1D1D', bg: (theme.danger + alpha) };
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }] }>
      {/* Заголовок */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: theme.text }]}>История</Text>
          <Text style={[styles.subtitle, { color: theme.mutted }]}>Всего записей: {items.length}</Text>
        </View>
        <View style={[styles.statsCircle, { backgroundColor: theme.primary }] }>
          <Text style={styles.statsNumber}>{items.length}</Text>
        </View>
      </View>

      {/* Поиск */}
      <View style={[styles.searchWrapper, { backgroundColor: theme.card }] }>
        <Ionicons name="search" size={20} color={theme.mutted} style={styles.searchIcon} />
        <TextInput 
          style={[styles.searchInput, { color: theme.text }]} 
          placeholder="Поиск по имени пациента" 
          value={searchQuery} 
          onChangeText={setSearchQuery}
          placeholderTextColor={theme.mutted}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery('')} style={styles.clearBtn} accessibilityRole="button">
            <Ionicons name="close-circle" size={20} color={theme.mutted} />
          </Pressable>
        )}
      </View>

      {/* Список или пустое состояние */}
      {items.length === 0 ? (
          <View style={styles.empty}>
          <View style={[styles.emptyIconCircle, { backgroundColor: theme.border }] }>
            <Ionicons name="document-text-outline" size={48} color={theme.mutted} />
          </View>
          <Text style={[styles.emptyTitle, { color: theme.mutted }]}>История пуста</Text>
          <Text style={[styles.emptyText, { color: theme.mutted }]}>Ваши расчёты будут отображаться здесь</Text>
        </View>
      ) : filtered.length === 0 ? (
          <View style={styles.empty}>
          <View style={[styles.emptyIconCircle, { backgroundColor: theme.border }] }>
            <Ionicons name="search" size={48} color={theme.mutted} />
          </View>
          <Text style={[styles.emptyTitle, { color: theme.mutted }]}>Ничего не найдено</Text>
          <Text style={[styles.emptyText, { color: theme.mutted }]}>Попробуйте изменить запрос</Text>
        </View>
      ) : (
        <FlatList 
          data={filtered} 
          keyExtractor={i => i.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const resultColor = getResultColor(item.result);
            return (
              <View style={[styles.card, { backgroundColor: theme.card }]}>
                {/* Заголовок карточки */}
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderLeft}>
                    <View style={[styles.avatarCircle, { backgroundColor: resultColor + '20' }]}>
                      <Ionicons 
                        name={item.female ? "female" : "male"} 
                        size={20} 
                        color={resultColor} 
                      />
                    </View>
                    <View style={styles.cardHeaderText}>
                      <Text style={[styles.cardPatient, { color: theme.text }] }>
                        {item.patientName || 'Без имени'}
                      </Text>
                      <Text style={[styles.cardDate, { color: theme.mutted }]}>{formatDate(item.createdAt)}</Text>
                    </View>
                  </View>
                  <Pressable 
                    onPress={() => deleteItem(item.id)}
                    style={[styles.deleteBtn, { backgroundColor: theme.danger + '20' }]}
                    accessibilityRole="button"
                  >
                    <Ionicons name="trash-outline" size={18} color={theme.danger} />
                  </Pressable>
                </View>

                {/* Результат */}
                {(() => {
                  const cat = classifyClCr(item.result);
                  return (
                    <View style={[styles.resultBadge, { backgroundColor: cat.bg || (resultColor + '15') }]}>
                      <View style={styles.resultLeft}>
                        <Ionicons name="water" size={20} color={resultColor} />
                        <Text style={[styles.resultLabel, { color: theme.mutted }]}>Клиренс</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={[styles.resultValue, { color: resultColor }]}>
                          {item.result} <Text style={[styles.resultUnit, { color: theme.mutted }]}>mL/min</Text>
                        </Text>
                        <View style={[styles.categoryPill, { backgroundColor: cat.bg }]}> 
                          <Text style={[styles.categoryText, { color: cat.color }]} numberOfLines={2} ellipsizeMode="tail">{cat.label}</Text>
                        </View>
                      </View>
                    </View>
                  );
                })()}

                {/* Параметры */}
                <View style={styles.params}>
                  <View style={[styles.paramItem, { backgroundColor: theme.card }]}> 
                    <MaterialCommunityIcons name="weight-kilogram" size={16} color={theme.mutted} />
                    <Text style={[styles.paramText, { color: theme.mutted }]}> 
                      {item.weightRaw ?? item.weightKg ?? '—'} {item.weightUnit ?? 'kg'}
                    </Text>
                  </View>
                  <View style={[styles.paramItem, { backgroundColor: theme.card }]}> 
                    <Ionicons name="calendar-outline" size={16} color={theme.mutted} />
                    <Text style={[styles.paramText, { color: theme.mutted }]}>{item.age ?? '—'} лет</Text>
                  </View>
                  <View style={[styles.paramItem, { backgroundColor: theme.card }]}> 
                    <Ionicons name="flask-outline" size={16} color={theme.mutted} />
                    <Text style={[styles.paramText, { color: theme.mutted }]}> 
                      {item.creatinineRaw ?? item.creatinineMgDl ?? '—'} {item.creatinineUnit ?? 'mg/dL'}
                    </Text>
                  </View>
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8FAFC',
    paddingTop: 20
  },

  // Заголовок
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16
  },
  title: { 
    fontSize: 28, 
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2
  },
  statsCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4
  },
  statsNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff'
  },

  // Поиск
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 14,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  searchIcon: {
    marginRight: 8
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: '#0F172A'
  },
  clearBtn: {
    padding: 4
  },

  // Список
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100
  },

  // Карточка
  card: { 
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center'
  },
  cardHeaderText: {
    flex: 1
  },
  cardPatient: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: '#0F172A',
    marginBottom: 2
  },
  cardDate: { 
    color: '#94A3B8', 
    fontSize: 12,
    fontWeight: '500'
  },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center'
  },

  // Результат
  resultBadge: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12
  },
  resultLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569'
  },
  resultValue: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5
  },
  resultUnit: {
    fontSize: 14,
    fontWeight: '600'
  },
  categoryPill: {
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    maxWidth: 140,
    alignItems: 'center',
    alignSelf: 'flex-end',
    overflow: 'hidden'
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    flexWrap: 'wrap'
  },

  // Параметры
  params: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  paramItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4
  },
  paramText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500'
  },

  // Пустое состояние
  empty: { 
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60
  },
  emptyIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6
  },
  emptyText: { 
    color: '#94A3B8',
    fontSize: 15,
    textAlign: 'center'
  }
});