import React from 'react';
import { Platform, View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { RootTabParamList } from '@/types/navigation';
import { theme } from '@/theme';

import { DashboardScreen } from '@/screens/dashboard';
import { WaypointsScreen } from '@/screens/waypoints';
import { FollowScreen } from '@/screens/follow';
import { VoiceScreen } from '@/screens/voice';
import { SettingsScreen } from '@/screens/settings';

const Tab = createBottomTabNavigator<RootTabParamList>();

interface TabIconProps {
  focused: boolean;
  color: string;
  size: number;
  iconName: string;
}

const AnimatedIcon = ({ focused, color, size, iconName }: TabIconProps) => {
  const animatedStyle = useAnimatedStyle(() => {
    const scale = withSpring(focused ? 1.2 : 1, {
      damping: 15,
      stiffness: 400,
    });
    const translateY = withSpring(focused ? -2 : 0, {
      damping: 15,
      stiffness: 400,
    });
    return {
      transform: [{ scale }, { translateY }],
    };
  });

  return (
    <Animated.View style={animatedStyle}>
      <View style={focused && styles.iconGlow}>
        <Ionicons 
          name={iconName as any} 
          size={size} 
          color={focused ? theme.colors.accent : color} 
        />
      </View>
    </Animated.View>
  );
};

export function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.colors.accent,
        tabBarInactiveTintColor: theme.colors.text.secondary,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
            backgroundColor: 'transparent',
            borderTopWidth: 0,
            elevation: 0,
            height: theme.platform.tabBarHeight,
          },
          android: {
            backgroundColor: theme.colors.glass.dark,
            borderTopWidth: 1,
            borderTopColor: theme.colors.border,
            height: theme.platform.tabBarHeight,
            elevation: 8,
          },
        }),
        tabBarBackground: () => (
          Platform.OS === 'ios' ? (
            <BlurView
              intensity={80}
              tint="dark"
              style={StyleSheet.absoluteFillObject}
            >
              <View style={styles.tabBarGradient} />
            </BlurView>
          ) : (
            <View style={[StyleSheet.absoluteFillObject, styles.androidTabBar]} />
          )
        ),
        tabBarLabelStyle: {
          fontSize: theme.typography.fontSize.xs,
          fontWeight: theme.typography.fontWeight.medium,
          marginBottom: Platform.OS === 'ios' ? 0 : 4,
        },
        headerStyle: Platform.select({
          ios: {
            backgroundColor: 'transparent',
            borderBottomWidth: 0,
            shadowOpacity: 0,
            elevation: 0,
          },
          android: {
            backgroundColor: theme.colors.background,
            elevation: 4,
            shadowOpacity: 0.1,
          },
        }),
        headerBackground: () => (
          Platform.OS === 'ios' ? (
            <BlurView
              intensity={80}
              tint="dark"
              style={StyleSheet.absoluteFillObject}
            >
              <View style={styles.headerGradient} />
            </BlurView>
          ) : (
            <View style={[StyleSheet.absoluteFillObject, styles.androidHeader]} />
          )
        ),
        headerTintColor: theme.colors.text.primary,
        headerTitleStyle: {
          fontWeight: theme.typography.fontWeight.bold,
          fontSize: theme.typography.fontSize.lg,
        },
        headerTitleAlign: 'center',
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: '대시보드',
          tabBarLabel: '대시보드',
          tabBarIcon: ({ focused, color, size }) => (
            <AnimatedIcon
              focused={focused}
              color={color}
              size={size}
              iconName="home"
            />
          ),
        }}
      />
      <Tab.Screen
        name="Waypoints"
        component={WaypointsScreen}
        options={{
          title: '웨이포인트',
          tabBarLabel: '웨이포인트',
          tabBarIcon: ({ focused, color, size }) => (
            <AnimatedIcon
              focused={focused}
              color={color}
              size={size}
              iconName="location"
            />
          ),
        }}
      />
      <Tab.Screen
        name="Follow"
        component={FollowScreen}
        options={{
          title: '따라오기',
          tabBarLabel: '따라오기',
          tabBarIcon: ({ focused, color, size }) => (
            <AnimatedIcon
              focused={focused}
              color={color}
              size={size}
              iconName="walk"
            />
          ),
        }}
      />
      <Tab.Screen
        name="Voice"
        component={VoiceScreen}
        options={{
          title: '음성 명령',
          tabBarLabel: '음성 명령',
          tabBarIcon: ({ focused, color, size }) => (
            <AnimatedIcon
              focused={focused}
              color={color}
              size={size}
              iconName="mic"
            />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: '설정',
          tabBarLabel: '설정',
          tabBarIcon: ({ focused, color, size }) => (
            <AnimatedIcon
              focused={focused}
              color={color}
              size={size}
              iconName="settings"
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBarGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 10, 10, 0.85)',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  androidTabBar: {
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  headerGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 10, 10, 0.85)',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  androidHeader: {
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  iconGlow: {
    shadowColor: theme.colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
});