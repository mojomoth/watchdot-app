# Watchdot App Design Specification

## 1. System Overview

### 1.1 Purpose
React Native Expo 모바일 앱으로 Unitree Go2 Air 로봇을 제어하고 모니터링하는 순찰 서비스 애플리케이션

### 1.2 Core Technologies
- **Frontend Framework**: React Native with Expo SDK
- **Language**: TypeScript
- **UI Library**: React Native Reusables (https://reactnativereusables.com)
- **Architecture**: Atomic Design Pattern
- **Communication**: WebSocket via roslibjs (rosbridge_server:9090)
- **State Management**: Zustand
- **Navigation**: React Navigation (Bottom Tabs)
- **Package Manager**: Bun

## 2. Architecture Design

### 2.1 System Architecture
```
┌─────────────────────────────────────────┐
│          Mobile App (Expo)              │
│  ┌─────────────────────────────────┐    │
│  │     Presentation Layer          │    │
│  │  (Screens & Components)         │    │
│  └──────────┬──────────────────────┘    │
│             │                            │
│  ┌──────────▼──────────────────────┐    │
│  │     Business Logic Layer        │    │
│  │  (Hooks & Services)             │    │
│  └──────────┬──────────────────────┘    │
│             │                            │
│  ┌──────────▼──────────────────────┐    │
│  │     Data Layer                  │    │
│  │  (Zustand Store & ROS Client)   │    │
│  └──────────┬──────────────────────┘    │
└─────────────┼────────────────────────────┘
              │
              │ WebSocket (rosbridge:9090)
              ▼
┌─────────────────────────────────────────┐
│       Robot System (ROS2)               │
│  ┌─────────────────────────────────┐    │
│  │    rosbridge_server             │    │
│  └──────────┬──────────────────────┘    │
│             │                            │
│  ┌──────────▼──────────────────────┐    │
│  │    ROS2 Nodes                   │    │
│  │  • Nav2 Stack                   │    │
│  │  • SLAM Toolbox                 │    │
│  │  • YOLOv8 Detector              │    │
│  │  • Follow Controller            │    │
│  └──────────┬──────────────────────┘    │
│             │                            │
│  ┌──────────▼──────────────────────┐    │
│  │    go2_ros2_sdk                 │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

### 2.2 Folder Structure
```
watchdot-app/
├── src/
│   ├── components/
│   │   ├── atoms/
│   │   │   ├── button/
│   │   │   ├── icon/
│   │   │   ├── text/
│   │   │   ├── badge/
│   │   │   ├── progress-bar/
│   │   │   ├── toggle/
│   │   │   └── slider/
│   │   ├── molecules/
│   │   │   ├── connection-indicator/
│   │   │   ├── battery-status/
│   │   │   ├── camera-thumbnail/
│   │   │   ├── waypoint-card/
│   │   │   ├── mic-button/
│   │   │   └── quick-action-card/
│   │   ├── organisms/
│   │   │   ├── map-view/
│   │   │   ├── waypoint-list/
│   │   │   ├── follow-control/
│   │   │   ├── voice-command-panel/
│   │   │   └── robot-settings/
│   │   └── templates/
│   │       ├── tab-screen-template/
│   │       └── modal-template/
│   ├── screens/
│   │   ├── dashboard/
│   │   ├── waypoints/
│   │   ├── follow/
│   │   ├── voice/
│   │   └── settings/
│   ├── services/
│   │   ├── ros-client/
│   │   │   ├── connection.ts
│   │   │   ├── topics.ts
│   │   │   ├── services.ts
│   │   │   └── actions.ts
│   │   └── voice-recognition/
│   │       ├── stt-engine.ts
│   │       └── command-parser.ts
│   ├── store/
│   │   ├── ros-store.ts
│   │   ├── waypoint-store.ts
│   │   ├── settings-store.ts
│   │   └── index.ts
│   ├── navigation/
│   │   └── bottom-tab-navigator.tsx
│   ├── hooks/
│   │   ├── use-ros.ts
│   │   ├── use-waypoints.ts
│   │   ├── use-follow.ts
│   │   └── use-voice.ts
│   ├── types/
│   │   ├── ros-messages.ts
│   │   ├── navigation.ts
│   │   └── index.ts
│   ├── utils/
│   │   ├── constants.ts
│   │   └── helpers.ts
│   └── providers/
│       └── ros-provider.tsx
├── assets/
├── app.json
├── App.tsx
├── tsconfig.json
└── package.json
```

## 3. Component Design

### 3.1 Atomic Components Hierarchy

#### Atoms (Basic Building Blocks)
```typescript
// button/index.tsx
interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
}

