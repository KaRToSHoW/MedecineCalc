import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MiniSpark from './MiniSpark';

export default function StatsCard({ title, value, subtitle, sparkData }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.value}>{value}</Text>
      {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}
      {sparkData ? <View style={{marginTop:8}}><MiniSpark data={sparkData} /></View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 14, borderRadius: 12, backgroundColor: '#f8fafc', marginBottom: 12 },
  title: { color: '#666', fontSize: 12 },
  value: { fontSize: 20, fontWeight: '700', marginTop: 4 },
  sub: { color: '#999', marginTop: 6 }
});
