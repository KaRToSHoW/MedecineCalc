import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import StatsCard from '../components/StatsCard';
import MiniSpark from '../components/MiniSpark';
import { auth, db } from '../firebase/initFirebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { LineChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface HistoryDoc {
  result?: number;
  createdAt?: any;
  patientName?: string | null;
}

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const [lastResult, setLastResult] = useState<string>('—');
  const [avg7, setAvg7] = useState<string>('—');
  const [count, setCount] = useState<number>(0);
  const [lastPatient, setLastPatient] = useState<string>('—');
  const [sparkData, setSparkData] = useState<number[]>([]);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    const q = query(collection(db, 'users', user.uid, 'history'), orderBy('createdAt', 'desc'), limit(100));
    const unsub = onSnapshot(q, snap => {
      const docs: HistoryDoc[] = snap.docs.map(d => d.data() as HistoryDoc);
      const values = docs.map(d => typeof d.result === 'number' ? d.result! : NaN).filter(v => !isNaN(v));
      setCount(snap.size);
      if (values.length > 0) setLastResult(String(values[0]));
      else setLastResult('—');
      const last7 = values.slice(0, 7);
      if (last7.length > 0) setAvg7(String((last7.reduce((a,b)=>a+b,0)/last7.length).toFixed(1)));
      else setAvg7('—');
      const lastName = docs[0] && docs[0].patientName ? docs[0].patientName : '—';
      setLastPatient(lastName ?? '—');
      setSparkData(values.slice(0, 20).reverse());
    }, () => {});
    return () => unsub && unsub();
  }, []);

  const trend = sparkData.length >= 2 
    ? Math.round((sparkData[sparkData.length-1] - sparkData[0]) * 10) / 10 
    : 0;
  const trendUp = trend > 0;

  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Заголовок */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Привет! 👋</Text>
          <Text style={styles.subtitle}>Вот ваша статистика</Text>
        </View>
        <View style={styles.badge}>
          <Ionicons name="analytics-outline" size={20} color="#007AFF" />
        </View>
      </View>

      {/* Главная карточка с градиентом */}
      <LinearGradient
        colors={['#007AFF', '#0051D5']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroCard}
      >
        <View style={styles.heroTop}>
          <View style={styles.heroLeft}>
            <Text style={styles.heroLabel}>Последний результат</Text>
            <View style={styles.heroValueRow}>
              <Text style={styles.heroValue}>
                {lastResult === '—' ? '—' : lastResult}
              </Text>
              {lastResult !== '—' && (
                <Text style={styles.heroUnit}>mL/min</Text>
              )}
            </View>
            {lastPatient !== '—' && (
              <View style={styles.patientTag}>
                <Ionicons name="person" size={12} color="#fff" />
                <Text style={styles.patientText}>{lastPatient}</Text>
              </View>
            )}
          </View>
          
          {/* Тренд индикатор */}
          {trend !== 0 && (
            <View style={[styles.trendBadge, trendUp ? styles.trendUp : styles.trendDown]}>
              <Ionicons 
                name={trendUp ? "trending-up" : "trending-down"} 
                size={16} 
                color="#fff" 
              />
              <Text style={styles.trendText}>{Math.abs(trend)}</Text>
            </View>
          )}
        </View>

        {/* График */}
        {sparkData.length > 0 && (
          <View style={styles.chartContainer}>
            <LineChart
              data={{ 
                labels: [], 
                datasets: [{ data: sparkData.length > 0 ? sparkData : [0] }] 
              }}
              width={width - 64}
              height={100}
              withDots={false}
              withInnerLines={false}
              withOuterLines={false}
              withVerticalLabels={false}
              withHorizontalLabels={false}
              chartConfig={{
                backgroundGradientFrom: 'transparent',
                backgroundGradientTo: 'transparent',
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity * 0.7})`,
                strokeWidth: 2,
                propsForBackgroundLines: { strokeWidth: 0 }
              }}
              bezier
              style={{ marginTop: 8 }}
            />
          </View>
        )}
      </LinearGradient>

      {/* Компактная сетка статистики */}
      <View style={styles.statsGrid}>
        {/* Средний клиренс */}
        <View style={[styles.miniCard, { backgroundColor: '#10B981' }]}>
          <Ionicons name="bar-chart-outline" size={24} color="#fff" />
          <Text style={styles.miniValue}>{avg7}</Text>
          <Text style={styles.miniLabel}>Средний (7)</Text>
        </View>

        {/* Всего расчётов */}
        <View style={[styles.miniCard, { backgroundColor: '#F59E0B' }]}>
          <Ionicons name="calculator-outline" size={24} color="#fff" />
          <Text style={styles.miniValue}>{count}</Text>
          <Text style={styles.miniLabel}>Расчётов</Text>
        </View>

        {/* Тренд */}
        <View style={[styles.miniCard, { backgroundColor: '#8B5CF6' }]}>
          <Ionicons 
            name={trendUp ? "trending-up" : "trending-down"} 
            size={24} 
            color="#fff" 
          />
          <Text style={styles.miniValue}>
            {trend > 0 ? '+' : ''}{trend === 0 ? '—' : trend}
          </Text>
          <Text style={styles.miniLabel}>Динамика</Text>
        </View>
      </View>

      {/* Дополнительная информация */}
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <View style={styles.infoIconWrap}>
            <Ionicons name="time-outline" size={20} color="#64748B" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Последнее обновление</Text>
            <Text style={styles.infoValue}>Только что</Text>
          </View>
        </View>
        
        <View style={[styles.infoRow, { marginTop: 12 }]}>
          <View style={styles.infoIconWrap}>
            <Ionicons name="person-circle-outline" size={20} color="#64748B" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Последний пациент</Text>
            <Text style={styles.infoValue}>{lastPatient}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    padding: 20, 
    backgroundColor: '#F8FAFC',
    paddingBottom: 100 
  },
  
  // Заголовок
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  greeting: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5
  },
  subtitle: {
    fontSize: 15,
    color: '#64748B',
    marginTop: 2
  },
  badge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EBF5FF',
    justifyContent: 'center',
    alignItems: 'center'
  },

  // Главная карточка
  heroCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  heroLeft: {
    flex: 1
  },
  heroLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.5,
    textTransform: 'uppercase'
  },
  heroValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 8,
    marginBottom: 8
  },
  heroValue: {
    fontSize: 42,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -1
  },
  heroUnit: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.7)',
    marginLeft: 6,
    fontWeight: '600'
  },
  patientTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 4
  },
  patientText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600'
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4
  },
  trendUp: {
    backgroundColor: 'rgba(16, 185, 129, 0.3)'
  },
  trendDown: {
    backgroundColor: 'rgba(239, 68, 68, 0.3)'
  },
  trendText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700'
  },
  chartContainer: {
    marginTop: 4,
    marginHorizontal: -8
  },

  // Компактная сетка
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16
  },
  miniCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3
  },
  miniValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    marginTop: 8,
    marginBottom: 2
  },
  miniLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '600',
    textAlign: 'center'
  },

  // Инфо карточка
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  infoIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  infoContent: {
    flex: 1
  },
  infoLabel: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 2
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A'
  }
});