// icon/index.tsx
interface IconProps {
  name: string;
  size?: number;
  color?: string;
}

// progress-bar/index.tsx
interface ProgressBarProps {
  value: number;
  max?: number;
  color?: string;
  showLabel?: boolean;
}
```

#### Molecules (Composite Components)
```typescript
// connection-indicator/index.tsx
interface ConnectionIndicatorProps {
  status: 'connecting' | 'connected' | 'disconnected' | 'error';
  robotName?: string;
}

// battery-status/index.tsx
interface BatteryStatusProps {
  percentage: number;
  isCharging?: boolean;
  voltage?: number;
}

// waypoint-card/index.tsx
interface WaypointCardProps {
  index: number;
  x: number;
  y: number;
  waitTime?: number;
  onEdit: () => void;
  onDelete: () => void;
  onReorder: (direction: 'up' | 'down') => void;
}
```

#### Organisms (Complex Components)
```typescript
// map-view/index.tsx
interface MapViewProps {
  waypoints: Waypoint[];
  robotPosition?: Position;
  onAddWaypoint: (x: number, y: number) => void;
  mapType: 'indoor' | 'outdoor';
}

// follow-control/index.tsx
interface FollowControlProps {
  isActive: boolean;
  distance: number;
  status: 'active' | 'lost' | 'error';
  onToggle: () => void;
  onDistanceChange: (distance: number) => void;
}
```

## 4. Screen Specifications

### 4.1 Dashboard Screen
```typescript
interface DashboardScreenData {
  connection: {
    status: ConnectionStatus;
    latency: number;
  };
  battery: {
    percentage: number;
    voltage: number;
    current: number;
  };
  camera: {
    thumbnail: string; // base64
    fps: number;
  };
  quickActions: [
    { id: 'patrol', label: '순찰 시작', icon: '📍' },
    { id: 'follow', label: '따라오기', icon: '👣' },
    { id: 'find', label: '로봇 찾기', icon: '🔍' }
  ];
}
```

### 4.2 Waypoints Screen
```typescript
interface WaypointsScreenData {
  map: {
    type: 'indoor' | 'outdoor';
    bounds?: MapBounds;
    image?: string; // For indoor maps
  };
  waypoints: Array<{
    id: string;
    x: number;
    y: number;
    orientation?: number;
    waitTime?: number;
    name?: string;
  }>;
  navigation: {
    status: 'idle' | 'navigating' | 'paused';
    currentWaypoint?: number;
    progress?: number;
  };
}
```

### 4.3 Follow Screen
```typescript
interface FollowScreenData {
  mode: {
    active: boolean;
    type: 'companion' | 'vision';
  };
  settings: {
    distance: number; // meters
    speed: 'slow' | 'normal' | 'fast';
  };
  status: {
    state: 'active' | 'lost' | 'error';
    lastSeen?: Date;
    errorMessage?: string;
  };
}
```

### 4.4 Voice Command Screen
```typescript
interface VoiceCommandScreenData {
  recording: {
    active: boolean;
    duration: number;
    amplitude: number[];
  };
  recognition: {
    text?: string;
    confidence?: number;
    command?: ParsedCommand;
  };
  history: Array<{
    timestamp: Date;
    text: string;
    command: string;
    executed: boolean;
  }>;
}
```

### 4.5 Settings Screen
```typescript
interface SettingsScreenData {
  robots: Array<{
    id: string;
    name: string;
    ip: string;
    token?: string;
    isDefault: boolean;
  }>;
  pairing: {
    mode: 'ap' | 'direct';
    ssid?: string;
    qrCode?: string;
  };
  firmware: {
    current: string;
    available?: string;
    updateProgress?: number;
  };
  app: {
    version: string;
    buildId: string;
    logs: boolean;
  };
}
```

## 5. ROS Integration

### 5.1 WebSocket Connection Management
```typescript
class ROSClient {
  private ros: ROSLIB.Ros;
  private reconnectTimer?: NodeJS.Timeout;
  
