import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

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

  const handleMicPress = () => {
    setIsRecording(!isRecording);
    if (isRecording) {
      // Stop recording logic
      setCurrentText('');
    } else {
      // Start recording logic
      setCurrentText('듣고 있습니다...');
    }
  };

  const renderCommand = ({ item }: { item: VoiceCommand }) => (
    <View style={styles.commandItem}>
      <View style={styles.commandHeader}>
        <Text style={styles.commandTime}>
          {item.timestamp.toLocaleTimeString()}
        </Text>
        {item.executed && (
          <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
        )}
      </View>
      <Text style={styles.commandText}>{item.text}</Text>
      <Text style={styles.commandAction}>{item.command}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Mic Button */}
        <View style={styles.micContainer}>
          <TouchableOpacity 
            style={[
              styles.micButton,
              isRecording && styles.micButtonActive
            ]}
            onPress={handleMicPress}
            activeOpacity={0.8}
          >
            <Ionicons 
              name={isRecording ? "mic" : "mic-outline"} 
              size={60} 
              color="#FFFFFF" 
            />
          </TouchableOpacity>
          {isRecording && (
            <View style={styles.waveContainer}>
              <View style={[styles.wave, styles.wave1]} />
              <View style={[styles.wave, styles.wave2]} />
              <View style={[styles.wave, styles.wave3]} />
            </View>
          )}
        </View>

        {/* Current Recognition */}
        {currentText !== '' && (
          <View style={styles.currentCard}>
            <Text style={styles.currentText}>{currentText}</Text>
          </View>
        )}

        {/* Command Examples */}
        <View style={styles.examplesCard}>
          <Text style={styles.examplesTitle}>음성 명령 예시</Text>
          <View style={styles.examplesList}>
            <TouchableOpacity style={styles.exampleItem}>
              <Ionicons name="play-circle-outline" size={20} color="#007AFF" />
              <Text style={styles.exampleText}>순찰 시작</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.exampleItem}>
              <Ionicons name="walk-outline" size={20} color="#007AFF" />
              <Text style={styles.exampleText}>따라와</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.exampleItem}>
              <Ionicons name="stop-circle-outline" size={20} color="#007AFF" />
              <Text style={styles.exampleText}>정지</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.exampleItem}>
              <Ionicons name="search-outline" size={20} color="#007AFF" />
              <Text style={styles.exampleText}>로봇 찾기</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Command History */}
        <View style={styles.historyCard}>
          <Text style={styles.historyTitle}>명령 기록</Text>
          <FlatList
            data={commands}
            keyExtractor={(item) => item.id}
            renderItem={renderCommand}
            ListEmptyComponent={
              <Text style={styles.emptyText}>아직 명령 기록이 없습니다</Text>
            }
            style={styles.historyList}
          />
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
  micContainer: {
    alignItems: 'center',
    marginVertical: 32,
    position: 'relative',
  },
  micButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  micButtonActive: {
    backgroundColor: '#FF5252',
  },
  waveContainer: {
    position: 'absolute',
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wave: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#FF5252',
    opacity: 0.3,
  },
  wave1: {
    transform: [{ scale: 1.2 }],
  },
  wave2: {
    transform: [{ scale: 1.4 }],
  },
  wave3: {
    transform: [{ scale: 1.6 }],
  },
  currentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  currentText: {
    fontSize: 18,
    color: '#333',
  },
  examplesCard: {
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
  examplesTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  examplesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  exampleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  exampleText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#333',
  },
  historyCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  historyList: {
    flex: 1,
  },
  commandItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  commandHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  commandTime: {
    fontSize: 12,
    color: '#666',
  },
  commandText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  commandAction: {
    fontSize: 12,
    color: '#007AFF',
    fontStyle: 'italic',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    paddingVertical: 20,
  },
});