import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useROSStore } from '@/store';
import { serviceManager, topicManager } from '@/services/ros-client';

export function FollowScreen() {
  const followStatus = useROSStore(state => state.followStatus);
  const setFollowStatus = useROSStore(state => state.setFollowStatus);

  const handleToggleFollow = async () => {
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
      case 'active': return '#4CAF50';
      case 'lost': return '#FFA726';
      case 'error': return '#FF5252';
      default: return '#9E9E9E';
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
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Main Toggle Button */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity 
            style={[
              styles.toggleButton,
              { backgroundColor: followStatus.active ? '#FF5252' : '#4CAF50' }
            ]}
            onPress={handleToggleFollow}
          >
            <Ionicons 
              name={followStatus.active ? "stop-circle" : "play-circle"} 
              size={80} 
              color="#FFFFFF" 
            />
            <Text style={styles.toggleText}>
              {followStatus.active ? '정지' : '시작'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Status Display */}
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>상태</Text>
          <View style={styles.statusIndicator}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
            <Text style={styles.statusText}>{getStatusText()}</Text>
          </View>
          {followStatus.errorMessage && (
            <Text style={styles.errorMessage}>{followStatus.errorMessage}</Text>
          )}
        </View>

        {/* Distance Control */}
        <View style={styles.distanceCard}>
          <Text style={styles.distanceTitle}>거리 유지</Text>
          <View style={styles.sliderContainer}>
            <Text style={styles.distanceValue}>{followStatus.distance.toFixed(1)}m</Text>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={5}
              value={followStatus.distance}
              onValueChange={handleDistanceChange}
              minimumTrackTintColor="#007AFF"
              maximumTrackTintColor="#E0E0E0"
              thumbTintColor="#007AFF"
            />
          </View>
          <View style={styles.distanceLabels}>
            <Text style={styles.distanceLabel}>1m</Text>
            <Text style={styles.distanceLabel}>3m</Text>
            <Text style={styles.distanceLabel}>5m</Text>
          </View>
        </View>

        {/* Mode Selection */}
        <View style={styles.modeCard}>
          <Text style={styles.modeTitle}>추종 모드</Text>
          <View style={styles.modeButtons}>
            <TouchableOpacity 
              style={[
                styles.modeButton,
                followStatus.mode === 'vision' && styles.modeButtonActive
              ]}
              onPress={() => setFollowStatus({ mode: 'vision' })}
            >
              <Ionicons 
                name="eye" 
                size={24} 
                color={followStatus.mode === 'vision' ? '#FFFFFF' : '#666'} 
              />
              <Text style={[
                styles.modeButtonText,
                followStatus.mode === 'vision' && styles.modeButtonTextActive
              ]}>
                비전
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.modeButton,
                followStatus.mode === 'companion' && styles.modeButtonActive
              ]}
              onPress={() => setFollowStatus({ mode: 'companion' })}
            >
              <Ionicons 
                name="radio" 
                size={24} 
                color={followStatus.mode === 'companion' ? '#FFFFFF' : '#666'} 
              />
              <Text style={[
                styles.modeButtonText,
                followStatus.mode === 'companion' && styles.modeButtonTextActive
              ]}>
                리모컨
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  toggleContainer: {
    alignItems: 'center',
    marginVertical: 32,
  },
  toggleButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  toggleText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
  },
  errorMessage: {
    color: '#FF5252',
    fontSize: 12,
    marginTop: 8,
  },
  distanceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  distanceTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distanceValue: {
    fontSize: 20,
    fontWeight: 'bold',
    minWidth: 60,
    marginRight: 12,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  distanceLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 72,
  },
  distanceLabel: {
    fontSize: 12,
    color: '#666',
  },
  modeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modeTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  modeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 4,
  },
  modeButtonActive: {
    backgroundColor: '#007AFF',
  },
  modeButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  modeButtonTextActive: {
    color: '#FFFFFF',
  },
});