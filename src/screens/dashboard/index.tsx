import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Platform, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { GlassCard, GlassButton, BackgroundContainer } from '@/components/atoms';
import { useROSStore } from '@/store';
import { topicManager } from '@/services/ros-client';
import { theme } from '@/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ConnectionIndicator = ({ connected, connecting }: { connected: boolean; connecting: boolean }) => {
  const pulse = useSharedValue(0);

  React.useEffect(() => {
    if (connecting) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1000 }),
          withTiming(0, { duration: 1000 })
        ),
        -1
      );
    } else {
      pulse.value = 0;
    }
  }, [connecting]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pulse.value, [0, 1], [0.3, 1]),
    transform: [{ scale: interpolate(pulse.value, [0, 1], [0.9, 1.1]) }],
  }));

  return (
    <GlassCard style={styles.statusCard}>
      <View style={styles.statusHeader}>
        <Animated.View style={animatedStyle}>
          <View style={[styles.statusDot, { backgroundColor: connected ? theme.colors.success : theme.colors.error }]} />
        </Animated.View>
        <Text style={styles.statusTitle}>연결 상태</Text>
      </View>
      <Text style={[styles.statusText, { color: connected ? theme.colors.success : theme.colors.text.secondary }]}>
        {connecting ? '연결 중...' : connected ? '연결됨' : '연결 끊김'}
      </Text>
    </GlassCard>
  );
};

const BatteryIndicator = ({ battery }: { battery: any }) => {
  const rotation = useSharedValue(0);

  React.useEffect(() => {
    if (battery.isCharging) {
      rotation.value = withRepeat(
        withTiming(360, { duration: 3000 }),
        -1
      );
    } else {
      rotation.value = 0;
    }
  }, [battery.isCharging]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const getBatteryColor = (percentage: number) => {
    if (percentage > 60) return theme.colors.success;
    if (percentage > 20) return theme.colors.warning;
    return theme.colors.error;
  };

  return (
    <GlassCard style={styles.statusCard}>
      <View style={styles.batteryHeader}>
        <Animated.View style={animatedStyle}>
          <Ionicons 
            name={battery.isCharging ? "battery-charging" : "battery-half"} 
            size={24} 
            color={getBatteryColor(battery.percentage)} 
          />
        </Animated.View>
        <Text style={styles.statusTitle}>배터리</Text>
      </View>
      
      <View style={styles.batteryCircle}>
        <View style={styles.batteryCircleBackground}>
          <LinearGradient
            colors={[getBatteryColor(battery.percentage), getBatteryColor(battery.percentage) + '40']}
            style={[
              styles.batteryCircleFill,
              {
                height: `${battery.percentage}%`,
              }
            ]}
          />
        </View>
        <Text style={styles.batteryPercentage}>{battery.percentage.toFixed(0)}%</Text>
      </View>
      
      <View style={styles.batteryDetails}>
        <Text style={styles.batteryDetailText}>{battery.voltage.toFixed(1)}V</Text>
        <Text style={styles.batteryDetailText}>•</Text>
        <Text style={styles.batteryDetailText}>{battery.current.toFixed(1)}A</Text>
      </View>
    </GlassCard>
  );
};

const QuickActionCard = ({ icon, label, color, onPress }: any) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.quickActionContainer, animatedStyle]}>
      <GlassCard 
        style={styles.quickActionCard}
        pressable
        onPress={onPress}
      >
        <View style={[styles.quickActionIcon, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon} size={32} color={color} />
        </View>
        <Text style={styles.quickActionLabel}>{label}</Text>
      </GlassCard>
    </Animated.View>
  );
};

export function DashboardScreen() {
  const { connection, battery, position, cameraThumbnail } = useROSStore();

  const handleEmergencyStop = () => {
    topicManager.publishEmergencyStop();
  };

  return (
    <BackgroundContainer style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Status Cards Row */}
          <View style={styles.statusRow}>
            <ConnectionIndicator connected={connection.connected} connecting={connection.connecting} />
            <BatteryIndicator battery={battery} />
          </View>

          {/* Camera Preview */}
          {cameraThumbnail && (
            <GlassCard style={styles.cameraCard}>
              <Text style={styles.sectionTitle}>카메라</Text>
              <View style={styles.cameraContainer}>
                <Image 
                  source={{ uri: cameraThumbnail }} 
                  style={styles.cameraImage}
                  resizeMode="cover"
                />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.4)']}
                  style={styles.cameraOverlay}
                />
                <View style={styles.cameraLive}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>LIVE</Text>
                </View>
              </View>
            </GlassCard>
          )}

          {/* Quick Actions */}
          <Text style={styles.sectionTitle}>빠른 실행</Text>
          <View style={styles.quickActionsGrid}>
            <QuickActionCard
              icon="play-circle"
              label="순찰 시작"
              color={theme.colors.primary}
              onPress={() => {}}
            />
            <QuickActionCard
              icon="walk"
              label="따라오기"
              color={theme.colors.accent}
              onPress={() => {}}
            />
            <QuickActionCard
              icon="search"
              label="로봇 찾기"
              color={theme.colors.warning}
              onPress={() => {}}
            />
            <QuickActionCard
              icon="pulse"
              label="진단 실행"
              color={theme.colors.info}
              onPress={() => {}}
            />
          </View>

          {/* Emergency Stop Button */}
          <View style={styles.emergencyContainer}>
            <GlassButton
              onPress={handleEmergencyStop}
              label="긴급 정지"
              variant="danger"
              size="large"
              icon={<Ionicons name="stop-circle" size={28} color="#FFFFFF" />}
              style={styles.emergencyButton}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </BackgroundContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.md,
    paddingBottom: theme.platform.tabBarHeight + theme.spacing.xl,
  },
  statusRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  statusCard: {
    flex: 1,
    padding: theme.spacing.md,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: theme.spacing.sm,
  },
  statusTitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  statusText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
  },
  batteryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  batteryCircle: {
    width: 80,
    height: 80,
    alignSelf: 'center',
    marginVertical: theme.spacing.sm,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  batteryCircleBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 40,
    backgroundColor: theme.colors.glass.dark,
    borderWidth: 2,
    borderColor: theme.colors.border,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  batteryCircleFill: {
    width: '100%',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  batteryPercentage: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  batteryDetails: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  batteryDetailText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
  },
  cameraCard: {
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.md,
  },
  cameraContainer: {
    position: 'relative',
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  cameraImage: {
    width: '100%',
    height: 200,
    backgroundColor: theme.colors.glass.dark,
  },
  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  cameraLive: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    marginRight: theme.spacing.xs,
  },
  liveText: {
    fontSize: theme.typography.fontSize.xs,
    color: '#FFFFFF',
    fontWeight: theme.typography.fontWeight.bold,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  quickActionContainer: {
    width: (SCREEN_WIDTH - theme.spacing.md * 3) / 2,
  },
  quickActionCard: {
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  quickActionLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  emergencyContainer: {
    marginTop: theme.spacing.md,
  },
  emergencyButton: {
    width: '100%',
  },
});