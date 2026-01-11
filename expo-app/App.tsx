import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import CalculatorScreen from './screens/CalculatorScreen';
import DashboardScreen from './screens/DashboardScreen';
import ProfileScreen from './screens/ProfileScreen';
import HistoryScreen from './screens/HistoryScreen';
import AuthScreen from './screens/AuthScreen';
import GlassTabBar from './components/GlassTabBar';
import SwipeWrapper from './components/SwipeWrapper';
import { Ionicons } from '@expo/vector-icons';
import { auth } from './firebase/initFirebase';
import { onAuthStateChanged } from 'firebase/auth';
import Toast from 'react-native-toast-message';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const tabs = ['Dashboard', 'Calculator', 'History', 'Profile'];
  return (
    <Tab.Navigator
      tabBar={props => <GlassTabBar {...props} />}
      screenOptions={({ route }) => ({ headerShown: false })}
    >
      {tabs.map((name, idx) => {
        let Component: any = DashboardScreen;
        if (name === 'Calculator') Component = CalculatorScreen;
        else if (name === 'History') Component = HistoryScreen;
        else if (name === 'Profile') Component = ProfileScreen;

        return (
          <Tab.Screen
            key={name}
            name={name}
            options={{ title: name === 'Dashboard' ? 'Дашборд' : name === 'Calculator' ? 'Калькулятор' : name === 'History' ? 'История' : 'Профиль' }}
          >
            {props => (
              <SwipeWrapper {...props} tabs={tabs} index={idx}>
                <Component {...props} />
              </SwipeWrapper>
            )}
          </Tab.Screen>
        );
      })}
    </Tab.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, u => setUser(u));
    return unsubscribe;
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="Main" component={MainTabs} />
        ) : (
          <Stack.Screen name="Auth" component={AuthScreen} />
        )}
      </Stack.Navigator>
      <Toast />
    </NavigationContainer>
  );
}
