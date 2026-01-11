import React, { useEffect, useRef, useState } from 'react';
import { View, TouchableOpacity, Animated, StyleSheet, Dimensions, Text, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
const { width } = Dimensions.get('window');

export default function GlassTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const tabCount = state.routes.length;
  const [containerWidth, setContainerWidth] = useState<number | null>(null);
  const [tabPositions, setTabPositions] = useState<{ x: number; width: number }[]>([]);
  const wrapHeight = 70;

  const effectiveWidth = containerWidth ?? (width - 24);
  const tabWidth = effectiveWidth / tabCount;
  const bubbleSize = Math.min(56, tabWidth * 0.75);
  const topOffset = (wrapHeight - bubbleSize) / 2;

  const translateX = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (tabPositions.length > 0 && tabPositions[state.index]) {
      const tab = tabPositions[state.index];
      // ИСПРАВЛЕНИЕ: центр вкладки минус половина пузырька
      const centerX = tab.x + (tab.width / 2) - (bubbleSize / 2);

      // Легкая пульсация
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.92,
          duration: 100,
          useNativeDriver: true
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 120,
          useNativeDriver: true
        })
      ]).start();

      // Плавное перемещение
      Animated.spring(translateX, {
        toValue: centerX,
        friction: 8,
        tension: 100,
        useNativeDriver: true
      }).start();
    }
  }, [state.index, tabPositions, bubbleSize]);

  return (
    <View
      style={styles.wrap}
      pointerEvents="box-none"
    >
      {/* Фон в стиле iOS с blur эффектом */}
      <BlurView style={styles.background} pointerEvents="none" />

      {/* Контейнер для измерения ширины */}
      <View 
        style={styles.container}
        onLayout={(e) => {
          setContainerWidth(e.nativeEvent.layout.width);
        }}
      >
        {/* Анимированный пузырек */}
        <Animated.View
          style={[
            styles.bubble,
            {
              width: bubbleSize,
              height: bubbleSize,
              borderRadius: bubbleSize / 2,
              top: topOffset,
              transform: [{ translateX }, { scale: scaleAnim }]
            }
          ]}
          pointerEvents="none"
        />

        {/* Вкладки */}
        <View style={styles.row}>
          {state.routes.map((route, idx) => {
            const { options } = descriptors[route.key];
            const label = options.title ?? route.name;
            const focused = state.index === idx;
            const onPress = () => navigation.navigate(route.name);
            const color = focused ? '#007AFF' : '#8E8E93';
            
            let iconName = 'ellipse';
            if (route.name === 'Dashboard') iconName = 'speedometer-outline';
            else if (route.name === 'Calculator') iconName = 'calculator-outline';
            else if (route.name === 'History') iconName = 'time-outline';
            else if (route.name === 'Profile') iconName = 'person-circle-outline';

            return (
              <TouchableOpacity
                key={route.key}
                style={styles.tab}
                onPress={onPress}
                activeOpacity={0.7}
                onLayout={(e) => {
                  const { x, width: w } = e.nativeEvent.layout;
                  setTabPositions(prev => {
                    const next = [...prev];
                    next[idx] = { x, width: w };
                    return next;
                  });
                }}
              >
                <Ionicons name={iconName as any} size={24} color={color} />
                <Text 
                  style={[styles.label, { color, fontWeight: focused ? '600' : '400' }]} 
                  numberOfLines={1}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: Platform.OS === 'ios' ? 20 : 12,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center'
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    // ИСПРАВЛЕНИЕ: Светлый полупрозрачный фон как iOS
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    backdropFilter: 'blur(20px)', // Только для web, на native нужен BlurView
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.8)'
  },
  container: {
    width: '100%',
    height: '100%',
    position: 'relative'
  },
  row: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    width: '100%',
    height: '100%',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 8
  },
  tab: {
    flex: 1,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2
  },
  label: {
    fontSize: 11,
    marginTop: 1,
    letterSpacing: -0.1
  },
  bubble: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.04)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4
  }
});