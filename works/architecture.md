## 앱 메뉴 구성

```
┌───────────────────────┐
│   Root (ROSProvider)  │   ← rosbridge 연결·토큰 관리
└─────────┬─────────────┘
          ▼
┌──────────────────────────────────────────┐
│ Bottom-Tab Navigator                     │
│  ├─ [🏠 대시보드]  — 연결·배터리·카메라 미리보기 │
│  ├─ [📍 웨이포인트] — 지도 & 순찰 제어              │
│  ├─ [👣 따라오기]  — Follow 토글                   │
│  ├─ [🎙 음성 명령] — STT 버튼                     │
│  └─ [⚙️ 설정]      — Wi-Fi·토큰·OTA               │
└──────────────────────────────────────────┘

```

## 구현 아키텍처

```
┌──────────────┐   STT  (Google / Vosk / Whisper)
│  Expo 앱     │───▶ “순찰 시작”     ┌── 로컬 파서 ──┐
│  (ReactNative)│                    │텍스트→ROS Cmd │
└─────┬────────┘                    └──────┬─────────┘
      │WebSocket (rosbridge 9090)         │
      ▼                                    ▼
┌──────────────┐      /follow_waypoints   /start_follow
│  Go2 AIR     │<─── Action / Service ──> ROS2 Nav2 스택
└──────────────┘

```

## 앱 주요 기능

| 키워드     | 2-초 설명(사용자 관점)                  |
| ---------- | --------------------------------------- |
| **연결**   | 1분 Wi-Fi/BLE 페어링 & 상태 표시        |
| **순찰**   | 웨이포인트 지정·자동 장애물 회피 주행   |
| **추종**   | Follow Me 토글·거리 조절 슬라이더       |
| **음성**   | “순찰 시작” 한마디로 즉시 실행          |
| **모니터** | 라이브 영상·배터리·지도 상 실시간 위치  |
| **알림**   | 이상 감지·지점 도착 Push & 히스토리     |
| **안전**   | 긴급 정지(E-Stop)·토크 OFF·OTA 업데이트 |

## 모바일 앱 연동 흐름

| 방식                                       | 개념                                                                                                                                                                                                                                                                     | 구현 난이도                         | 특징                                                                                                           |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| **① 내장 “Accompany(사이드-팔로우)” 모드** | 전용 **Companion 리모컨**을 허리에 차면 로봇이 리모컨의 전파를 추적해 옆에서 따라옵니다. 리모컨 _M_ 버튼을 두 번 눌러 느린 팔로우(1.5 m/s), 다시 두 번 눌러 빠른 팔로우(3.0 m/s)로 전환합니다.                                                                           | 아주 쉬움 (설정 없이 리모컨만 착용) | • 장애물 회피 자동<br>• 스마트폰 앱과 동시에 제어 불가                                                         |
| **② 카메라 + AI 비전 기반 커스텀 팔로우**  | 로봇 전면 RGB 카메라 스트림을 **YOLOv8/ByteTrack + 칼만필터**로 사람을 검출·추적 → 중심 좌표를 기반으로 `/cmd_vel` 명령을 계산해 Nav2 Local Planner에 넘깁니다. `go2_ros2_sdk` 예제가 바로 이 데이터를 “사람·동물 실시간 추종”에 쓰도록 안내하고 있습니다. ([GitHub][1]) | 중간 (ROS 2 노드 1-2개 작성)        | • 리모컨 없이 **비전 만으로** 추종<br>• 앱·웹에서 Follow ON/OFF 가능<br>• 실내·실외 모두 동작 (조명·가림 주의) |

[1]: https://github.com/abizovnuralem/go2_ros2_sdk "GitHub - abizovnuralem/go2_ros2_sdk: Unofficial ROS2 SDK support for Unitree GO2 AIR/PRO/EDU"

```
[Expo 앱]
  Mic/STT → 음성 “따라와”          버튼 “Follow 시작”
           │                            │ REST or WebSocket
           ▼                            ▼
  ┌──────────────────────┐  /start_follow Service (자체 정의)
  │ Follow Control Node  │  ───────────────────────────────▶ Nav2
  │  • YOLOv8 추적       │
  │  • PID 제어          │  /cmd_vel           /costmap
  └─────────▲───────────┘         ┌─────────────┐
            │ /detected_objects   │ Go2 AIR +   │
            └────────────────────▶│ Nav2 Stack  │
                                  └─────────────┘

```

## Flowchart

```
flowchart LR
  %% ────────────────────── 모바일 앱 (React Native / Expo)
  subgraph Client ["📱 Mobile App (React Native / Expo)"]
    A1[UI<br/>Buttons & Tabs]
    A2[STT Engine<br/>(Vosk · Whisper)]
    A3[roslibjs<br/>WebSocket Client]
    A1 -->|touch / voice| A3
    A2 -->|parsed command| A3
  end

  %% ────────────────────── 온보드 PC / Jetson (ROS 2)
  subgraph Edge ["🖥️ On-board PC / Jetson (ROS 2)"]
    B1[rosbridge_server<br/>(WS :9090)]
    B2[YOLOv8 Detector]
    B3[Follow Controller<br/>(PID → /cmd_vel)]
    B4[Nav2 Stack<br/>Planner · Controller · BT]
    B5[SLAM Toolbox<br/>/ Map Server]
    B6[go2_ros2_sdk<br/>Sensors · /cmd_vel]
    B7[rosbag2 / Event Logger]
    %% data flow 내부
    B2 --> B3
    B3 -->|/cmd_vel| B4
    B5 --> B4
    B4 -->|vel cmd| B6
    B6 -->|camera · LiDAR · odom| B2 & B5
    B1 <-->|topics / actions| B2 & B3 & B4
    B1 --> B7
  end

  %% ────────────────────── 로봇 하드웨어
  subgraph Robot ["🤖 Unitree Go2 AIR"]
    C1[Motor Drivers]
    C2[IMU]
    C3[4D LiDAR L1]
    C4[Front Camera]
  end

  %% ────────────────────── (선택) 클라우드 / 서버
  subgraph CloudOpt ["☁️ Optional API & DB Server"]
    D1[REST / WebSocket Endpoint]
    D2[PostgreSQL · TimescaleDB]
    D3[Object Storage (영상)]
    B7 -->|HTTPS upload| D1
    D1 --> D2
    D1 --> D3
  end

  %% ──────────────── 외부 연결선
  A3 -- WebSocket --> B1
  B6 -- SDK2 (Ethernet / Wi-Fi) --> C1
  C2 --> B6
  C3 --> B6
  C4 --> B6
  B1 -. WebRTC / MQTT .- D1  %% (원격 제어·모니터링 선택)

  %% ──────────────── 스타일
  style Client fill:#ffffff,stroke:#000
  style Edge   fill:#ffffff,stroke:#000
  style Robot  fill:#ffffff,stroke:#000
  style CloudOpt fill:#ffffff,stroke:#000

```
