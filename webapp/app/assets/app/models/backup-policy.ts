import {DataCenter} from './data-center';
import {Ambari} from './ambari';

export class BackupPolicy {
  label: string;
  source: {
    dataCenterId: string,
    clusterId: string,
    resourceId: string,
    resourceType: string
  };
  target: {
    dataCenterId: string,
    clusterId: string
  };
  status: {
    isEnabled: boolean,
    since?: string
  };
  schedule: {
    scheduleType?: string,
    frequency?: string,
    duration: {
      start: string,
      stop: string
    }
  };
}

export class BackupPolicyInDetail {
  label: string;
  source: {
    dataCenter?: DataCenter,
    cluster?: Ambari,
    resourceId?: string,
    resourceType?: string
  };
  target: {
    dataCenter?: DataCenter,
    cluster?: Ambari,
  };
  status: {
    isEnabled: boolean,
    since?: string
  };
  schedule: {
    scheduleType?: string,
    frequency?: string,
    duration: {
      start: string,
      stop: string
    }
  };
}
