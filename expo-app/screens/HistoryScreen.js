import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput } from 'react-native';
import { auth, db } from '../firebase/initFirebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

function formatDate(ts) {
  try {
    const d = typeof ts === 'number' ? new Date(ts) : ts && ts.toDate ? ts.toDate() : new Date();
    return d.toLocaleString();
  } catch (e) { return '' }
}

export default function HistoryScreen() {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState('');

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

  const filtered = query.trim() === '' ? items : items.filter(it => (it.patientName || '').toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>История расчётов</Text>
      <TextInput style={styles.search} placeholder="Поиск по имени пациента" value={query} onChangeText={setQuery} />
      {items.length === 0 ? (
        <View style={styles.empty}><Text style={styles.emptyText}>История пуста</Text></View>
      ) : (
        <FlatList data={filtered} keyExtractor={i => i.id} renderItem={({item}) => (
          <View style={styles.card}>
            {item.patientName ? <Text style={styles.cardPatient}>{item.patientName}</Text> : null}
            <Text style={styles.cardValue}>{item.result} mL/min</Text>
            <Text style={styles.cardMeta}>{`${item.weightRaw ?? item.weightKg ?? ''} ${item.weightUnit ?? 'kg'} · ${item.age ?? ''} y · ${item.creatinineRaw ?? item.creatinineMgDl ?? ''} ${item.creatinineUnit ?? 'mg/dL'}`}</Text>
            <Text style={styles.cardDate}>{formatDate(item.createdAt)}</Text>
          </View>
        )} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff', flex: 1 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  card: { padding: 12, borderRadius: 10, backgroundColor: '#f8fafc', marginBottom: 10 },
  cardValue: { fontSize: 18, fontWeight: '700' },
  cardPatient: { fontSize: 14, fontWeight: '700', color: '#333', marginBottom: 6 },
  cardMeta: { color: '#555', marginTop: 6 },
  cardDate: { color: '#999', marginTop: 8, fontSize: 12 },
  empty: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#666' }
  ,search: { borderWidth:1, borderColor:'#eee', padding:8, borderRadius:8, marginBottom:12 }
});
