import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { rosConnection, topicManager } from '@/services/ros-client';
import { useROSStore } from '@/store';
import { useSettingsStore } from '@/store';

interface ROSContextValue {
  connect: (url?: string, token?: string) => Promise<void>;
  disconnect: () => void;
  isConnected: boolean;
}

const ROSContext = createContext<ROSContextValue | undefined>(undefined);

interface ROSProviderProps {
  children: ReactNode;
}

export function ROSProvider({ children }: ROSProviderProps) {
  const connection = useROSStore(state => state.connection);
  const currentRobot = useSettingsStore(state => state.getCurrentRobot());

  useEffect(() => {
    if (currentRobot && !connection.connected && !connection.connecting) {
      handleConnect();
    }

    return () => {
      handleDisconnect();
    };
  }, [currentRobot?.id]);

  const handleConnect = async (url?: string, token?: string) => {
    try {
      await rosConnection.connect(url, token);
      topicManager.subscribeAll();
    } catch (error) {
      console.error('Failed to connect to ROS:', error);
    }
  };

  const handleDisconnect = () => {
    topicManager.unsubscribeAll();
    rosConnection.disconnect();
  };

  const value: ROSContextValue = {
    connect: handleConnect,
    disconnect: handleDisconnect,
    isConnected: connection.connected
  };

  return (
    <ROSContext.Provider value={value}>
      {children}
    </ROSContext.Provider>
  );
}

export function useROS() {
  const context = useContext(ROSContext);
  if (!context) {
    throw new Error('useROS must be used within ROSProvider');
  }
  return context;
}