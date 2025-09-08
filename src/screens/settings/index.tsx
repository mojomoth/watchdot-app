import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSettingsStore } from '@/store';
import { useROS } from '@/providers/ros-provider';

export function SettingsScreen() {
  const { 
    robots, 
    currentRobotId, 
    theme,
    notifications,
    addRobot,
    selectRobot,
    removeRobot,
    setTheme,
    updateNotifications 
  } = useSettingsStore();
  
  const { connect, disconnect } = useROS();
  const [showAddRobot, setShowAddRobot] = useState(false);
  const [newRobot, setNewRobot] = useState({
    name: '',
    ip: '',
    port: '9090',
    token: ''
  });

  const handleAddRobot = () => {
    if (newRobot.name && newRobot.ip) {
      addRobot({
        name: newRobot.name,
        ip: newRobot.ip,
        port: parseInt(newRobot.port) || 9090,
        token: newRobot.token,
        isDefault: robots.length === 0
      });
      setNewRobot({ name: '', ip: '', port: '9090', token: '' });
      setShowAddRobot(false);
    }
  };

  const handleSelectRobot = (robotId: string) => {
    disconnect();
    selectRobot(robotId);
    const robot = robots.find(r => r.id === robotId);
    if (robot) {
      connect(`ws://${robot.ip}:${robot.port}`, robot.token);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Robot Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>로봇 관리</Text>
          {robots.map((robot) => (
            <TouchableOpacity
              key={robot.id}
              style={[
                styles.robotItem,
                currentRobotId === robot.id && styles.robotItemActive
              ]}
              onPress={() => handleSelectRobot(robot.id)}
            >
              <View style={styles.robotInfo}>
                <Text style={styles.robotName}>{robot.name}</Text>
                <Text style={styles.robotIP}>{robot.ip}:{robot.port}</Text>
              </View>
              <View style={styles.robotActions}>
                {currentRobotId === robot.id && (
                  <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                )}
                <TouchableOpacity
                  onPress={() => removeRobot(robot.id)}
                  style={styles.deleteButton}
                >
                  <Ionicons name="trash-outline" size={20} color="#FF5252" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
          
          {showAddRobot ? (
            <View style={styles.addRobotForm}>
              <TextInput
                style={styles.input}
                placeholder="로봇 이름"
                value={newRobot.name}
                onChangeText={(text) => setNewRobot({ ...newRobot, name: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="IP 주소"
                value={newRobot.ip}
                onChangeText={(text) => setNewRobot({ ...newRobot, ip: text })}
                keyboardType="numeric"
              />
              <TextInput
                style={styles.input}
                placeholder="포트 (기본: 9090)"
                value={newRobot.port}
                onChangeText={(text) => setNewRobot({ ...newRobot, port: text })}
                keyboardType="numeric"
              />
              <TextInput
                style={styles.input}
                placeholder="토큰 (선택사항)"
                value={newRobot.token}
                onChangeText={(text) => setNewRobot({ ...newRobot, token: text })}
                secureTextEntry
              />
              <View style={styles.formButtons}>
                <TouchableOpacity 
                  style={[styles.formButton, styles.cancelButton]}
                  onPress={() => setShowAddRobot(false)}
                >
                  <Text style={styles.cancelButtonText}>취소</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.formButton, styles.saveButton]}
                  onPress={handleAddRobot}
                >
                  <Text style={styles.saveButtonText}>저장</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setShowAddRobot(true)}
            >
              <Ionicons name="add-circle-outline" size={20} color="#007AFF" />
              <Text style={styles.addButtonText}>로봇 추가</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Theme Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>테마</Text>
          <View style={styles.themeButtons}>
            {(['light', 'dark', 'auto'] as const).map((t) => (
              <TouchableOpacity
                key={t}
                style={[
                  styles.themeButton,
                  theme === t && styles.themeButtonActive
                ]}
                onPress={() => setTheme(t)}
              >
                <Text style={[
                  styles.themeButtonText,
                  theme === t && styles.themeButtonTextActive
                ]}>
                  {t === 'light' ? '라이트' : t === 'dark' ? '다크' : '자동'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Notification Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>알림 설정</Text>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>알림 활성화</Text>
            <Switch
              value={notifications.enabled}
              onValueChange={(value) => updateNotifications({ enabled: value })}
              trackColor={{ false: '#E0E0E0', true: '#81C784' }}
              thumbColor={notifications.enabled ? '#4CAF50' : '#F5F5F5'}
            />
          </View>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>소리</Text>
            <Switch
              value={notifications.sound}
              onValueChange={(value) => updateNotifications({ sound: value })}
              trackColor={{ false: '#E0E0E0', true: '#81C784' }}
              thumbColor={notifications.sound ? '#4CAF50' : '#F5F5F5'}
            />
          </View>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>진동</Text>
            <Switch
              value={notifications.vibration}
              onValueChange={(value) => updateNotifications({ vibration: value })}
              trackColor={{ false: '#E0E0E0', true: '#81C784' }}
              thumbColor={notifications.vibration ? '#4CAF50' : '#F5F5F5'}
            />
          </View>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>앱 정보</Text>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>버전</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>빌드 ID</Text>
            <Text style={styles.infoValue}>2025.09.08</Text>
          </View>
        </View>
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
  section: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  robotItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginBottom: 8,
  },
  robotItemActive: {
    backgroundColor: '#E3F2FD',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  robotInfo: {
    flex: 1,
  },
  robotName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  robotIP: {
    fontSize: 12,
    color: '#666',
  },
  robotActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButton: {
    marginLeft: 12,
    padding: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    borderStyle: 'dashed',
  },
  addButtonText: {
    marginLeft: 8,
    color: '#007AFF',
    fontSize: 14,
  },
  addRobotForm: {
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    fontSize: 14,
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  formButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: '#E0E0E0',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  cancelButtonText: {
    color: '#666',
  },
  saveButtonText: {
    color: '#FFFFFF',
  },
  themeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  themeButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  themeButtonActive: {
    backgroundColor: '#007AFF',
  },
  themeButtonText: {
    fontSize: 14,
    color: '#666',
  },
  themeButtonTextActive: {
    color: '#FFFFFF',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  settingLabel: {
    fontSize: 14,
    color: '#333',
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
  },
});