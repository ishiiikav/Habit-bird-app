// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AuthProvider, useAuth } from './context/AuthContext';
import AuthScreen   from './screens/AuthScreen';
import HomeScreen   from './screens/HomeScreen';
import JournalScreen from './screens/JournalScreen';
import ProfileScreen from './screens/ProfileScreen';

const Tab   = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Bottom tab navigator (logged in)
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'rgba(255,255,255,0.95)',
          borderTopWidth: 1,
          borderTopColor: 'rgba(0,0,0,0.07)',
          paddingBottom: 8,
          paddingTop: 6,
          height: 64,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
        tabBarActiveTintColor: '#ff7043',
        tabBarInactiveTintColor: '#bbb',
        tabBarIcon: ({ focused }) => {
          const icons = { Home: '🏠', Journal: '📓', Profile: '🐦' };
          return (
            <View style={{ transform: [{ scale: focused ? 1.15 : 1 }] }}>
              {/* icon handled by emoji in label */}
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Home"    component={HomeScreen}    options={{ tabBarLabel: '🏠 Home'    }} />
      <Tab.Screen name="Journal" component={JournalScreen} options={{ tabBarLabel: '📓 Journal' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: '🐦 Profile' }} />
    </Tab.Navigator>
  );
}

// Root — shows auth or main based on login state
function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#b8e4f9' }}>
      <ActivityIndicator size="large" color="#ff7043" />
    </View>
  );

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user
        ? <Stack.Screen name="Main" component={MainTabs} />
        : <Stack.Screen name="Auth" component={AuthScreen} />
      }
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <NavigationContainer>
          <StatusBar style="dark" />
          <RootNavigator />
        </NavigationContainer>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
