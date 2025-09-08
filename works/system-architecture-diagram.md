# System Architecture Diagrams

## 1. Component Architecture

```mermaid
graph TB
    subgraph "Mobile App Layer"
        UI[UI Components<br/>Atomic Design]
        NAV[Navigation<br/>Bottom Tabs]
        
        subgraph "State Management"
            STORE[Zustand Store]
            ROSSTORE[ROS Store]
            WPSTORE[Waypoint Store]
            SETSTORE[Settings Store]
        end
        
        subgraph "Services"
            ROSCLIENT[ROS Client<br/>roslibjs]
            VOICE[Voice Service<br/>STT Engine]
            STORAGE[AsyncStorage]
        end
        
        UI --> NAV
        NAV --> STORE
        STORE --> ROSCLIENT
        VOICE --> STORE
        SETSTORE --> STORAGE
    end
    
    subgraph "Communication Layer"
        WS[WebSocket<br/>:9090]
    end
    
    subgraph "Robot System"
        ROSBRIDGE[rosbridge_server]
        NAV2[Nav2 Stack]
        YOLO[YOLOv8 Detector]
        FOLLOW[Follow Controller]
        SDK[go2_ros2_sdk]
        
        ROSBRIDGE --> NAV2
        ROSBRIDGE --> YOLO
        ROSBRIDGE --> FOLLOW
        NAV2 --> SDK
        FOLLOW --> SDK
    end
    
    subgraph "Hardware"
        MOTORS[Motor Drivers]
        LIDAR[4D LiDAR L1]
        CAMERA[Front Camera]
        IMU[IMU Sensor]
        
        SDK --> MOTORS
        LIDAR --> SDK
        CAMERA --> SDK
        IMU --> SDK
    end
    
    ROSCLIENT -.->|rosbridge protocol| WS
    WS -.-> ROSBRIDGE
    
    style UI fill:#e1f5fe
    style ROSCLIENT fill:#fff3e0
    style ROSBRIDGE fill:#f3e5f5
    style SDK fill:#e8f5e9
```

## 2. Data Flow Architecture

```mermaid
sequenceDiagram
    participant App as Mobile App
    participant WS as WebSocket
    participant ROS as ROS Bridge
    participant Nav2 as Nav2 Stack
    participant Robot as Go2 Robot
    
    App->>WS: Connect (URL, Token)
    WS->>ROS: Establish Connection
    ROS-->>App: Connection Confirmed
    
    loop Real-time Updates
        Robot->>ROS: Sensor Data
        ROS->>WS: Topic Messages
        WS->>App: Update UI
    end
    
    App->>WS: Start Patrol Command
    WS->>ROS: /follow_waypoints Action
    ROS->>Nav2: Execute Navigation
    Nav2->>Robot: Motor Commands
    
    Robot-->>Nav2: Odometry Feedback
    Nav2-->>ROS: Progress Update
    ROS-->>WS: Action Feedback
    WS-->>App: Update Progress
```

## 3. Screen Navigation Flow

```mermaid
graph LR
    subgraph "Bottom Tab Navigator"
        DASH[🏠 Dashboard]
        WAY[📍 Waypoints]
        FOL[👣 Follow]
        VOI[🎙 Voice]
        SET[⚙️ Settings]
    end
    
    DASH --> QUICK[Quick Actions]
    QUICK --> WAY
    QUICK --> FOL
    
    WAY --> MAP[Map View]
    WAY --> LIST[Waypoint List]
    WAY --> CTRL[Patrol Controls]
    
    FOL --> TOGGLE[Follow Toggle]
    FOL --> DIST[Distance Slider]
    FOL --> STATUS[Status Display]
    
    VOI --> MIC[Mic Button]
    VOI --> STT[STT Processing]
    VOI --> CMD[Command Execution]
    
    SET --> ROBOTS[Robot List]
    SET --> PAIR[Pairing Guide]
    SET --> FW[Firmware Update]
    SET --> INFO[App Info]
    
    style DASH fill:#ffebee
    style WAY fill:#e3f2fd
    style FOL fill:#f3e5f5
    style VOI fill:#e8f5e9
    style SET fill:#fff3e0
```

## 4. ROS Topic Architecture

```mermaid
graph TB
    subgraph "Subscribe Topics"
        BAT[/battery_state<br/>Battery Info]
        POS[/amcl_pose<br/>Robot Position]
        CAM[/camera/color/thumbnail<br/>Camera Feed]
        FSTAT[/follow_status<br/>Follow State]
        ODOM[/odom<br/>Odometry]
        SCAN[/scan<br/>LiDAR Data]
    end
    
    subgraph "Publish Topics"
        VEL[/cmd_vel<br/>Movement Commands]
        ESTOP[/emergency_stop<br/>Emergency Stop]
        FDIST[/follow_distance<br/>Follow Settings]
    end
    
    subgraph "Services"
        SFOL[/start_follow<br/>Start Following]
        STFOL[/stop_follow<br/>Stop Following]
        SERVO[/set_servo_state<br/>Servo Control]
        INFO[/get_robot_info<br/>Robot Info]
    end
    
    subgraph "Actions"
        WAYP[/follow_waypoints<br/>Waypoint Navigation]
        NAVP[/navigate_to_pose<br/>Single Pose Navigation]
    end
    
    APP[Mobile App]
    
    BAT --> APP
    POS --> APP
    CAM --> APP
    FSTAT --> APP
    ODOM --> APP
    SCAN --> APP
    
    APP --> VEL
    APP --> ESTOP
    APP --> FDIST
    
    APP -.->|call| SFOL
    APP -.->|call| STFOL
    APP -.->|call| SERVO
    APP -.->|call| INFO
    
    APP ==>|goal| WAYP
    APP ==>|goal| NAVP
    
    style APP fill:#fafafa
```

