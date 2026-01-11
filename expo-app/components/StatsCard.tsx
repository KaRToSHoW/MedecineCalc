import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MiniSpark from './MiniSpark';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  title: string;
  value: React.ReactNode;
  subtitle?: string;
  sparkData?: number[];
  iconName?: string;
  accentColor?: string;
}

export default function StatsCard({ title, value, subtitle, sparkData, iconName, accentColor = '#2563eb' }: Props) {
  return (
    <View style={[styles.card, { borderLeftColor: accentColor }] as any}>
      <View style={styles.rowTop}>
        {iconName ? <Ionicons name={iconName as any} size={20} color={accentColor} style={{ marginRight: 8 }} /> : null}
        <Text style={styles.title}>{title}</Text>
      </View>
      <Text style={styles.value}>{value}</Text>
      {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}
      {sparkData ? <View style={{ marginTop: 10 }}><MiniSpark data={sparkData} /></View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, borderRadius: 12, backgroundColor: '#fff', marginBottom: 12, borderLeftWidth: 6, borderLeftColor: '#2563eb', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 },
  rowTop: { flexDirection: 'row', alignItems: 'center' },
  title: { color: '#64748b', fontSize: 12 },
  value: { fontSize: 22, fontWeight: '800', marginTop: 6, color: '#0f172a' },
  sub: { color: '#94a3b8', marginTop: 6 }
});
