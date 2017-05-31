export interface Event {
  policyId: string;
  instanceId: string;
  event: string;
  timestamp: string;
  eventStatus: string;
  message: string;
  severity: string;
}
