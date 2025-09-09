import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Platform,
  ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  interpolate,
  withSpring,
} from 'react-native-reanimated';
import { useROSStore } from '@/store';
import { serviceManager, topicManager } from '@/services/ros-client';
import { 
  GlassContainer, 
  GlassButton, 
  GlassCard,
  GlassToggle,
  BackgroundContainer
} from '@/components/atoms';
import { theme } from '@/theme';

export function FollowScreen() {
  const followStatus = useROSStore(state => state.followStatus);
  const setFollowStatus = useROSStore(state => state.setFollowStatus);
  
  const pulseAnimation = useSharedValue(0);
  const buttonScale = useSharedValue(1);

  React.useEffect(() => {
    if (followStatus.active) {
      pulseAnimation.value = withRepeat(
        withTiming(1, { duration: 2000 }),
        -1,
        true
      );
    } else {
      pulseAnimation.value = 0;
    }
  }, [followStatus.active]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pulseAnimation.value, [0, 1], [0.3, 0.8]),
    transform: [{ scale: interpolate(pulseAnimation.value, [0, 1], [1, 1.3]) }],
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handleToggleFollow = async () => {
    buttonScale.value = withSpring(0.95, { damping: 15 }, () => {
      buttonScale.value = withSpring(1, { damping: 15 });
    });
    
    if (followStatus.active) {
      await serviceManager.callStopFollow();
    } else {
      await serviceManager.callStartFollow();
    }
  };

  const handleDistanceChange = (distance: number) => {
    setFollowStatus({ distance });
    topicManager.publishFollowDistance(distance);
  };

  const getStatusColor = () => {
    switch (followStatus.state) {
      case 'active': return theme.colors.success;
      case 'lost': return theme.colors.warning;
      case 'error': return theme.colors.error;
      default: return theme.colors.text.disabled;
    }
  };

  const getStatusText = () => {
    switch (followStatus.state) {
      case 'active': return '활성';
      case 'lost': return '대상 잃음';
      case 'error': return '오류';
      default: return '대기';
    }
  };

  return (
    <BackgroundContainer style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Toggle Button */}
        <View style={styles.toggleContainer}>
          <View style={styles.toggleWrapper}>
            {followStatus.active && (
              <Animated.View style={[styles.pulseBg, pulseStyle]}>
                <LinearGradient
                  colors={[theme.colors.error + '40', theme.colors.error + '10']}
                  style={styles.pulseGradient}
                />
              </Animated.View>
            )}
            <Animated.View style={buttonStyle}>
              <GlassContainer style={styles.toggleButton} intensity={30} gradient>
                <LinearGradient
                  colors={followStatus.active 
                    ? [theme.colors.error, theme.colors.error + 'CC']
                    : [theme.colors.success, theme.colors.success + 'CC']
                  }
                  style={styles.toggleButtonGradient}
                >
                  <GlassButton
                    title=""
                    onPress={handleToggleFollow}
                    style={styles.toggleButtonInner}
                    variant="custom"
                  >
                    <Ionicons 
                      name={followStatus.active ? "stop-circle" : "play-circle"} 
                      size={64} 
                      color="#FFFFFF" 
                    />
                    <Text style={styles.toggleText}>
                      {followStatus.active ? '정지' : '시작'}
                    </Text>
                  </GlassButton>
                </LinearGradient>
              </GlassContainer>
            </Animated.View>
          </View>
        </View>

        {/* Status Display */}
        <GlassCard style={styles.statusCard} pressable={false}>
          <Text style={styles.sectionTitle}>상태</Text>
          <View style={styles.statusContent}>
            <View style={styles.statusIndicator}>
              <Animated.View 
                style={[
                  styles.statusDot, 
                  { backgroundColor: getStatusColor() },
                  followStatus.active && pulseStyle
                ]}
              />
              <Text style={styles.statusText}>{getStatusText()}</Text>
            </View>
            {followStatus.errorMessage && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={16} color={theme.colors.error} />
                <Text style={styles.errorMessage}>{followStatus.errorMessage}</Text>
              </View>
            )}
          </View>
        </GlassCard>

        {/* Distance Control */}
        <GlassCard style={styles.distanceCard} pressable={false}>
          <Text style={styles.sectionTitle}>거리 유지</Text>
          <View style={styles.distanceDisplay}>
            <LinearGradient
              colors={[theme.colors.accent + '20', theme.colors.accent + '10']}
              style={styles.distanceValueBg}
            >
              <Text style={styles.distanceValue}>{followStatus.distance.toFixed(1)}</Text>
              <Text style={styles.distanceUnit}>m</Text>
            </LinearGradient>
          </View>
          
          <View style={styles.sliderContainer}>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={5}
              value={followStatus.distance}
              onValueChange={handleDistanceChange}
              minimumTrackTintColor={theme.colors.accent}
              maximumTrackTintColor={theme.colors.glass.medium}
              thumbTintColor={theme.colors.accent}
            />
          </View>
          
          <View style={styles.distanceLabels}>
            <Text style={styles.distanceLabel}>1m</Text>
            <Text style={styles.distanceLabel}>3m</Text>
            <Text style={styles.distanceLabel}>5m</Text>
          </View>
        </GlassCard>

        {/* Mode Selection */}
        <GlassCard style={styles.modeCard} pressable={false}>
          <Text style={styles.sectionTitle}>추종 모드</Text>
          <View style={styles.modeOptions}>
            <View style={styles.modeOption}>
              <GlassToggle
                value={followStatus.mode === 'vision'}
                onValueChange={(value) => value && setFollowStatus({ mode: 'vision' })}
                label="비전 추종"
              />
              <Text style={styles.modeDescription}>
                카메라로 대상을 인식하여 추종
              </Text>
            </View>
            
            <View style={styles.modeDivider} />
            
            <View style={styles.modeOption}>
              <GlassToggle
                value={followStatus.mode === 'companion'}
                onValueChange={(value) => value && setFollowStatus({ mode: 'companion' })}
                label="리모컨 추종"
              />
              <Text style={styles.modeDescription}>
                리모컨 신호를 따라 추종
              </Text>
            </View>
          </View>
        </GlassCard>

        {/* Additional Settings */}
        <GlassCard style={styles.settingsCard} pressable={false}>
          <Text style={styles.sectionTitle}>추가 설정</Text>
          <View style={styles.settingsList}>
            <GlassToggle
              value={true}
              onValueChange={() => {}}
              label="장애물 회피"
            />
            <View style={styles.settingDivider} />
            <GlassToggle
              value={false}
              onValueChange={() => {}}
              label="속도 일치"
            />
            <View style={styles.settingDivider} />
            <GlassToggle
              value={true}
              onValueChange={() => {}}
              label="자동 재연결"
            />
          </View>
        </GlassCard>
      </ScrollView>
    </BackgroundContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xl,
  },
  toggleContainer: {
    alignItems: 'center',
    marginVertical: theme.spacing.xl,
  },
  toggleWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseBg: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  pulseGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
  },
  toggleButton: {
    width: 160,
    height: 160,
    borderRadius: 80,
    overflow: 'hidden',
  },
  toggleButtonGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleButtonInner: {
    backgroundColor: 'transparent',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleText: {
    color: '#FFFFFF',
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    marginTop: theme.spacing.sm,
  },
  statusCard: {
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  statusContent: {
    gap: theme.spacing.sm,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: theme.spacing.sm,
  },
  statusText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.error + '10',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    gap: theme.spacing.xs,
  },
  errorMessage: {
    color: theme.colors.error,
    fontSize: theme.typography.fontSize.sm,
    flex: 1,
  },
  distanceCard: {
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.lg,
  },
  distanceDisplay: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  distanceValueBg: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  distanceValue: {
    fontSize: 48,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.accent,
  },
  distanceUnit: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.accent,
    marginLeft: theme.spacing.xs,
  },
  sliderContainer: {
    paddingHorizontal: theme.spacing.sm,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  distanceLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    marginTop: theme.spacing.xs,
  },
  distanceLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  modeCard: {
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.lg,
  },
  modeOptions: {
    gap: theme.spacing.md,
  },
  modeOption: {
    gap: theme.spacing.xs,
  },
  modeDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing.md,
  },
  modeDivider: {
    height: 1,
    backgroundColor: theme.colors.glass.light,
    marginVertical: theme.spacing.xs,
  },
  settingsCard: {
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.lg,
  },
  settingsList: {
    gap: theme.spacing.xs,
  },
  settingDivider: {
    height: 1,
    backgroundColor: theme.colors.glass.light,
    marginVertical: theme.spacing.xs,
  },
});