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
