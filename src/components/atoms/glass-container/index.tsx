import React from 'react';
import { View, ViewStyle, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/theme';

interface GlassContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  gradient?: boolean;
  borderless?: boolean;
  darkMode?: boolean;
}

export function GlassContainer({
  children,
  style,
  intensity = 20,
  gradient = true,
  borderless = false,
  darkMode = true,
}: GlassContainerProps) {
  const containerStyle = [
    styles.container,
    !borderless && styles.border,
    darkMode ? styles.darkMode : styles.lightMode,
    style,
  ];

  const glassColors = darkMode
    ? ['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']
    : ['rgba(0, 0, 0, 0.05)', 'rgba(0, 0, 0, 0.02)'];

  if (Platform.OS === 'ios') {
    return (
      <BlurView intensity={intensity} style={containerStyle} tint={darkMode ? 'dark' : 'light'}>
        {gradient ? (
          <LinearGradient
            colors={glassColors}
            style={StyleSheet.absoluteFillObject}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        ) : null}
        {children}
      </BlurView>
    );
  }

  // Android fallback with elevation and semi-transparent background
  return (
    <View style={[containerStyle, styles.androidContainer]}>
      {gradient ? (
        <LinearGradient
          colors={glassColors}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderRadius: theme.borderRadius.lg,
  },
  border: {
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  darkMode: {
    backgroundColor: theme.colors.glass.dark,
  },
  lightMode: {
    backgroundColor: theme.colors.glass.light,
  },
  androidContainer: {
    ...theme.shadows.md,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
});