  constructor(url: string, token?: string) {
    this.ros = new ROSLIB.Ros({
      url: url,
      groovyCompatibility: false
    });
  }
  
  connect(): Promise<void> {
    // Connection logic with auto-reconnect
  }
  
  disconnect(): void {
    // Cleanup and disconnect
  }
}
```

### 5.2 Topic Subscriptions
```typescript
// Topics to subscribe
const ROS_TOPICS = {
  BATTERY: '/battery_state',
  POSITION: '/amcl_pose',
  CAMERA: '/camera/color/thumbnail',
  FOLLOW_STATUS: '/follow_status',
  ODOM: '/odom',
  SCAN: '/scan'
};

// Topics to publish
const ROS_PUBLISHERS = {
  CMD_VEL: '/cmd_vel',
  EMERGENCY_STOP: '/emergency_stop',
  FOLLOW_DISTANCE: '/follow_distance'
};
```

### 5.3 Service Calls
```typescript
const ROS_SERVICES = {
  START_FOLLOW: '/start_follow',
  STOP_FOLLOW: '/stop_follow',
  SET_SERVO: '/set_servo_state',
  GET_ROBOT_INFO: '/get_robot_info'
};
```

### 5.4 Action Clients
```typescript
const ROS_ACTIONS = {
  FOLLOW_WAYPOINTS: '/follow_waypoints',
  NAVIGATE_TO_POSE: '/navigate_to_pose'
};
```

## 6. State Management (Zustand)

### 6.1 ROS Store
```typescript
interface ROSState {
  // Connection
  connected: boolean;
  connecting: boolean;
  error?: string;
  
  // Robot State
  battery: BatteryState;
  position: Position;
  followStatus: FollowStatus;
  
  // Actions
  connect: (url: string, token?: string) => Promise<void>;
  disconnect: () => void;
  emergencyStop: () => void;
}
```

### 6.2 Waypoint Store
```typescript
interface WaypointState {
  waypoints: Waypoint[];
  currentWaypoint?: number;
  navigationStatus: NavigationStatus;
  
  // Actions
  addWaypoint: (waypoint: Waypoint) => void;
  removeWaypoint: (id: string) => void;
  reorderWaypoints: (from: number, to: number) => void;
  startNavigation: () => void;
  stopNavigation: () => void;
}
```

### 6.3 Settings Store
```typescript
interface SettingsState {
  robots: Robot[];
  currentRobot?: string;
  theme: 'light' | 'dark' | 'auto';
  
