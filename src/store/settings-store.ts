import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Robot } from '@/types';

interface SettingsState {
  robots: Robot[];
  currentRobotId: string | null;
  theme: 'light' | 'dark' | 'auto';
  notifications: {
    enabled: boolean;
    sound: boolean;
    vibration: boolean;
    waypointArrival: boolean;
    lowBattery: boolean;
    connectionLost: boolean;
  };
  voice: {
    language: string;
    confidence: number;
    feedbackEnabled: boolean;
  };
  
  addRobot: (robot: Omit<Robot, 'id'>) => void;
  updateRobot: (id: string, updates: Partial<Robot>) => void;
  removeRobot: (id: string) => void;
  selectRobot: (id: string | null) => void;
  getCurrentRobot: () => Robot | undefined;
  
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
  updateNotifications: (updates: Partial<SettingsState['notifications']>) => void;
  updateVoiceSettings: (updates: Partial<SettingsState['voice']>) => void;
}

const defaultNotifications = {
  enabled: true,
  sound: true,
  vibration: true,
  waypointArrival: true,
  lowBattery: true,
  connectionLost: true
};

const defaultVoice = {
  language: 'ko-KR',
  confidence: 0.8,
  feedbackEnabled: true
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      robots: [],
      currentRobotId: null,
      theme: 'auto',
      notifications: defaultNotifications,
      voice: defaultVoice,
      
      addRobot: (robot) => set((state) => {
        const newRobot: Robot = {
          ...robot,
          id: `robot_${Date.now()}`
        };
        
        const isFirstRobot = state.robots.length === 0;
        
        return {
          robots: [...state.robots, newRobot],
          currentRobotId: isFirstRobot ? newRobot.id : state.currentRobotId
        };
      }),
      
      updateRobot: (id, updates) => set((state) => ({
        robots: state.robots.map(robot => 
          robot.id === id ? { ...robot, ...updates } : robot
        )
      })),
      
      removeRobot: (id) => set((state) => {
        const robots = state.robots.filter(robot => robot.id !== id);
        const currentRobotId = state.currentRobotId === id 
          ? (robots.length > 0 ? robots[0].id : null)
          : state.currentRobotId;
        
        return { robots, currentRobotId };
      }),
      
      selectRobot: (id) => set({ currentRobotId: id }),
      
      getCurrentRobot: () => {
        const state = get();
        return state.robots.find(robot => robot.id === state.currentRobotId);
      },
      
      setTheme: (theme) => set({ theme }),
      
      updateNotifications: (updates) => set((state) => ({
        notifications: { ...state.notifications, ...updates }
      })),
      
      updateVoiceSettings: (updates) => set((state) => ({
        voice: { ...state.voice, ...updates }
      }))
    }),
    {
      name: 'watchdot-settings',
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);