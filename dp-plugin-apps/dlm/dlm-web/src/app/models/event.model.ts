export interface Event {
  policyId: string;
  instanceId?: string;
  event: string;
  eventType: string;
  policyReplType: string;
  timestamp: string;
  message: string;
  severity: string;
}
