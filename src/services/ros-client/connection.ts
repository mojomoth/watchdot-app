import ROSLIB from 'roslib';
import { useROSStore } from '@/store';
import { useSettingsStore } from '@/store';

class ROSConnection {
  private ros: ROSLIB.Ros | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 3000;

  constructor() {
    this.ros = null;
  }

  async connect(url?: string, token?: string): Promise<void> {
    const currentRobot = useSettingsStore.getState().getCurrentRobot();
    
    if (!url && !currentRobot) {
      throw new Error('No robot configuration found');
    }

    const connectionUrl = url || `ws://${currentRobot!.ip}:${currentRobot!.port || 9090}`;
    
    useROSStore.getState().setConnection({ connecting: true, error: undefined });

    return new Promise((resolve, reject) => {
      this.ros = new ROSLIB.Ros({
        url: connectionUrl,
        groovyCompatibility: false
      });

      this.ros.on('connection', () => {
        console.log('Connected to rosbridge server');
        this.reconnectAttempts = 0;
        useROSStore.getState().setConnection({ 
          connected: true, 
          connecting: false,
          error: undefined 
        });
        this.startHeartbeat();
        resolve();
      });

      this.ros.on('error', (error) => {
        console.error('Error connecting to rosbridge server:', error);
        useROSStore.getState().setConnection({ 
          connected: false,
          connecting: false,
          error: error.message || 'Connection error'
        });
        this.attemptReconnect();
        reject(error);
      });

      this.ros.on('close', () => {
        console.log('Connection to rosbridge server closed');
        useROSStore.getState().setConnection({ 
          connected: false,
          connecting: false 
        });
        this.stopHeartbeat();
        this.attemptReconnect();
      });
    });
  }

  disconnect(): void {
    this.stopReconnect();
    this.stopHeartbeat();
    
    if (this.ros) {
      this.ros.close();
      this.ros = null;
    }
    
    useROSStore.getState().setConnection({ 
      connected: false, 
      connecting: false 
    });
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnection attempts reached');
      useROSStore.getState().setConnection({ 
        error: 'Unable to connect to robot' 
      });
      return;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectAttempts++;
    console.log(`Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);

    this.reconnectTimer = setTimeout(() => {
      this.connect().catch(error => {
        console.error('Reconnection failed:', error);
      });
    }, this.reconnectDelay);
  }

  private stopReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.reconnectAttempts = 0;
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    
    this.heartbeatTimer = setInterval(() => {
      if (this.ros && this.ros.isConnected) {
        useROSStore.getState().setConnection({ 
          lastHeartbeat: new Date() 
        });
      }
    }, 5000);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  getROSInstance(): ROSLIB.Ros | null {
    return this.ros;
  }

  isConnected(): boolean {
    return this.ros?.isConnected || false;
  }
}

export const rosConnection = new ROSConnection();