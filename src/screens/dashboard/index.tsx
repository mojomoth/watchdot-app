import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useROSStore } from '@/store';
import { topicManager } from '@/services/ros-client';

export function DashboardScreen() {
  const { connection, battery, position, cameraThumbnail } = useROSStore();

  const handleEmergencyStop = () => {
    topicManager.publishEmergencyStop();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Connection Status */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Ionicons 
              name={connection.connected ? "wifi" : "wifi-outline"} 
              size={24} 
              color={connection.connected ? "#4CAF50" : "#FF5252"} 
            />
            <Text style={styles.statusTitle}>연결 상태</Text>
          </View>
          <Text style={[
            styles.statusText,
            { color: connection.connected ? "#4CAF50" : "#FF5252" }
          ]}>
            {connection.connecting ? "연결 중..." : 
             connection.connected ? "연결됨" : "연결 끊김"}
          </Text>
          {connection.error && (
            <Text style={styles.errorText}>{connection.error}</Text>
          )}
        </View>

        {/* Battery Status */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Ionicons 
              name="battery-charging" 
              size={24} 
              color={battery.percentage > 20 ? "#4CAF50" : "#FF5252"} 
            />
            <Text style={styles.statusTitle}>배터리</Text>
          </View>
          <View style={styles.batteryContainer}>
            <View style={styles.batteryBar}>
              <View 
                style={[
                  styles.batteryFill,
                  { 
                    width: `${battery.percentage}%`,
                    backgroundColor: battery.percentage > 20 ? "#4CAF50" : "#FF5252"
                  }
                ]}
              />
            </View>
            <Text style={styles.batteryText}>{battery.percentage.toFixed(0)}%</Text>
          </View>
          <Text style={styles.batteryDetails}>
            {battery.voltage.toFixed(1)}V / {battery.current.toFixed(1)}A
          </Text>
        </View>

        {/* Camera Thumbnail */}
        {cameraThumbnail && (
          <View style={styles.cameraCard}>
            <Text style={styles.cameraTitle}>카메라 미리보기</Text>
            <Image 
              source={{ uri: cameraThumbnail }} 
              style={styles.cameraImage}
              resizeMode="cover"
            />
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>빠른 실행</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="play-circle" size={32} color="#007AFF" />
              <Text style={styles.actionText}>순찰 시작</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="walk" size={32} color="#007AFF" />
              <Text style={styles.actionText}>따라오기</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="search" size={32} color="#007AFF" />
              <Text style={styles.actionText}>로봇 찾기</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Emergency Stop */}
        <TouchableOpacity 
          style={styles.emergencyButton}
          onPress={handleEmergencyStop}
        >
          <Ionicons name="stop-circle" size={32} color="#FFFFFF" />
          <Text style={styles.emergencyText}>긴급 정지</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    padding: 16,
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
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#FF5252',
    fontSize: 12,
    marginTop: 4,
  },
  batteryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  batteryBar: {
    flex: 1,
    height: 24,
    backgroundColor: '#E0E0E0',
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 12,
  },
  batteryFill: {
    height: '100%',
    borderRadius: 12,
  },
  batteryText: {
    fontSize: 18,
    fontWeight: 'bold',
    minWidth: 50,
  },
  batteryDetails: {
    fontSize: 12,
    color: '#666',
  },
  cameraCard: {
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
  cameraTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  cameraImage: {
    width: '100%',
    height: 180,
    borderRadius: 8,
  },
  quickActions: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    fontSize: 12,
    marginTop: 8,
    color: '#333',
  },
  emergencyButton: {
    backgroundColor: '#FF5252',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  emergencyText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
});