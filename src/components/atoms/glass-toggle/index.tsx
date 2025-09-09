import React from 'react';
import { View, Switch, Text, StyleSheet, Platform } from 'react-native';
import { theme } from '@/theme';

interface GlassToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function GlassToggle({
  value,
  onValueChange,
  label,
  disabled = false,
}: GlassToggleProps) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{
          false: theme.colors.glass.medium,
          true: theme.colors.accent + '40',
        }}
        thumbColor={value ? theme.colors.accent : theme.colors.text.secondary}
        ios_backgroundColor={theme.colors.glass.dark}
        style={Platform.OS === 'android' && styles.androidSwitch}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
  },
  label: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.medium,
    flex: 1,
  },
  androidSwitch: {
    transform: [{ scale: 1.2 }],
  },
});