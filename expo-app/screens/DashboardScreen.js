import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions, Pressable, Alert, Platform } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { auth, db } from '../firebase/initFirebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import StatsCard from '../components/StatsCard';
import MiniSpark from '../components/MiniSpark';

function safeNum(v) { return typeof v === 'number' ? v : parseFloat(v) || 0 }

export default function DashboardScreen() {
  const [items, setItems] = useState([]);
  const [view, setView] = useState('overview'); // 'overview' | 'trends' | 'patients'
  const [range, setRange] = useState('30'); // '7'|'30'|'all'

  useEffect(() => {
    let unsub = null;
    const user = auth.currentUser;
    if (!user) {
      setItems([]);
      return;
    }
    const q = query(collection(db, 'users', user.uid, 'history'), orderBy('createdAt', 'desc'));
    unsub = onSnapshot(q, snap => {
      const arr = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setItems(arr);
    }, () => {});

    return () => unsub && unsub();
  }, []);

  const total = items.length;
  const avg = total === 0 ? 0 : (items.reduce((s, it) => s + safeNum(it.result), 0) / total).toFixed(1);
  const last = items[0] ? safeNum(items[0].result).toFixed(1) : '—';

  const recent = items.slice(0, 12).map(i => safeNum(i.result)).reverse();
  const labels = items.slice(0, 12).map((_, idx) => `${idx+1}`).reverse();

  const chartWidth = Math.max(Dimensions.get('window').width - 40, 220);

  const patientsMap = items.reduce((acc, it) => {
    const name = it.patientName ? it.patientName : 'Без имени';
    acc[name] = acc[name] || [];
    acc[name].push(it);
    return acc;
  }, {});

  const patientList = Object.keys(patientsMap).map(k => ({ name: k, count: patientsMap[k].length, last: patientsMap[k][0] }));

  const rangeFilteredItems = (() => {
    if (range === 'all') return items;
    const days = parseInt(range, 10);
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    return items.filter(it => {
      const t = it.createdAt && it.createdAt.toDate ? it.createdAt.toDate().getTime() : (typeof it.createdAt === 'number' ? it.createdAt : Date.now());
      return t >= cutoff;
    });
  })();

  const exportCsv = async () => {
    if (!items || items.length === 0) {
      Alert.alert('Нет данных', 'Нет записей для экспорта');
      return;
    }
    const rows = [['patientName','age','weight','weightUnit','creatinine','creatinineUnit','female','result','createdAt']];
    rangeFilteredItems.forEach(it => {
      const date = it.createdAt && it.createdAt.toDate ? it.createdAt.toDate().toISOString() : (typeof it.createdAt === 'number' ? new Date(it.createdAt).toISOString() : '');
      rows.push([it.patientName || '', it.age ?? '', it.weightRaw ?? it.weightKg ?? '', it.weightUnit || '', it.creatinineRaw ?? it.creatinineMgDl ?? '', it.creatinineUnit || '', it.female ? '1' : '0', it.result ?? '', date]);
    });
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    try {
      if (Platform.OS === 'web') {
        // create downloadable blob for web
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'medcalc_export.csv';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        Alert.alert('Экспорт', 'CSV загружен как medcalc_export.csv');
        return;
      }
      // Native: instruct to install file-sharing packages
      Alert.alert('Экспорт на устройстве', `Чтобы сохранить CSV на устройстве, установите пакеты:\n\nnpm install expo-file-system expo-sharing\n\nПосле установки обновите код (опционально) для сохранения и шаринга файла.`);
    } catch (e) {
      Alert.alert('Ошибка', e.message || String(e));
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      <Text style={styles.title}>Дашборд</Text>

      <View style={styles.segmentRow}>
        {['overview','trends','patients'].map(v => (
          <Pressable key={v} onPress={() => setView(v)} style={[styles.segment, view===v && styles.segmentActive]}>
            <Text style={[styles.segmentText, view===v && styles.segmentTextActive]}>{v === 'overview' ? 'Обзор' : v === 'trends' ? 'Тренды' : 'Пациенты'}</Text>
          </Pressable>
        ))}
      </View>

      <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
        <View style={{flexDirection:'row', gap:8}}>
          <Pressable onPress={() => setRange('7')} style={[styles.rangeBtn, range==='7' && styles.rangeBtnActive]}><Text style={range==='7' ? styles.rangeBtnTextActive : styles.rangeBtnText}>7d</Text></Pressable>
          <Pressable onPress={() => setRange('30')} style={[styles.rangeBtn, range==='30' && styles.rangeBtnActive]}><Text style={range==='30' ? styles.rangeBtnTextActive : styles.rangeBtnText}>30d</Text></Pressable>
          <Pressable onPress={() => setRange('all')} style={[styles.rangeBtn, range==='all' && styles.rangeBtnActive]}><Text style={range==='all' ? styles.rangeBtnTextActive : styles.rangeBtnText}>All</Text></Pressable>
        </View>
        <Pressable onPress={exportCsv} style={styles.exportBtn}><Text style={{color:'#064e3b', fontWeight:'700'}}>Export CSV</Text></Pressable>
      </View>

      {view === 'overview' && (
        <View>
          <View style={styles.row}>
            <StatsCard title="Всего расчётов" value={total} sparkData={recent.slice().reverse().slice(-8)} />
            <StatsCard title="Средний GFR" value={`${avg} mL/min`} subtitle="по всем записям" sparkData={recent.slice().reverse().slice(-8)} />
          </View>
          <StatsCard title="Последний результат" value={last === '—' ? last : `${last} mL/min`} />
          <View style={{height:12}} />
          <Text style={styles.section}>Последние расчёты</Text>
          {items.slice(0,6).map(it => (
            <View key={it.id} style={styles.listItem}>
              <View>
                {it.patientName ? <Text style={styles.listPatient}>{it.patientName}</Text> : null}
                <Text style={styles.listValue}>{it.result} mL/min</Text>
                <Text style={styles.listMeta}>{`${it.weightKg ? it.weightKg.toFixed(1) : ''} kg · ${it.age ?? ''} y`}</Text>
              </View>
              <MiniSpark data={[it.result]} />
            </View>
          ))}
        </View>
      )}

      {view === 'trends' && (
        <View>
          <Text style={styles.section}>График последних результатов</Text>
          {recent.length === 0 ? (
            <View style={{padding:20}}><Text style={{color:'#666'}}>Нет данных для построения графика</Text></View>
          ) : (
            <BarChart
              data={{ labels: labels, datasets: [{ data: recent }] }}
              width={chartWidth}
              height={260}
              fromZero={true}
              showValuesOnTopOfBars={true}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#f8fafc',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(37,99,235, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(102,102,102, ${opacity})`,
                style: { borderRadius: 12 }
              }}
              style={{ borderRadius: 12 }}
            />
          )}
        </View>
      )}

      {view === 'patients' && (
        <View>
          <Text style={styles.section}>Пациенты</Text>
          {patientList.length === 0 ? (
            <View style={{padding:20}}><Text style={{color:'#666'}}>Нет записей</Text></View>
          ) : (
            patientList.map(p => (
              <View key={p.name} style={styles.patientCard}>
                <Text style={styles.patientName}>{p.name}</Text>
                <Text style={styles.patientMeta}>{p.count} расчётов · последний: {p.last.result} mL/min</Text>
              </View>
            ))
          )}
        </View>
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  segmentRow: { flexDirection: 'row', marginBottom: 14, backgroundColor: '#f3f4f6', padding: 6, borderRadius: 12 },
  segment: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10 },
  segmentActive: { backgroundColor: '#fff' },
  segmentText: { color: '#444' },
  segmentTextActive: { color: '#1e40af', fontWeight: '700' },
  row: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  section: { fontSize: 14, color: '#444', marginTop: 18, marginBottom: 8 },
  listItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, backgroundColor: '#fff', borderRadius: 10, marginBottom: 8, borderWidth: 1, borderColor: '#f1f5f9' },
  listPatient: { fontSize: 13, fontWeight: '700', color: '#0f172a' },
  listValue: { fontSize: 16, fontWeight: '700' },
  listMeta: { color: '#666', marginTop: 4 },
  patientCard: { padding: 12, borderRadius: 10, backgroundColor: '#f8fafc', marginBottom: 10 },
  patientName: { fontWeight: '700' },
  patientMeta: { color: '#666', marginTop: 4 }
  ,rangeBtn: { paddingVertical:6, paddingHorizontal:10, borderRadius:8, backgroundColor:'#fff', borderWidth:1, borderColor:'#eef2ff' },
  rangeBtnActive: { backgroundColor:'#e0e7ff' },
  rangeBtnText: { color:'#334155' },
  rangeBtnTextActive: { color:'#1e3a8a', fontWeight:'700' },
  exportBtn: { paddingVertical:6, paddingHorizontal:12, borderRadius:8, backgroundColor:'#bbf7d0' }
});
