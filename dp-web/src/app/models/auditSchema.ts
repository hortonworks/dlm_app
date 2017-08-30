/*
 *
 *  * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *  *
 *  * Except as expressly permitted in a written agreement between you or your company
 *  * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 *  * reproduction, modification, redistribution, sharing, lending or other exploitation
 *  * of all or any part of the contents of this software is strictly prohibited.
 *
 */

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
