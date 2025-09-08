export interface ROSMessage {
  op: string;
  id?: string;
  topic?: string;
  type?: string;
  msg?: any;
}

export interface Twist {
  linear: {
    x: number;
    y: number;
    z: number;
  };
  angular: {
    x: number;
    y: number;
    z: number;
  };
}

export interface Header {
  seq: number;
  stamp: {
    secs: number;
    nsecs: number;
  };
  frame_id: string;
}

export interface PoseWithCovariance {
  pose: {
    position: {
      x: number;
      y: number;
      z: number;
    };
    orientation: {
      x: number;
      y: number;
      z: number;
      w: number;
    };
  };
  covariance: number[];
}

export interface BatteryStateMsg {
  header: Header;
  voltage: number;
  current: number;
  charge: number;
  capacity: number;
  design_capacity: number;
  percentage: number;
  power_supply_status: number;
  power_supply_health: number;
  power_supply_technology: number;
  present: boolean;
  cell_voltage: number[];
  location: string;
  serial_number: string;
}

export interface CompressedImage {
  header: Header;
  format: string;
  data: string;
}

export interface LaserScan {
  header: Header;
  angle_min: number;
  angle_max: number;
  angle_increment: number;
  time_increment: number;
  scan_time: number;
  range_min: number;
  range_max: number;
  ranges: number[];
  intensities: number[];
}

export interface Odometry {
  header: Header;
  child_frame_id: string;
  pose: PoseWithCovariance;
  twist: {
    twist: Twist;
    covariance: number[];
  };
}

export interface FollowWaypointsAction {
  goal: {
    poses: Array<{
      header: Header;
      pose: {
        position: { x: number; y: number; z: number };
        orientation: { x: number; y: number; z: number; w: number };
      };
    }>;
  };
  feedback?: {
    current_waypoint: number;
  };
  result?: {
    missed_waypoints: number[];
  };
}

export interface ServiceRequest {
  service: string;
  args?: any;
}

export interface ServiceResponse {
  service: string;
  values?: any;
  result?: boolean;
}