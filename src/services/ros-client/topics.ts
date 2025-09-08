import ROSLIB from 'roslib';
import { rosConnection } from './connection';
import { useROSStore } from '@/store';
import { 
  BatteryStateMsg, 
  CompressedImage, 
  Odometry,
  LaserScan,
  Twist 
} from '@/types/ros-messages';

export const ROS_TOPICS = {
  BATTERY_STATE: '/battery_state',
  AMCL_POSE: '/amcl_pose',
  CAMERA_THUMBNAIL: '/camera/color/thumbnail',
  FOLLOW_STATUS: '/follow_status',
  ODOM: '/odom',
  SCAN: '/scan',
  CMD_VEL: '/cmd_vel',
  EMERGENCY_STOP: '/emergency_stop',
  FOLLOW_DISTANCE: '/follow_distance'
};

class TopicManager {
  private subscribers: Map<string, ROSLIB.Topic> = new Map();
  private publishers: Map<string, ROSLIB.Topic> = new Map();

  subscribeToBattery(): void {
    const ros = rosConnection.getROSInstance();
    if (!ros) return;

    const topic = new ROSLIB.Topic({
      ros,
      name: ROS_TOPICS.BATTERY_STATE,
      messageType: 'sensor_msgs/BatteryState'
    });

    topic.subscribe((message: any) => {
      const batteryMsg = message as BatteryStateMsg;
      useROSStore.getState().setBattery({
        percentage: batteryMsg.percentage * 100,
        voltage: batteryMsg.voltage,
        current: batteryMsg.current,
        isCharging: batteryMsg.power_supply_status === 1,
        temperature: undefined
      });
    });

    this.subscribers.set(ROS_TOPICS.BATTERY_STATE, topic);
  }

  subscribeToPosition(): void {
    const ros = rosConnection.getROSInstance();
    if (!ros) return;

    const topic = new ROSLIB.Topic({
      ros,
      name: ROS_TOPICS.AMCL_POSE,
      messageType: 'geometry_msgs/PoseWithCovarianceStamped'
    });

    topic.subscribe((message: any) => {
      const pose = message.pose.pose;
      useROSStore.getState().setPosition({
        x: pose.position.x,
        y: pose.position.y,
        z: pose.position.z,
        orientation: pose.orientation
      });
    });

    this.subscribers.set(ROS_TOPICS.AMCL_POSE, topic);
  }

  subscribeToCameraThumbnail(): void {
    const ros = rosConnection.getROSInstance();
    if (!ros) return;

    const topic = new ROSLIB.Topic({
      ros,
      name: ROS_TOPICS.CAMERA_THUMBNAIL,
      messageType: 'sensor_msgs/CompressedImage'
    });

    topic.subscribe((message: any) => {
      const imageMsg = message as CompressedImage;
      const base64Image = `data:image/${imageMsg.format};base64,${imageMsg.data}`;
      useROSStore.getState().setCameraThumbnail(base64Image);
    });

    this.subscribers.set(ROS_TOPICS.CAMERA_THUMBNAIL, topic);
  }

  subscribeToFollowStatus(): void {
    const ros = rosConnection.getROSInstance();
    if (!ros) return;

    const topic = new ROSLIB.Topic({
      ros,
      name: ROS_TOPICS.FOLLOW_STATUS,
      messageType: 'std_msgs/String'
    });

    topic.subscribe((message: any) => {
      try {
        const status = JSON.parse(message.data);
        useROSStore.getState().setFollowStatus(status);
      } catch (error) {
        console.error('Error parsing follow status:', error);
      }
    });

    this.subscribers.set(ROS_TOPICS.FOLLOW_STATUS, topic);
  }

  publishCmdVel(linear: number, angular: number): void {
    const ros = rosConnection.getROSInstance();
    if (!ros) return;

    let topic = this.publishers.get(ROS_TOPICS.CMD_VEL);
    
    if (!topic) {
      topic = new ROSLIB.Topic({
        ros,
        name: ROS_TOPICS.CMD_VEL,
        messageType: 'geometry_msgs/Twist'
      });
      this.publishers.set(ROS_TOPICS.CMD_VEL, topic);
    }

    const twist = new ROSLIB.Message({
      linear: { x: linear, y: 0, z: 0 },
      angular: { x: 0, y: 0, z: angular }
    });

    topic.publish(twist);
  }

  publishEmergencyStop(): void {
    this.publishCmdVel(0, 0);
    
    const ros = rosConnection.getROSInstance();
    if (!ros) return;

    let topic = this.publishers.get(ROS_TOPICS.EMERGENCY_STOP);
    
    if (!topic) {
      topic = new ROSLIB.Topic({
        ros,
        name: ROS_TOPICS.EMERGENCY_STOP,
        messageType: 'std_msgs/Bool'
      });
      this.publishers.set(ROS_TOPICS.EMERGENCY_STOP, topic);
    }

    const message = new ROSLIB.Message({ data: true });
    topic.publish(message);
    
    useROSStore.getState().emergencyStop();
  }

  publishFollowDistance(distance: number): void {
    const ros = rosConnection.getROSInstance();
    if (!ros) return;

    let topic = this.publishers.get(ROS_TOPICS.FOLLOW_DISTANCE);
    
    if (!topic) {
      topic = new ROSLIB.Topic({
        ros,
        name: ROS_TOPICS.FOLLOW_DISTANCE,
        messageType: 'std_msgs/Float32'
      });
      this.publishers.set(ROS_TOPICS.FOLLOW_DISTANCE, topic);
    }

    const message = new ROSLIB.Message({ data: distance });
    topic.publish(message);
  }

  subscribeAll(): void {
    this.subscribeToBattery();
    this.subscribeToPosition();
    this.subscribeToCameraThumbnail();
    this.subscribeToFollowStatus();
  }

  unsubscribeAll(): void {
    this.subscribers.forEach(topic => {
      topic.unsubscribe();
    });
    this.subscribers.clear();
    this.publishers.clear();
  }
}

export const topicManager = new TopicManager();