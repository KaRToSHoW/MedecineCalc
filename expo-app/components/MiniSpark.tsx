import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from './ThemeContext';

export default function MiniSpark({ data, accent }: { data?: number[]; accent?: string }) {
  const vals = (data || []).slice(-20);
  if (!vals || vals.length === 0) return <View style={{ height: 36 }} />;
  const max = Math.max(...vals.map(v => (isNaN(v as any) ? 0 : Number(v))));
  const min = Math.min(...vals.map(v => (isNaN(v as any) ? 0 : Number(v))));
  const range = Math.max(1, max - min);
  return (
    <View style={styles.row}>
      {vals.map((v, i) => {
        const n = isNaN(v as any) ? 0 : Number(v);
        const h = Math.round(((n - min) / range) * 100);
        const { theme } = useTheme();
        const barColor = accent ?? theme.primary;
        return <View key={i} style={[styles.bar, { height: `${10 + h}%`, backgroundColor: barColor }]} />;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', height: 36, gap: 4 },
  bar: { width: 6, borderRadius: 3 }
});
