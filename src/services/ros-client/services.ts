import ROSLIB from 'roslib';
import { rosConnection } from './connection';
import { useROSStore } from '@/store';

export const ROS_SERVICES = {
  START_FOLLOW: '/start_follow',
  STOP_FOLLOW: '/stop_follow',
  SET_SERVO_STATE: '/set_servo_state',
  GET_ROBOT_INFO: '/get_robot_info'
};

class ServiceManager {
  async callStartFollow(): Promise<boolean> {
    const ros = rosConnection.getROSInstance();
    if (!ros) return false;

    return new Promise((resolve, reject) => {
      const service = new ROSLIB.Service({
        ros,
        name: ROS_SERVICES.START_FOLLOW,
        serviceType: 'std_srvs/Trigger'
      });

      const request = new ROSLIB.ServiceRequest({});

      service.callService(request, (response: any) => {
        if (response.success) {
          useROSStore.getState().setFollowStatus({ 
            active: true, 
            state: 'active' 
          });
          resolve(true);
        } else {
          useROSStore.getState().setFollowStatus({ 
            active: false,
            state: 'error',
            errorMessage: response.message 
          });
          resolve(false);
        }
      }, (error: any) => {
        console.error('Error calling start_follow service:', error);
        useROSStore.getState().setFollowStatus({ 
          active: false,
          state: 'error',
          errorMessage: error.message 
        });
        reject(error);
      });
    });
  }

  async callStopFollow(): Promise<boolean> {
    const ros = rosConnection.getROSInstance();
    if (!ros) return false;

    return new Promise((resolve, reject) => {
      const service = new ROSLIB.Service({
        ros,
        name: ROS_SERVICES.STOP_FOLLOW,
        serviceType: 'std_srvs/Trigger'
      });

      const request = new ROSLIB.ServiceRequest({});

      service.callService(request, (response: any) => {
        if (response.success) {
          useROSStore.getState().setFollowStatus({ 
            active: false, 
            state: 'idle' 
          });
          resolve(true);
        } else {
          resolve(false);
        }
      }, (error: any) => {
        console.error('Error calling stop_follow service:', error);
        reject(error);
      });
    });
  }

  async setServoState(enabled: boolean): Promise<boolean> {
    const ros = rosConnection.getROSInstance();
    if (!ros) return false;

    return new Promise((resolve, reject) => {
      const service = new ROSLIB.Service({
        ros,
        name: ROS_SERVICES.SET_SERVO_STATE,
        serviceType: 'std_srvs/SetBool'
      });

      const request = new ROSLIB.ServiceRequest({ data: enabled });

      service.callService(request, (response: any) => {
        resolve(response.success);
      }, (error: any) => {
        console.error('Error calling set_servo_state service:', error);
        reject(error);
      });
    });
  }

  async getRobotInfo(): Promise<any> {
    const ros = rosConnection.getROSInstance();
    if (!ros) return null;

    return new Promise((resolve, reject) => {
      const service = new ROSLIB.Service({
        ros,
        name: ROS_SERVICES.GET_ROBOT_INFO,
        serviceType: 'std_srvs/Trigger'
      });

      const request = new ROSLIB.ServiceRequest({});

      service.callService(request, (response: any) => {
        try {
          const info = JSON.parse(response.message);
          resolve(info);
        } catch (error) {
          resolve(response.message);
        }
      }, (error: any) => {
        console.error('Error calling get_robot_info service:', error);
        reject(error);
      });
    });
  }
}

export const serviceManager = new ServiceManager();