export * from './ros-messages';
export * from './navigation';

export interface Robot {
  id: string;
  name: string;
  ip: string;
  port: number;
  token?: string;
  isDefault: boolean;
}

export interface Position {
  x: number;
  y: number;
  z?: number;
  orientation?: Quaternion;
}

export interface Quaternion {
  x: number;
  y: number;
  z: number;
  w: number;
}

export interface Waypoint {
  id: string;
  index: number;
  position: Position;
  waitTime?: number;
  name?: string;
}

export interface BatteryState {
  percentage: number;
  voltage: number;
  current: number;
  isCharging: boolean;
  temperature?: number;
}

export interface ConnectionStatus {
  connected: boolean;
  connecting: boolean;
  error?: string;
  latency?: number;
  lastHeartbeat?: Date;
}

export interface FollowStatus {
  active: boolean;
  mode: 'companion' | 'vision';
  state: 'active' | 'lost' | 'error' | 'idle';
  distance: number;
  lastSeen?: Date;
  errorMessage?: string;
}

export interface NavigationStatus {
  state: 'idle' | 'navigating' | 'paused' | 'completed' | 'error';
  currentWaypoint?: number;
  totalWaypoints?: number;
  progress?: number;
  estimatedTime?: number;
  errorMessage?: string;
}

export interface VoiceCommand {
  id: string;
  timestamp: Date;
  text: string;
  command?: string;
  confidence?: number;
  executed: boolean;
  result?: string;
}