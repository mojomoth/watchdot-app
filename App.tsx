import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ROSProvider } from './src/providers/ros-provider';
import { BottomTabNavigator } from './src/navigation/bottom-tab-navigator';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ROSProvider>
          <NavigationContainer>
            <BottomTabNavigator />
            <StatusBar style="auto" />
          </NavigationContainer>
        </ROSProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}