  // Actions
  addRobot: (robot: Robot) => void;
  updateRobot: (id: string, updates: Partial<Robot>) => void;
  removeRobot: (id: string) => void;
  selectRobot: (id: string) => void;
}
```

## 7. Navigation Structure

### 7.1 Bottom Tab Navigator
```typescript
const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: { height: 60 },
        tabBarLabelStyle: { fontSize: 12 },
        tabBarActiveTintColor: '#007AFF'
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color }) => <Icon name="home" color={color} />,
          tabBarLabel: '대시보드'
        }}
      />
      <Tab.Screen
        name="Waypoints"
        component={WaypointsScreen}
        options={{
          tabBarIcon: ({ color }) => <Icon name="map-pin" color={color} />,
          tabBarLabel: '웨이포인트'
        }}
      />
      <Tab.Screen
        name="Follow"
        component={FollowScreen}
        options={{
          tabBarIcon: ({ color }) => <Icon name="users" color={color} />,
          tabBarLabel: '따라오기'
        }}
      />
      <Tab.Screen
        name="Voice"
        component={VoiceScreen}
        options={{
          tabBarIcon: ({ color }) => <Icon name="mic" color={color} />,
          tabBarLabel: '음성 명령'
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color }) => <Icon name="settings" color={color} />,
          tabBarLabel: '설정'
        }}
      />
    </Tab.Navigator>
  );
};
```

## 8. Key Dependencies

```json
{
  "dependencies": {
    "expo": "~51.0.0",
    "react": "18.3.1",
    "react-native": "0.76.0",
    "typescript": "~5.6.0",
    "@react-navigation/native": "^6.1.0",
    "@react-navigation/bottom-tabs": "^6.5.0",
    "react-native-screens": "~3.34.0",
    "react-native-safe-area-context": "4.11.0",
    "react-native-gesture-handler": "~2.20.0",
    "react-native-reanimated": "~3.16.0",
    "react-native-maps": "1.18.0",
    "roslib": "^1.3.0",
    "zustand": "^4.5.0",
    "expo-av": "~14.0.0",
    "expo-camera": "~15.0.0",
    "expo-location": "~17.0.0",
    "@react-native-async-storage/async-storage": "1.23.1",
    "react-native-draggable-flatlist": "^4.0.0",
    "react-native-svg": "15.8.0"
  }
}
```

## 9. Implementation Guidelines

### 9.1 Development Phases
1. **Phase 1**: Project setup and basic navigation
2. **Phase 2**: Atomic components implementation
3. **Phase 3**: ROS WebSocket integration
4. **Phase 4**: Core screens (Dashboard, Waypoints)
5. **Phase 5**: Advanced features (Follow, Voice)
6. **Phase 6**: Settings and configuration
7. **Phase 7**: Testing and optimization

### 9.2 Best Practices
- Use TypeScript strict mode for type safety
- Implement error boundaries for robust error handling
- Use React.memo for performance optimization
- Implement proper loading and error states
- Use AsyncStorage for persistent data
- Implement proper WebSocket reconnection logic
- Follow atomic design principles strictly
- Use proper Git commit conventions
- Write unit tests for critical functions
- Document complex logic with comments

### 9.3 Performance Considerations
- Lazy load heavy components
- Use FlatList for long lists
- Optimize image sizes (thumbnails)
- Implement proper memoization
- Use native animations (Reanimated)
- Batch ROS message processing
- Implement proper cleanup in useEffect

### 9.4 Security Considerations
- Store tokens securely in AsyncStorage
- Use HTTPS for external API calls
- Validate all user inputs
- Implement proper authentication flow
- Sanitize ROS messages
- Implement rate limiting for commands
- Use secure WebSocket connections (wss://)

## 10. Testing Strategy

### 10.1 Unit Tests
- Test atomic components isolation
- Test ROS message parsing
- Test store actions and selectors
- Test utility functions

### 10.2 Integration Tests
- Test screen navigation flows
- Test ROS connection handling
- Test state management integration
- Test voice command processing

### 10.3 E2E Tests
- Test complete user workflows
- Test robot control sequences
- Test error recovery scenarios
- Test offline mode handling

## 11. Deployment Considerations

### 11.1 Build Configuration
```bash
# Development
bun expo start

# Production Build (iOS)
bun expo build:ios

# Production Build (Android)
bun expo build:android

# Preview
bun expo publish
```

### 11.2 Environment Variables
```typescript
const ENV = {
  ROSBRIDGE_URL: process.env.EXPO_PUBLIC_ROSBRIDGE_URL || 'ws://192.168.1.100:9090',
  API_URL: process.env.EXPO_PUBLIC_API_URL || 'https://api.watchdot.com',
  MAP_API_KEY: process.env.EXPO_PUBLIC_MAP_API_KEY,
  SENTRY_DSN: process.env.EXPO_PUBLIC_SENTRY_DSN
};
```

### 11.3 Release Checklist
- [ ] Run all tests
- [ ] Update version numbers
- [ ] Generate release notes
- [ ] Build for both platforms
- [ ] Test on real devices
- [ ] Submit to app stores
- [ ] Update documentation
- [ ] Tag release in Git

## 12. Future Enhancements

### 12.1 Planned Features
- Multi-robot support
- Cloud backup for waypoints
- Advanced SLAM visualization
- Real-time video streaming
- Voice feedback (TTS)
- Gesture controls
- AR waypoint placement
- Predictive maintenance alerts

### 12.2 Scalability Considerations
- Implement proper caching strategy
- Use CDN for static assets
- Implement proper pagination
- Use WebRTC for video streaming
- Consider GraphQL for complex queries
- Implement proper monitoring
- Use feature flags for gradual rollout

---

This design specification provides a comprehensive blueprint for implementing the Watchdot App with professional standards and best practices.