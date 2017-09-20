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

import {Injectable} from '@angular/core';
import {Http, RequestOptions} from '@angular/http';
import {Observable} from 'rxjs/Observable';

import {HttpUtil} from '../shared/utils/httpUtil';
import {AuditSchema, PolicySchema, TagPolicySchema} from '../models/auditSchema';

export class PolicyTypes {
  static HIVE: string = "hive";
  static TAG: string = "tag";
}

@Injectable()
export class RangerService {
  uri = '/api/ranger';
  count:number=0;
  policyCount:number=0;

  constructor(private http: Http) {
  }

  getPolicyDetails(clusterId:string, dbName:string, tableName:string, offset:number, limit:number) : Observable<any>{
    let serviceType = PolicyTypes.HIVE;
    const uri = `${this.uri}/${clusterId}/policies?offset=${offset}&limit=${limit}&serviceType=${serviceType}&dbName=${dbName}&tableName=${tableName}`;
    return this.http
      .get(uri, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .map((data)=> this.formatPolicyData(data))
      .catch(err => {
      	if(err.status == 404) return Observable.throw(err);
      	return HttpUtil.handleError(err)
      });
  }
  formatPolicyData (data:any) : PolicySchema[] {
  	this.policyCount = data.totalCount || 0;
  	let policyData:PolicySchema[] = [];
  	data.policies.forEach(d=> {
  	  d.groups = d.policyItems[0].groups;
  	  d.users = d.policyItems[0].users;
  	  policyData.push(d as PolicySchema)
  	})
  	return policyData;
  }
  getTotalPolicyCount () : number {
  	return this.policyCount;
  }

  getTagPolicyDetails(clusterId:string, guid: string, offset:number, limit:number) : Observable<any>{
    let serviceType = PolicyTypes.TAG;
    const uri = `${this.uri}/${clusterId}/policies?offset=${offset}&limit=${limit}&serviceType=${serviceType}&guid=${guid}`;
    return this.http
      .get(uri, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .map((data)=> this.formatTagPolicyData(data))
      .catch(err => {
        if(err.status == 404) return Observable.throw(err);
        return HttpUtil.handleError(err)
      });
  }
  formatTagPolicyData (data:any) : PolicySchema[] {
    let policyData:TagPolicySchema[] = [];
    data.forEach(d=> {
      d.groups = d.policyItems.length > 0 ? d.policyItems[0].groups: [];
      d.users = d.policyItems.length > 0 ? d.policyItems[0].users: [];
      if(d.resources && d.resources.tag && d.resources.tag.values){
        d.tags = d.resources.tag.values;
      }else{
        d.tags = [];
      }
      policyData.push(d as TagPolicySchema)
    })
    return policyData;
  }

  getAuditDetails(clusterId:string, dbName:string, tableName:string, offset:number, limit:number, accessType:string, result:string) : Observable<any>{
  	result = (result == "ALLOWED") ? "1" : (result == "DENIED") ? "0" : "";
  	accessType = (accessType == "ALL")? "" : accessType;
    const uri = `${this.uri}/audit/${clusterId}/${dbName}/${tableName}?offset=${offset}&limit=${limit}&accessType=${accessType}&accessResult=${result}`;
    return this.http
      .get(uri, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .map((data)=> this.formatAuditData(data))
      .catch(err => {
      	if(err.status == 404) return Observable.throw(err);
      	return HttpUtil.handleError(err)
      });
  }
  formatAuditData (data:any) : AuditSchema[] {
  	this.count = data.totalCount || 0;
  	let auditData:AuditSchema[] = [];
  	data.vXAccessAudits.forEach(d=>{
  	  let m = d.eventTime.match(/^(\d+)-(\d+)-(\d+)T(\d+)\:(\d+)\:(\d+)Z$/);
  	  d.eventTime = `${m[2]}/${m[3]}/${m[1]} ${m[4]}:${m[5]}:${m[6]} GMT`
  	  d.accessResult = (d.accessResult)?"ALLOWED":"DENIED";
      if(d.policyId == -1) d.policyId = "--";
  	  auditData.push(d as AuditSchema)
  	})
  	return auditData;
  }
  getTotalCount () : number {
  	return this.count;
  }
}
