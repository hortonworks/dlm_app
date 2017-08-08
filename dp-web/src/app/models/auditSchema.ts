export class AuditSchema {
  policyId : number;
  eventTime: string;
  requestUser: string;
  accessType: string;
  accessResult: string;
  aclEnforcer: string;
  clientIP: string;	
}
