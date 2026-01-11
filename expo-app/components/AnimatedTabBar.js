import React, { useRef, useEffect, useState } from 'react';
import { View, Text, Pressable, Animated, StyleSheet, PanResponder, Dimensions, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function AnimatedTabBar({ state, descriptors, navigation }) {
  const { routes, index } = state;
  const [width, setWidth] = useState(Dimensions.get('window').width);
  const tabWidth = width / routes.length;
  const translate = useRef(new Animated.Value(index * tabWidth)).current;

  useEffect(() => {
    Animated.spring(translate, { toValue: index * tabWidth, useNativeDriver: true, speed: 20, bounciness: 8 }).start();
  }, [index, tabWidth]);

  useEffect(() => {
    const onChange = () => setWidth(Dimensions.get('window').width);
    const sub = Dimensions.addEventListener('change', onChange);
    return () => sub?.remove?.();
  }, []);

  const pan = useRef(PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dx) > 20 && Math.abs(gestureState.dy) < 30,
    onPanResponderRelease: (_, gesture) => {
      if (gesture.dx < -40 && index < routes.length - 1) {
        navigation.navigate(routes[index + 1].name);
      } else if (gesture.dx > 40 && index > 0) {
        navigation.navigate(routes[index - 1].name);
      }
    }
  })).current;

  const bubbleStyle = { transform: [{ translateX: Animated.add(translate, new Animated.Value((tabWidth - 56) / 2)) }] };

  return (
    <View style={styles.container} onLayout={(e) => setWidth(e.nativeEvent.layout.width)} {...(Platform.OS !== 'web' ? pan.panHandlers : {})}>
      <Animated.View style={[styles.bubble, bubbleStyle, Platform.OS === 'web' ? { pointerEvents: 'none' } : {}]} />

      {routes.map((route, i) => {
        const focused = index === i;
        const label = descriptors[route.key].options.tabBarLabel ?? route.name;
        const icons = {
          Calculator: 'calculator',
          History: 'history',
          Profile: 'account',
          Dashboard: 'view-dashboard'
        };
        const iconName = icons[route.name] || 'circle';
        return (
          <Pressable key={route.key} style={styles.tab} onPress={() => navigation.navigate(route.name)} android_ripple={{ color: '#00000005' }}>
            <View style={styles.iconWrap}>
              <MaterialCommunityIcons name={iconName} size={22} color={focused ? '#2563eb' : '#666'} />
            </View>
            <Text style={[styles.tabText, focused && styles.tabTextActive]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 64,
    backgroundColor: '#ffffffEE',
    alignItems: 'center',
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderColor: '#eee'
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  iconWrap: { height: 28, justifyContent: 'center', alignItems: 'center' },
  tabText: { color: '#444' },
  tabTextActive: { color: '#2563eb', fontWeight: '700' },
  bubble: {
    position: 'absolute',
    width: 56,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(37,99,235,0.14)',
    top: 14,
    left: 0
  }
});
