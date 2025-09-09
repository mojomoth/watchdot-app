import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Pressable,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSettingsStore } from '@/store';
import { useROS } from '@/providers/ros-provider';
import { 
  GlassContainer, 
  GlassButton, 
  GlassCard,
  GlassInput,
  GlassToggle,
  BackgroundContainer
} from '@/components/atoms';
import { theme } from '@/theme';

export function SettingsScreen() {
  const { 
    robots, 
    currentRobotId, 
    theme: appTheme,
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
    <BackgroundContainer style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Robot Management Section */}
        <GlassCard style={styles.section} pressable={false}>
          <View style={styles.sectionHeader}>
            <Ionicons name="hardware-chip" size={24} color={theme.colors.accent} />
            <Text style={styles.sectionTitle}>로봇 관리</Text>
          </View>
          
          {robots.map((robot) => (
            <Pressable
              key={robot.id}
              onPress={() => handleSelectRobot(robot.id)}
              style={({ pressed }) => [
                styles.robotItem,
                currentRobotId === robot.id && styles.robotItemActive,
                pressed && styles.robotItemPressed
              ]}
            >
              <GlassContainer 
                style={styles.robotItemContainer} 
                intensity={currentRobotId === robot.id ? 25 : 15}
                gradient={currentRobotId === robot.id}
              >
                <View style={styles.robotInfo}>
                  <View style={styles.robotHeader}>
                    <Text style={styles.robotName}>{robot.name}</Text>
                    {currentRobotId === robot.id && (
                      <View style={styles.activeBadge}>
                        <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
                        <Text style={styles.activeText}>연결됨</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.robotIP}>
                    <Ionicons name="globe" size={12} color={theme.colors.text.secondary} />
                    {' '}{robot.ip}:{robot.port}
                  </Text>
                </View>
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation();
                    removeRobot(robot.id);
                  }}
                  style={styles.deleteButton}
                >
                  <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
                </Pressable>
              </GlassContainer>
            </Pressable>
          ))}
          
          {showAddRobot ? (
            <GlassContainer style={styles.addRobotForm} intensity={20}>
              <GlassInput
                placeholder="로봇 이름"
                value={newRobot.name}
                onChangeText={(text) => setNewRobot({ ...newRobot, name: text })}
                icon={<Ionicons name="text" size={20} color={theme.colors.text.secondary} />}
              />
              <GlassInput
                placeholder="IP 주소"
                value={newRobot.ip}
                onChangeText={(text) => setNewRobot({ ...newRobot, ip: text })}
                keyboardType="numeric"
                icon={<Ionicons name="globe" size={20} color={theme.colors.text.secondary} />}
              />
              <GlassInput
                placeholder="포트 (기본: 9090)"
                value={newRobot.port}
                onChangeText={(text) => setNewRobot({ ...newRobot, port: text })}
                keyboardType="numeric"
                icon={<Ionicons name="git-network" size={20} color={theme.colors.text.secondary} />}
              />
              <GlassInput
                placeholder="토큰 (선택사항)"
                value={newRobot.token}
                onChangeText={(text) => setNewRobot({ ...newRobot, token: text })}
                secureTextEntry
                icon={<Ionicons name="key" size={20} color={theme.colors.text.secondary} />}
              />
              <View style={styles.formButtons}>
                <GlassButton
                  title="취소"
                  onPress={() => {
                    setShowAddRobot(false);
                    setNewRobot({ name: '', ip: '', port: '9090', token: '' });
                  }}
                  variant="secondary"
                  size="sm"
                  style={styles.formButton}
                />
                <GlassButton
                  title="저장"
                  onPress={handleAddRobot}
                  variant="primary"
                  size="sm"
                  style={styles.formButton}
                />
              </View>
            </GlassContainer>
          ) : (
            <Pressable
              onPress={() => setShowAddRobot(true)}
              style={({ pressed }) => [
                styles.addButton,
                pressed && styles.addButtonPressed
              ]}
            >
              <LinearGradient
                colors={[theme.colors.glass.light, theme.colors.glass.medium]}
                style={styles.addButtonGradient}
              >
                <Ionicons name="add-circle-outline" size={20} color={theme.colors.accent} />
                <Text style={styles.addButtonText}>로봇 추가</Text>
              </LinearGradient>
            </Pressable>
          )}
        </GlassCard>

        {/* Theme Settings */}
        <GlassCard style={styles.section} pressable={false}>
          <View style={styles.sectionHeader}>
            <Ionicons name="color-palette" size={24} color={theme.colors.accent} />
            <Text style={styles.sectionTitle}>테마</Text>
          </View>
          
          <View style={styles.themeButtons}>
            {(['light', 'dark', 'auto'] as const).map((t) => (
              <Pressable
                key={t}
                onPress={() => setTheme(t)}
                style={({ pressed }) => [
                  styles.themeButton,
                  appTheme === t && styles.themeButtonActive,
                  pressed && styles.themeButtonPressed
                ]}
              >
                <GlassContainer 
                  style={styles.themeButtonContainer}
                  intensity={appTheme === t ? 30 : 15}
                  gradient={appTheme === t}
                >
                  <Ionicons 
                    name={t === 'light' ? 'sunny' : t === 'dark' ? 'moon' : 'contrast'}
                    size={24} 
                    color={appTheme === t ? theme.colors.accent : theme.colors.text.secondary} 
                  />
                  <Text style={[
                    styles.themeButtonText,
                    appTheme === t && styles.themeButtonTextActive
                  ]}>
                    {t === 'light' ? '라이트' : t === 'dark' ? '다크' : '자동'}
                  </Text>
                </GlassContainer>
              </Pressable>
            ))}
          </View>
        </GlassCard>

        {/* Notification Settings */}
        <GlassCard style={styles.section} pressable={false}>
          <View style={styles.sectionHeader}>
            <Ionicons name="notifications" size={24} color={theme.colors.accent} />
            <Text style={styles.sectionTitle}>알림 설정</Text>
          </View>
          
          <View style={styles.settingsList}>
            <GlassToggle
              value={notifications.enabled}
              onValueChange={(value) => updateNotifications({ enabled: value })}
              label="알림 활성화"
            />
            <View style={styles.settingDivider} />
            <GlassToggle
              value={notifications.sound}
              onValueChange={(value) => updateNotifications({ sound: value })}
              label="소리"
              disabled={!notifications.enabled}
            />
            <View style={styles.settingDivider} />
            <GlassToggle
              value={notifications.vibration}
              onValueChange={(value) => updateNotifications({ vibration: value })}
              label="진동"
              disabled={!notifications.enabled}
            />
          </View>
        </GlassCard>

        {/* App Info */}
        <GlassCard style={styles.section} pressable={false}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle" size={24} color={theme.colors.accent} />
            <Text style={styles.sectionTitle}>앱 정보</Text>
          </View>
          
          <View style={styles.infoList}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>버전</Text>
              <View style={styles.infoBadge}>
                <Text style={styles.infoValue}>1.0.0</Text>
              </View>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>빌드 ID</Text>
              <View style={styles.infoBadge}>
                <Text style={styles.infoValue}>2025.09.08</Text>
              </View>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>상태</Text>
              <View style={[styles.infoBadge, styles.statusBadge]}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>정상</Text>
              </View>
            </View>
          </View>
        </GlassCard>

        {/* About Section */}
        <GlassCard style={[styles.section, styles.aboutSection]} pressable={false}>
          <LinearGradient
            colors={[theme.colors.accent + '20', theme.colors.accent + '10']}
            style={styles.aboutGradient}
          >
            <Ionicons name="paw" size={32} color={theme.colors.accent} />
            <Text style={styles.aboutTitle}>Watchdot</Text>
            <Text style={styles.aboutSubtitle}>Unitree Go2 Air Control</Text>
            <Text style={styles.aboutVersion}>Made with ❤️ by Your Team</Text>
          </LinearGradient>
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
  section: {
    margin: theme.spacing.md,
    padding: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginLeft: theme.spacing.sm,
  },
  robotItem: {
    marginBottom: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  robotItemActive: {
    transform: [{ scale: 1.02 }],
  },
  robotItemPressed: {
    opacity: 0.9,
  },
  robotItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  robotInfo: {
    flex: 1,
  },
  robotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  robotName: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
    marginRight: theme.spacing.sm,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.success + '20',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  activeText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.success,
    marginLeft: theme.spacing.xs,
    fontWeight: theme.typography.fontWeight.medium,
  },
  robotIP: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  deleteButton: {
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  addButton: {
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  addButtonPressed: {
    opacity: 0.8,
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.glass.light,
    borderRadius: theme.borderRadius.md,
    borderStyle: 'dashed' as any,
  },
  addButtonText: {
    marginLeft: theme.spacing.sm,
    color: theme.colors.accent,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
  },
  addRobotForm: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  formButton: {
    flex: 1,
  },
  themeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  themeButton: {
    flex: 1,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  themeButtonActive: {
    transform: [{ scale: 1.05 }],
  },
  themeButtonPressed: {
    opacity: 0.8,
  },
  themeButtonContainer: {
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  themeButtonText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
    fontWeight: theme.typography.fontWeight.medium,
  },
  themeButtonTextActive: {
    color: theme.colors.accent,
  },
  settingsList: {
    gap: theme.spacing.xs,
  },
  settingDivider: {
    height: 1,
    backgroundColor: theme.colors.glass.light,
    marginVertical: theme.spacing.xs,
  },
  infoList: {
    gap: theme.spacing.md,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
  },
  infoBadge: {
    backgroundColor: theme.colors.glass.light,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  infoValue: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.success + '20',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.success,
    marginRight: theme.spacing.xs,
  },
  statusText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.success,
    fontWeight: theme.typography.fontWeight.medium,
  },
  aboutSection: {
    padding: 0,
    overflow: 'hidden',
  },
  aboutGradient: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  aboutTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.sm,
  },
  aboutSubtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  aboutVersion: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.disabled,
    marginTop: theme.spacing.md,
  },
});