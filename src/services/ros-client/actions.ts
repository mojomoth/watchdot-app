import ROSLIB from 'roslib';
import { rosConnection } from './connection';
import { useWaypointStore } from '@/store';
import { Waypoint } from '@/types';

export const ROS_ACTIONS = {
  FOLLOW_WAYPOINTS: '/follow_waypoints',
  NAVIGATE_TO_POSE: '/navigate_to_pose'
};

class ActionManager {
  private followWaypointsClient: ROSLIB.ActionClient | null = null;
  private currentGoal: ROSLIB.Goal | null = null;

  initializeFollowWaypoints(): void {
    const ros = rosConnection.getROSInstance();
    if (!ros) return;

    this.followWaypointsClient = new ROSLIB.ActionClient({
      ros,
      serverName: ROS_ACTIONS.FOLLOW_WAYPOINTS,
      actionName: 'nav2_msgs/FollowWaypoints'
    });
  }

  startWaypointNavigation(waypoints: Waypoint[]): void {
    if (!this.followWaypointsClient) {
      this.initializeFollowWaypoints();
    }

    if (!this.followWaypointsClient) {
      console.error('Failed to initialize follow waypoints client');
      return;
    }

    const poses = waypoints.map(wp => ({
      header: {
        seq: 0,
        stamp: { secs: 0, nsecs: 0 },
        frame_id: 'map'
      },
      pose: {
        position: {
          x: wp.position.x,
          y: wp.position.y,
          z: wp.position.z || 0
        },
        orientation: wp.position.orientation || {
          x: 0,
          y: 0,
          z: 0,
          w: 1
        }
      }
    }));

    const goal = new ROSLIB.Goal({
      actionClient: this.followWaypointsClient,
      goalMessage: { poses }
    });

    goal.on('feedback', (feedback: any) => {
      const currentWaypoint = feedback.current_waypoint;
      const totalWaypoints = waypoints.length;
      const progress = (currentWaypoint / totalWaypoints) * 100;

      useWaypointStore.getState().setCurrentWaypoint(currentWaypoint);
      useWaypointStore.getState().setNavigationStatus({
        currentWaypoint,
        totalWaypoints,
        progress
      });
    });

    goal.on('result', (result: any) => {
      if (result.missed_waypoints && result.missed_waypoints.length > 0) {
        useWaypointStore.getState().setNavigationStatus({
          state: 'completed',
          errorMessage: `Missed waypoints: ${result.missed_waypoints.join(', ')}`
        });
      } else {
        useWaypointStore.getState().setNavigationStatus({
          state: 'completed'
        });
      }
      this.currentGoal = null;
    });

    goal.on('status', (status: any) => {
      console.log('Goal status:', status);
    });

    goal.send();
    this.currentGoal = goal;

    useWaypointStore.getState().setNavigationStatus({
      state: 'navigating',
      currentWaypoint: 0,
      totalWaypoints: waypoints.length,
      progress: 0
    });
  }

  cancelNavigation(): void {
    if (this.currentGoal) {
      this.currentGoal.cancel();
      this.currentGoal = null;
      useWaypointStore.getState().stopNavigation();
    }
  }

  navigateToPose(x: number, y: number, orientation?: any): void {
    const ros = rosConnection.getROSInstance();
    if (!ros) return;

    const actionClient = new ROSLIB.ActionClient({
      ros,
      serverName: ROS_ACTIONS.NAVIGATE_TO_POSE,
      actionName: 'nav2_msgs/NavigateToPose'
    });

    const goal = new ROSLIB.Goal({
      actionClient,
      goalMessage: {
        pose: {
          header: {
            seq: 0,
            stamp: { secs: 0, nsecs: 0 },
            frame_id: 'map'
          },
          pose: {
            position: { x, y, z: 0 },
            orientation: orientation || { x: 0, y: 0, z: 0, w: 1 }
          }
        }
      }
    });

    goal.on('result', (result: any) => {
      console.log('Navigation to pose completed:', result);
    });

    goal.send();
  }
}

export const actionManager = new ActionManager();