## 5. State Management Flow

```mermaid
stateDiagram-v2
    [*] --> Disconnected
    
    Disconnected --> Connecting: User initiates connection
    Connecting --> Connected: WebSocket established
    Connecting --> Error: Connection failed
    Error --> Connecting: Retry
    Connected --> Disconnected: Connection lost
    
    state Connected {
        [*] --> Idle
        
        state Idle {
            [*] --> Monitoring
            Monitoring --> Monitoring: Update battery/position
        }
        
        Idle --> Navigating: Start patrol
        Navigating --> Idle: Stop/Complete
        
        Idle --> Following: Start follow
        Following --> Idle: Stop follow
        
        Idle --> VoiceListening: Mic pressed
        VoiceListening --> Processing: Release mic
        Processing --> Idle: Command executed
    }
    
    Connected --> EmergencyStop: E-Stop pressed
    EmergencyStop --> Idle: Reset
```

## 6. Component Hierarchy

```mermaid
graph TD
    APP[App.tsx]
    APP --> PROVIDER[ROSProvider]
    PROVIDER --> NAV[NavigationContainer]
    NAV --> TAB[BottomTabNavigator]
    
    TAB --> DASH[DashboardScreen]
    TAB --> WAY[WaypointsScreen]
    TAB --> FOL[FollowScreen]
    TAB --> VOI[VoiceScreen]
    TAB --> SET[SettingsScreen]
    
    DASH --> CONN[ConnectionIndicator]
    DASH --> BAT[BatteryStatus]
    DASH --> CAM[CameraThumbnail]
    DASH --> QUICK[QuickActionCards]
    
    WAY --> MAP[MapView]
    WAY --> WAYLIST[WaypointList]
    WAY --> PATCTRL[PatrolControls]
    
    FOL --> FOLTOG[FollowToggle]
    FOL --> DISTSLIDE[DistanceSlider]
    FOL --> FOLSTAT[FollowStatus]
    
    VOI --> MICBTN[MicButton]
    VOI --> STTDISP[STTDisplay]
    VOI --> CMDHIST[CommandHistory]
    
    SET --> ROBLIST[RobotList]
    SET --> PAIRGUIDE[PairingGuide]
    SET --> FWUPDATE[FirmwareUpdate]
    SET --> APPINFO[AppInfo]
    
    style APP fill:#ffcdd2
    style PROVIDER fill:#f8bbd0
    style NAV fill:#e1bee7
    style TAB fill:#ce93d8
```

## 7. Voice Command Processing

```mermaid
graph LR
    MIC[Microphone<br/>Input] --> AUDIO[Audio<br/>Capture]
    AUDIO --> STT[STT Engine<br/>Vosk/Whisper]
    STT --> TEXT[Text<br/>Output]
    TEXT --> PARSER[Command<br/>Parser]
    
    PARSER --> CMD1[순찰 시작]
    PARSER --> CMD2[따라와]
    PARSER --> CMD3[정지]
    PARSER --> CMD4[로봇 찾기]
    
    CMD1 --> ACT1[Start Patrol<br/>Action]
    CMD2 --> ACT2[Start Follow<br/>Service]
    CMD3 --> ACT3[Emergency Stop<br/>Topic]
    CMD4 --> ACT4[Find Robot<br/>Service]
    
    ACT1 --> ROS[ROS<br/>Commands]
    ACT2 --> ROS
    ACT3 --> ROS
    ACT4 --> ROS
    
    style MIC fill:#e8f5e9
    style STT fill:#c8e6c9
    style PARSER fill:#a5d6a7
    style ROS fill:#81c784
```

## 8. Deployment Architecture

```mermaid
graph TB
    subgraph "Development"
        DEV[Developer<br/>Machine]
        EXPO[Expo CLI]
        DEV --> EXPO
        EXPO --> SIMULATOR[iOS/Android<br/>Simulator]
        EXPO --> DEVICE[Physical<br/>Device]
    end
    
    subgraph "Build Process"
        CI[CI/CD Pipeline]
        BUILD_IOS[iOS Build<br/>EAS Build]
        BUILD_AND[Android Build<br/>EAS Build]
        CI --> BUILD_IOS
        CI --> BUILD_AND
    end
    
    subgraph "Distribution"
        TESTFLIGHT[TestFlight<br/>Beta Testing]
        PLAYTEST[Play Console<br/>Internal Test]
        APPSTORE[App Store]
        PLAYSTORE[Play Store]
        
        BUILD_IOS --> TESTFLIGHT
        BUILD_AND --> PLAYTEST
        TESTFLIGHT --> APPSTORE
        PLAYTEST --> PLAYSTORE
    end
    
    subgraph "Users"
        IOS_USER[iOS Users]
        AND_USER[Android Users]
        APPSTORE --> IOS_USER
        PLAYSTORE --> AND_USER
    end
    
    style DEV fill:#fff9c4
    style CI fill:#f0f4c3
    style APPSTORE fill:#c5e1a5
    style PLAYSTORE fill:#c5e1a5
```

---

These diagrams provide visual representations of the Watchdot App architecture, showing component relationships, data flows, and system interactions.