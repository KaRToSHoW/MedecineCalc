import React from 'react';
import { View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

export default function MiniSpark({ data = [] }) {
  if (!data || data.length === 0) return <View style={{height:36}} />;
  const cfg = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(37,99,235, ${opacity})`,
    propsForDots: { r: '0' }
  };
  return (
    <LineChart
      data={{ labels: data.map(()=>'') , datasets: [{ data }] }}
      width={120}
      height={36}
      withDots={false}
      withInnerLines={false}
      withOuterLines={false}
      withVerticalLabels={false}
      withHorizontalLabels={false}
      chartConfig={cfg}
      bezier
      style={{ paddingRight: 0 }}
    />
  );
}
