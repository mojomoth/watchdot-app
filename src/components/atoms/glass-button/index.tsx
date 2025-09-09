import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, TextStyle, Platform } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { GlassContainer } from '../glass-container';
import { theme } from '@/theme';

interface GlassButtonProps {
  onPress: () => void;
  label: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function GlassButton({
  onPress,
  label,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  style,
  textStyle,
  icon,
}: GlassButtonProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    'worklet';
    scale.value = withSpring(0.96, { damping: 15, stiffness: 400 });
    opacity.value = withSpring(0.8);
  };

  const handlePressOut = () => {
    'worklet';
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
    opacity.value = withSpring(1);
  };

  const handlePress = async () => {
    if (Platform.OS === 'ios') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  const getVariantStyle = () => {
    switch (variant) {
      case 'primary':
        return styles.primary;
      case 'secondary':
        return styles.secondary;
      case 'danger':
        return styles.danger;
      case 'success':
        return styles.success;
      default:
        return styles.primary;
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return styles.small;
      case 'large':
        return styles.large;
      default:
        return styles.medium;
    }
  };

  const getTextSizeStyle = () => {
    switch (size) {
      case 'small':
        return styles.textSmall;
      case 'large':
        return styles.textLarge;
      default:
        return styles.textMedium;
    }
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[animatedStyle, style]}
    >
      <GlassContainer
        style={[
          styles.button,
          getSizeStyle(),
          getVariantStyle(),
          disabled && styles.disabled,
        ]}
        intensity={30}
        gradient={true}
      >
        {icon && <>{icon}</>}
        <Text
          style={[
            styles.text,
            getTextSizeStyle(),
            icon && styles.textWithIcon,
            textStyle,
          ]}
        >
          {label}
        </Text>
      </GlassContainer>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.md,
  },
  small: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  medium: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  large: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
  },
  primary: {
    backgroundColor: theme.colors.primary + '20',
  },
  secondary: {
    backgroundColor: theme.colors.glass.medium,
  },
  danger: {
    backgroundColor: theme.colors.error + '20',
  },
  success: {
    backgroundColor: theme.colors.success + '20',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  textSmall: {
    fontSize: theme.typography.fontSize.sm,
  },
  textMedium: {
    fontSize: theme.typography.fontSize.base,
  },
  textLarge: {
    fontSize: theme.typography.fontSize.lg,
  },
  textWithIcon: {
    marginLeft: theme.spacing.sm,
  },
});