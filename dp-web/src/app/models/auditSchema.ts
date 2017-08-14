export class AuditSchema {
  policyId : number;
  eventTime: string;
  requestUser: string;
  accessType: string;
  accessResult: string;
  aclEnforcer: string;
  clientIP: string;	
}

export class PolicySchema {
	id : number;
	name : string;
	isEnabled : boolean;
	isAuditEnabled : boolean;
	groups : string[];
	users : string[];
}