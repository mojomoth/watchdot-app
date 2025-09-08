import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useWaypointStore } from '@/store';
import { actionManager } from '@/services/ros-client';

export function WaypointsScreen() {
  const { 
    waypoints, 
    navigationStatus, 
    startNavigation, 
    stopNavigation,
    removeWaypoint 
  } = useWaypointStore();

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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Map placeholder */}
        <View style={styles.mapContainer}>
          <Text style={styles.mapPlaceholder}>지도 영역</Text>
          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="add-circle" size={56} color="#007AFF" />
          </TouchableOpacity>
        </View>

        {/* Waypoint List */}
        <View style={styles.listContainer}>
          <Text style={styles.listTitle}>웨이포인트 목록</Text>
          <FlatList
            data={waypoints}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <View style={styles.waypointItem}>
                <View style={styles.waypointInfo}>
                  <Text style={styles.waypointIndex}>#{index + 1}</Text>
                  <View>
                    <Text style={styles.waypointCoords}>
                      X: {item.position.x.toFixed(2)}, Y: {item.position.y.toFixed(2)}
                    </Text>
                    {item.name && <Text style={styles.waypointName}>{item.name}</Text>}
                  </View>
                </View>
                <TouchableOpacity 
                  onPress={() => removeWaypoint(item.id)}
                  style={styles.deleteButton}
                >
                  <Ionicons name="trash-outline" size={20} color="#FF5252" />
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>웨이포인트를 추가하세요</Text>
            }
          />
        </View>

        {/* Control Buttons */}
        <View style={styles.controls}>
          {navigationStatus.state === 'idle' ? (
            <TouchableOpacity 
              style={[styles.controlButton, styles.startButton]}
              onPress={handleStart}
              disabled={waypoints.length === 0}
            >
              <Ionicons name="play" size={24} color="#FFFFFF" />
              <Text style={styles.controlText}>순찰 시작</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={[styles.controlButton, styles.stopButton]}
              onPress={handleStop}
            >
              <Ionicons name="stop" size={24} color="#FFFFFF" />
              <Text style={styles.controlText}>정지</Text>
            </TouchableOpacity>
          )}
          
          {navigationStatus.state === 'navigating' && (
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>
                진행중: {navigationStatus.currentWaypoint}/{navigationStatus.totalWaypoints}
              </Text>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill,
                    { width: `${navigationStatus.progress || 0}%` }
                  ]}
                />
              </View>
            </View>
          )}
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
  },
  mapContainer: {
    flex: 1,
    backgroundColor: '#E0E0E0',
    margin: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  mapPlaceholder: {
    fontSize: 18,
    color: '#666',
  },
  addButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
  listContainer: {
    backgroundColor: '#FFFFFF',
    maxHeight: 200,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  waypointItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  waypointInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  waypointIndex: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 12,
    color: '#007AFF',
  },
  waypointCoords: {
    fontSize: 14,
    color: '#333',
  },
  waypointName: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  deleteButton: {
    padding: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    paddingVertical: 20,
  },
  controls: {
    padding: 16,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  startButton: {
    backgroundColor: '#4CAF50',
  },
  stopButton: {
    backgroundColor: '#FF5252',
  },
  controlText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  progressContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  progressText: {
    fontSize: 14,
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
});