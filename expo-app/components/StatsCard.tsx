import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MiniSpark from './MiniSpark';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from './ThemeContext';

interface Props {
  title: string;
  value: React.ReactNode;
  subtitle?: string;
  sparkData?: number[];
  iconName?: string;
  accentColor?: string;
}

export default function StatsCard({ title, value, subtitle, sparkData, iconName, accentColor }: Props) {
  const { theme } = useTheme();
  const accent = accentColor ?? theme.accent ?? theme.primary;

  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderLeftColor: accent } as any]}>
      <View style={styles.rowTop}>
        {iconName ? <Ionicons name={iconName as any} size={20} color={accent} style={{ marginRight: 8 }} /> : null}
        <Text style={[styles.title, { color: theme.mutted }]}>{title}</Text>
      </View>
      <Text style={[styles.value, { color: theme.text }]}>{value}</Text>
      {subtitle ? <Text style={[styles.sub, { color: theme.mutted }]}>{subtitle}</Text> : null}
      {sparkData ? <View style={{ marginTop: 10 }}><MiniSpark data={sparkData} accent={accent} /></View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, borderRadius: 12, marginBottom: 12, borderLeftWidth: 6, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 },
  rowTop: { flexDirection: 'row', alignItems: 'center' },
  title: { fontSize: 12 },
  value: { fontSize: 22, fontWeight: '800', marginTop: 6 },
  sub: { marginTop: 6 }
});
