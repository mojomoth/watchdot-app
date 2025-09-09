import React from 'react';
import { ViewStyle, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { GlassContainer } from '../glass-container';
import { theme } from '@/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: keyof typeof theme.spacing;
  pressable?: boolean;
  onPress?: () => void;
}

export function GlassCard({
  children,
  style,
  padding = 'md',
  pressable = false,
  onPress,
}: GlassCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (pressable) {
      scale.value = withSpring(0.98, { damping: 15, stiffness: 400 });
    }
  };

  const handlePressOut = () => {
    if (pressable) {
      scale.value = withSpring(1, { damping: 15, stiffness: 400 });
    }
  };

  const containerContent = (
    <GlassContainer
      style={[
        styles.card,
        { padding: theme.spacing[padding] },
        style,
      ]}
      intensity={25}
      gradient={true}
    >
      {children}
    </GlassContainer>
  );

  if (pressable && onPress) {
    return (
      <Animated.View style={animatedStyle}>
        <AnimatedPressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          {containerContent}
        </AnimatedPressable>
      </Animated.View>
    );
  }

  return containerContent;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.md,
  },
});