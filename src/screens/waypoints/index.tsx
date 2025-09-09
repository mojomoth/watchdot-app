import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList,
  Platform,
  ScrollView,
  Pressable
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { useWaypointStore } from '@/store';
import { actionManager } from '@/services/ros-client';
import { 
  GlassContainer, 
  GlassButton, 
  GlassCard,
  GlassInput,
  BackgroundContainer
} from '@/components/atoms';
import { theme } from '@/theme';

export function WaypointsScreen() {
  const { 
    waypoints, 
    navigationStatus, 
    startNavigation, 
    stopNavigation,
    removeWaypoint 
  } = useWaypointStore();

  const [newWaypointName, setNewWaypointName] = useState('');
  const pulseAnimation = useSharedValue(0);

  React.useEffect(() => {
    if (navigationStatus.state === 'navigating') {
      pulseAnimation.value = withRepeat(
        withTiming(1, { duration: 1500 }),
        -1,
        true
      );
    } else {
      pulseAnimation.value = 0;
    }
  }, [navigationStatus.state]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pulseAnimation.value, [0, 1], [0.5, 1]),
    transform: [{ scale: interpolate(pulseAnimation.value, [0, 1], [1, 1.05]) }],
  }));

  const handleStart = () => {
    if (waypoints.length > 0) {
      startNavigation();
      actionManager.startWaypointNavigation(waypoints);
    }
  };

  const handleStop = () => {
    stopNavigation();
    actionManager.cancelNavigation();
  };

  const handleAddWaypoint = () => {
    // Mock adding waypoint - in real app, this would open a map selector
    const mockPosition = {
      x: Math.random() * 10 - 5,
      y: Math.random() * 10 - 5,
      z: 0
    };
    // This would be handled by the waypoint store
    console.log('Add waypoint:', newWaypointName, mockPosition);
    setNewWaypointName('');
  };

  const renderWaypointItem = ({ item, index }: { item: any; index: number }) => (
    <GlassCard style={styles.waypointCard} pressable={false}>
      <View style={styles.waypointContent}>
        <View style={styles.waypointLeft}>
          <View style={styles.waypointIndexContainer}>
            <LinearGradient
              colors={[theme.colors.accent, theme.colors.accent + '80']}
              style={styles.waypointIndexGradient}
            >
              <Text style={styles.waypointIndex}>{index + 1}</Text>
            </LinearGradient>
          </View>
          <View style={styles.waypointInfo}>
            {item.name && <Text style={styles.waypointName}>{item.name}</Text>}
            <Text style={styles.waypointCoords}>
              X: {item.position.x.toFixed(2)}, Y: {item.position.y.toFixed(2)}
            </Text>
          </View>
        </View>
        <Pressable 
          onPress={() => removeWaypoint(item.id)}
          style={({ pressed }) => [
            styles.deleteButton,
            pressed && styles.deleteButtonPressed
          ]}
        >
          <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
        </Pressable>
      </View>
    </GlassCard>
  );

  return (
    <BackgroundContainer style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Map Section */}
        <GlassCard style={styles.mapContainer} pressable={false}>
          <View style={styles.mapHeader}>
            <Text style={styles.mapTitle}>순찰 경로</Text>
            {navigationStatus.state === 'navigating' && (
              <Animated.View style={[styles.liveIndicator, pulseStyle]}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE</Text>
              </Animated.View>
            )}
          </View>
          
          <View style={styles.mapContent}>
            <LinearGradient
              colors={['#1a1a2e50', '#16213e50']}
              style={styles.mapPlaceholder}
            >
              <Ionicons name="map-outline" size={48} color={theme.colors.text.disabled} />
              <Text style={styles.mapPlaceholderText}>지도 영역</Text>
              <Text style={styles.mapHintText}>터치하여 웨이포인트 추가</Text>
            </LinearGradient>
          </View>

          {/* Add Waypoint Section */}
          <View style={styles.addWaypointSection}>
            <GlassInput
              placeholder="웨이포인트 이름 (선택사항)"
              value={newWaypointName}
              onChangeText={setNewWaypointName}
              icon={<Ionicons name="location" size={20} color={theme.colors.text.secondary} />}
              style={styles.waypointInput}
            />
            <GlassButton
              title="추가"
              onPress={handleAddWaypoint}
              variant="primary"
              size="sm"
              icon={<Ionicons name="add" size={20} color="#FFFFFF" />}
            />
          </View>
        </GlassCard>

        {/* Waypoints List */}
        <View style={styles.listSection}>
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>웨이포인트 목록</Text>
            <Text style={styles.listCount}>{waypoints.length}개</Text>
          </View>

          {waypoints.length > 0 ? (
            <FlatList
              data={waypoints}
              keyExtractor={(item) => item.id}
              renderItem={renderWaypointItem}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={styles.listSeparator} />}
            />
          ) : (
            <GlassCard style={styles.emptyCard} pressable={false}>
              <Ionicons name="navigate-outline" size={48} color={theme.colors.text.disabled} />
              <Text style={styles.emptyText}>웨이포인트를 추가하여</Text>
              <Text style={styles.emptyText}>순찰 경로를 만드세요</Text>
            </GlassCard>
          )}
        </View>

        {/* Control Section */}
        <View style={styles.controlSection}>
          {navigationStatus.state === 'navigating' && (
            <GlassCard style={styles.progressCard} pressable={false}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressTitle}>순찰 진행 상황</Text>
                <Text style={styles.progressText}>
                  {navigationStatus.currentWaypoint}/{navigationStatus.totalWaypoints}
                </Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarBg}>
                  <LinearGradient
                    colors={[theme.colors.accent, theme.colors.success]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[
                      styles.progressBarFill,
                      { width: `${navigationStatus.progress || 0}%` }
                    ]}
                  />
                </View>
              </View>
            </GlassCard>
          )}

          {navigationStatus.state === 'idle' ? (
            <GlassButton
              title="순찰 시작"
              onPress={handleStart}
              variant="success"
              size="lg"
              icon={<Ionicons name="play" size={24} color="#FFFFFF" />}
              disabled={waypoints.length === 0}
              style={styles.controlButton}
            />
          ) : (
            <GlassButton
              title="정지"
              onPress={handleStop}
              variant="danger"
              size="lg"
              icon={<Ionicons name="stop" size={24} color="#FFFFFF" />}
              style={styles.controlButton}
            />
          )}
        </View>
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
  mapContainer: {
    margin: theme.spacing.md,
    padding: theme.spacing.lg,
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  mapTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.error + '20',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.error,
    marginRight: theme.spacing.xs,
  },
  liveText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.error,
  },
  mapContent: {
    height: 250,
    marginBottom: theme.spacing.md,
  },
  mapPlaceholder: {
    flex: 1,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.glass.light,
    borderStyle: 'dashed' as any,
  },
  mapPlaceholderText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.sm,
  },
  mapHintText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.disabled,
    marginTop: theme.spacing.xs,
  },
  addWaypointSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  waypointInput: {
    flex: 1,
    marginBottom: 0,
  },
  listSection: {
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  listTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  listCount: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    backgroundColor: theme.colors.glass.light,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  listSeparator: {
    height: theme.spacing.sm,
  },
  waypointCard: {
    padding: theme.spacing.md,
  },
  waypointContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  waypointLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  waypointIndexContainer: {
    marginRight: theme.spacing.md,
  },
  waypointIndexGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waypointIndex: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
    color: '#FFFFFF',
  },
  waypointInfo: {
    flex: 1,
  },
  waypointName: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  waypointCoords: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  deleteButton: {
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  deleteButtonPressed: {
    backgroundColor: theme.colors.glass.light,
  },
  emptyCard: {
    padding: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  controlSection: {
    paddingHorizontal: theme.spacing.md,
  },
  progressCard: {
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  progressTitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  progressText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  progressBarContainer: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarBg: {
    height: '100%',
    backgroundColor: theme.colors.glass.dark,
    borderRadius: 4,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  controlButton: {
    marginBottom: Platform.OS === 'ios' ? 0 : theme.spacing.md,
  },
});