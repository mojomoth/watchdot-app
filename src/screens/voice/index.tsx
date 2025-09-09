import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList,
  ScrollView,
  Pressable
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  interpolate,
  withSpring,
} from 'react-native-reanimated';
import { 
  GlassContainer, 
  GlassButton, 
  GlassCard,
  BackgroundContainer
} from '@/components/atoms';
import { theme } from '@/theme';

interface VoiceCommand {
  id: string;
  text: string;
  command: string;
  timestamp: Date;
  executed: boolean;
}

export function VoiceScreen() {
  const [isRecording, setIsRecording] = useState(false);
  const [commands, setCommands] = useState<VoiceCommand[]>([]);
  const [currentText, setCurrentText] = useState('');
  
  const wave1Animation = useSharedValue(0);
  const wave2Animation = useSharedValue(0);
  const wave3Animation = useSharedValue(0);
  const buttonScale = useSharedValue(1);

  React.useEffect(() => {
    if (isRecording) {
      wave1Animation.value = withRepeat(
        withTiming(1, { duration: 1000 }),
        -1,
        false
      );
      wave2Animation.value = withRepeat(
        withTiming(1, { duration: 1000, delay: 200 }),
        -1,
        false
      );
      wave3Animation.value = withRepeat(
        withTiming(1, { duration: 1000, delay: 400 }),
        -1,
        false
      );
    } else {
      wave1Animation.value = 0;
      wave2Animation.value = 0;
      wave3Animation.value = 0;
    }
  }, [isRecording]);

  const wave1Style = useAnimatedStyle(() => ({
    opacity: interpolate(wave1Animation.value, [0, 1], [0.6, 0]),
    transform: [{ scale: interpolate(wave1Animation.value, [0, 1], [1, 1.8]) }],
  }));

  const wave2Style = useAnimatedStyle(() => ({
    opacity: interpolate(wave2Animation.value, [0, 1], [0.5, 0]),
    transform: [{ scale: interpolate(wave2Animation.value, [0, 1], [1, 1.8]) }],
  }));

  const wave3Style = useAnimatedStyle(() => ({
    opacity: interpolate(wave3Animation.value, [0, 1], [0.4, 0]),
    transform: [{ scale: interpolate(wave3Animation.value, [0, 1], [1, 1.8]) }],
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handleMicPress = () => {
    buttonScale.value = withSpring(0.9, { damping: 15 }, () => {
      buttonScale.value = withSpring(1, { damping: 15 });
    });
    
    setIsRecording(!isRecording);
    if (isRecording) {
      setCurrentText('');
    } else {
      setCurrentText('듣고 있습니다...');
    }
  };

  const handleExamplePress = (text: string) => {
    const newCommand: VoiceCommand = {
      id: Date.now().toString(),
      text,
      command: `실행: ${text}`,
      timestamp: new Date(),
      executed: true,
    };
    setCommands([newCommand, ...commands]);
  };

  const renderCommand = ({ item }: { item: VoiceCommand }) => (
    <GlassCard style={styles.commandItem} pressable={false}>
      <View style={styles.commandHeader}>
        <Text style={styles.commandTime}>
          {item.timestamp.toLocaleTimeString()}
        </Text>
        {item.executed && (
          <View style={styles.executedBadge}>
            <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
            <Text style={styles.executedText}>실행됨</Text>
          </View>
        )}
      </View>
      <Text style={styles.commandText}>{item.text}</Text>
      <Text style={styles.commandAction}>{item.command}</Text>
    </GlassCard>
  );

  return (
    <BackgroundContainer style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Mic Button Section */}
        <View style={styles.micContainer}>
          <View style={styles.micWrapper}>
            {/* Animated Waves */}
            {isRecording && (
              <>
                <Animated.View style={[styles.wave, wave1Style]}>
                  <LinearGradient
                    colors={[theme.colors.accent + '60', theme.colors.accent + '20']}
                    style={styles.waveGradient}
                  />
                </Animated.View>
                <Animated.View style={[styles.wave, wave2Style]}>
                  <LinearGradient
                    colors={[theme.colors.accent + '50', theme.colors.accent + '15']}
                    style={styles.waveGradient}
                  />
                </Animated.View>
                <Animated.View style={[styles.wave, wave3Style]}>
                  <LinearGradient
                    colors={[theme.colors.accent + '40', theme.colors.accent + '10']}
                    style={styles.waveGradient}
                  />
                </Animated.View>
              </>
            )}
            
            {/* Mic Button */}
            <Animated.View style={buttonStyle}>
              <Pressable onPress={handleMicPress}>
                <GlassContainer style={styles.micButton} intensity={35} gradient>
                  <LinearGradient
                    colors={isRecording 
                      ? [theme.colors.error, theme.colors.error + 'CC']
                      : [theme.colors.accent, theme.colors.accent + 'CC']
                    }
                    style={styles.micButtonGradient}
                  >
                    <Ionicons 
                      name={isRecording ? "mic" : "mic-outline"} 
                      size={48} 
                      color="#FFFFFF" 
                    />
                  </LinearGradient>
                </GlassContainer>
              </Pressable>
            </Animated.View>
          </View>
          
          {/* Recording Status */}
          {isRecording && (
            <Animated.View style={styles.recordingStatus}>
              <View style={styles.recordingDot} />
              <Text style={styles.recordingText}>녹음 중...</Text>
            </Animated.View>
          )}
        </View>

        {/* Current Recognition */}
        {currentText !== '' && (
          <GlassCard style={styles.currentCard} pressable={false}>
            <View style={styles.currentHeader}>
              <Ionicons name="volume-high" size={20} color={theme.colors.accent} />
              <Text style={styles.currentLabel}>인식된 음성</Text>
            </View>
            <Text style={styles.currentText}>{currentText}</Text>
            <View style={styles.currentWaveform}>
              {[...Array(20)].map((_, i) => (
                <View 
                  key={i} 
                  style={[
                    styles.waveformBar,
                    { height: Math.random() * 30 + 10 }
                  ]} 
                />
              ))}
            </View>
          </GlassCard>
        )}

        {/* Quick Commands */}
        <GlassCard style={styles.examplesCard} pressable={false}>
          <Text style={styles.sectionTitle}>빠른 명령</Text>
          <View style={styles.examplesList}>
            {[
              { icon: 'play-circle', text: '순찰 시작', color: theme.colors.success },
              { icon: 'walk', text: '따라와', color: theme.colors.accent },
              { icon: 'stop-circle', text: '정지', color: theme.colors.error },
              { icon: 'search', text: '로봇 찾기', color: theme.colors.warning },
            ].map((example) => (
              <Pressable
                key={example.text}
                onPress={() => handleExamplePress(example.text)}
                style={({ pressed }) => [
                  styles.exampleItem,
                  pressed && styles.exampleItemPressed
                ]}
              >
                <LinearGradient
                  colors={[example.color + '20', example.color + '10']}
                  style={styles.exampleGradient}
                >
                  <Ionicons name={example.icon as any} size={20} color={example.color} />
                  <Text style={[styles.exampleText, { color: example.color }]}>
                    {example.text}
                  </Text>
                </LinearGradient>
              </Pressable>
            ))}
          </View>
        </GlassCard>

        {/* Command History */}
        <View style={styles.historySection}>
          <View style={styles.historyHeader}>
            <Text style={styles.sectionTitle}>명령 기록</Text>
            {commands.length > 0 && (
              <Pressable
                onPress={() => setCommands([])}
                style={styles.clearButton}
              >
                <Text style={styles.clearButtonText}>모두 지우기</Text>
              </Pressable>
            )}
          </View>
          
          {commands.length > 0 ? (
            <FlatList
              data={commands}
              keyExtractor={(item) => item.id}
              renderItem={renderCommand}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={styles.listSeparator} />}
            />
          ) : (
            <GlassCard style={styles.emptyCard} pressable={false}>
              <Ionicons name="mic-off-outline" size={48} color={theme.colors.text.disabled} />
              <Text style={styles.emptyText}>음성 명령을 시작하려면</Text>
              <Text style={styles.emptyText}>마이크 버튼을 누르세요</Text>
            </GlassCard>
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
  micContainer: {
    alignItems: 'center',
    marginVertical: theme.spacing.xl,
  },
  micWrapper: {
    position: 'relative',
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wave: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  waveGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 70,
  },
  micButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
  },
  micButtonGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.glass.dark,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.error,
    marginRight: theme.spacing.sm,
  },
  recordingText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  currentCard: {
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.lg,
  },
  currentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  currentLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing.sm,
  },
  currentText: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.medium,
    marginBottom: theme.spacing.md,
  },
  currentWaveform: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 40,
  },
  waveformBar: {
    width: 3,
    backgroundColor: theme.colors.accent + '60',
    borderRadius: 1.5,
  },
  examplesCard: {
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
  examplesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  exampleItem: {
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  exampleItemPressed: {
    opacity: 0.8,
  },
  exampleGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  exampleText: {
    marginLeft: theme.spacing.sm,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
  },
  historySection: {
    marginHorizontal: theme.spacing.md,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  clearButton: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  clearButtonText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  listSeparator: {
    height: theme.spacing.sm,
  },
  commandItem: {
    padding: theme.spacing.md,
  },
  commandHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  commandTime: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
  },
  executedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.success + '10',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  executedText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.success,
    marginLeft: theme.spacing.xs,
    fontWeight: theme.typography.fontWeight.medium,
  },
  commandText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  commandAction: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.accent,
    fontStyle: 'italic',
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
});