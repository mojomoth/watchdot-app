import { create } from 'zustand';
import { Waypoint, NavigationStatus } from '@/types';

interface WaypointState {
  waypoints: Waypoint[];
  currentWaypoint: number | null;
  navigationStatus: NavigationStatus;
  
  addWaypoint: (waypoint: Omit<Waypoint, 'id' | 'index'>) => void;
  removeWaypoint: (id: string) => void;
  updateWaypoint: (id: string, updates: Partial<Waypoint>) => void;
  reorderWaypoints: (from: number, to: number) => void;
  clearWaypoints: () => void;
  
  setCurrentWaypoint: (index: number | null) => void;
  setNavigationStatus: (status: Partial<NavigationStatus>) => void;
  startNavigation: () => void;
  pauseNavigation: () => void;
  stopNavigation: () => void;
}

const initialNavigationStatus: NavigationStatus = {
  state: 'idle',
  currentWaypoint: undefined,
  totalWaypoints: undefined,
  progress: undefined,
  estimatedTime: undefined,
  errorMessage: undefined
};

export const useWaypointStore = create<WaypointState>((set, get) => ({
  waypoints: [],
  currentWaypoint: null,
  navigationStatus: initialNavigationStatus,
  
  addWaypoint: (waypoint) => set((state) => {
    const newWaypoint: Waypoint = {
      ...waypoint,
      id: `wp_${Date.now()}`,
      index: state.waypoints.length
    };
    return { waypoints: [...state.waypoints, newWaypoint] };
  }),
  
  removeWaypoint: (id) => set((state) => {
    const waypoints = state.waypoints
      .filter(wp => wp.id !== id)
      .map((wp, index) => ({ ...wp, index }));
    return { waypoints };
  }),
  
  updateWaypoint: (id, updates) => set((state) => ({
    waypoints: state.waypoints.map(wp => 
      wp.id === id ? { ...wp, ...updates } : wp
    )
  })),
  
  reorderWaypoints: (from, to) => set((state) => {
    const waypoints = [...state.waypoints];
    const [removed] = waypoints.splice(from, 1);
    waypoints.splice(to, 0, removed);
    return { 
      waypoints: waypoints.map((wp, index) => ({ ...wp, index }))
    };
  }),
  
  clearWaypoints: () => set({ 
    waypoints: [],
    currentWaypoint: null,
    navigationStatus: initialNavigationStatus
  }),
  
  setCurrentWaypoint: (index) => set({ currentWaypoint: index }),
  
  setNavigationStatus: (status) => set((state) => ({
    navigationStatus: { ...state.navigationStatus, ...status }
  })),
  
  startNavigation: () => {
    const waypoints = get().waypoints;
    if (waypoints.length === 0) return;
    
    set({
      navigationStatus: {
        state: 'navigating',
        currentWaypoint: 0,
        totalWaypoints: waypoints.length,
        progress: 0,
        estimatedTime: undefined,
        errorMessage: undefined
      },
      currentWaypoint: 0
    });
  },
  
  pauseNavigation: () => set((state) => ({
    navigationStatus: { ...state.navigationStatus, state: 'paused' }
  })),
  
  stopNavigation: () => set({
    currentWaypoint: null,
    navigationStatus: initialNavigationStatus
  })
}));