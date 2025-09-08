import { create } from 'zustand';
import { 
  BatteryState, 
  ConnectionStatus, 
  FollowStatus, 
  Position 
} from '@/types';

interface ROSState {
  connection: ConnectionStatus;
  battery: BatteryState;
  position: Position | null;
  followStatus: FollowStatus;
  cameraThumbnail: string | null;
  
  setConnection: (status: Partial<ConnectionStatus>) => void;
  setBattery: (battery: BatteryState) => void;
  setPosition: (position: Position) => void;
  setFollowStatus: (status: Partial<FollowStatus>) => void;
  setCameraThumbnail: (thumbnail: string | null) => void;
  emergencyStop: () => void;
  reset: () => void;
}

const initialConnection: ConnectionStatus = {
  connected: false,
  connecting: false,
  error: undefined,
  latency: undefined,
  lastHeartbeat: undefined
};

const initialBattery: BatteryState = {
  percentage: 0,
  voltage: 0,
  current: 0,
  isCharging: false,
  temperature: undefined
};

const initialFollowStatus: FollowStatus = {
  active: false,
  mode: 'vision',
  state: 'idle',
  distance: 2.0,
  lastSeen: undefined,
  errorMessage: undefined
};

export const useROSStore = create<ROSState>((set, get) => ({
  connection: initialConnection,
  battery: initialBattery,
  position: null,
  followStatus: initialFollowStatus,
  cameraThumbnail: null,
  
  setConnection: (status) => set((state) => ({
    connection: { ...state.connection, ...status }
  })),
  
  setBattery: (battery) => set({ battery }),
  
  setPosition: (position) => set({ position }),
  
  setFollowStatus: (status) => set((state) => ({
    followStatus: { ...state.followStatus, ...status }
  })),
  
  setCameraThumbnail: (thumbnail) => set({ cameraThumbnail: thumbnail }),
  
  emergencyStop: () => {
    console.log('Emergency stop triggered');
  },
  
  reset: () => set({
    connection: initialConnection,
    battery: initialBattery,
    position: null,
    followStatus: initialFollowStatus,
    cameraThumbnail: null
  })
}));