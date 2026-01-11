import React, { useRef } from 'react';
import { View, PanResponder, GestureResponderEvent, PanResponderGestureState, StyleSheet } from 'react-native';

type Props = {
  children: React.ReactNode;
  navigation: any;
  tabs: string[];
  index: number;
};

export default function SwipeWrapper({ children, navigation, tabs, index }: Props) {
  const startX = useRef<number | null>(null);

  const pan = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dx) > 10,
    onPanResponderGrant: (e: GestureResponderEvent) => { startX.current = e.nativeEvent.pageX; },
    onPanResponderRelease: (_, gestureState: PanResponderGestureState) => {
      const dx = gestureState.dx;
      const threshold = 50;
      if (dx < -threshold) {
        // swipe left -> next tab
        const next = Math.min(tabs.length - 1, index + 1);
        if (next !== index) navigation.navigate(tabs[next]);
      } else if (dx > threshold) {
        // swipe right -> prev tab
        const prev = Math.max(0, index - 1);
        if (prev !== index) navigation.navigate(tabs[prev]);
      }
      startX.current = null;
    }
  });

  return (
    <View style={styles.fill} {...pan.panHandlers}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({ fill: { flex: 1 } });
