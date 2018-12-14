/*
 * HORTONWORKS DATAPLANE SERVICE AND ITS CONSTITUENT SERVICES
 *
 * (c) 2016-2018 Hortonworks, Inc. All rights reserved.
 *
 * This code is provided to you pursuant to your written agreement with Hortonworks, which may be the terms
 * of the Affero General Public License version 3 (AGPLv3), or pursuant to a written agreement with a third party
 * authorized to distribute this code.  If you do not have a written agreement with Hortonworks or with
 * an authorized and properly licensed third party, you do not have any rights to this code.
 *
 * If this code is provided to you under the terms of the AGPLv3: A) HORTONWORKS PROVIDES THIS CODE TO YOU
 * WITHOUT WARRANTIES OF ANY KIND; (B) HORTONWORKS DISCLAIMS ANY AND ALL EXPRESS AND IMPLIED WARRANTIES WITH
 * RESPECT TO THIS CODE, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF TITLE, NON-INFRINGEMENT, MERCHANTABILITY
 * AND FITNESS FOR A PARTICULAR PURPOSE; (C) HORTONWORKS IS NOT LIABLE TO YOU, AND WILL NOT DEFEND, INDEMNIFY,
 * OR HOLD YOU HARMLESS FOR ANY CLAIMS ARISING FROM OR RELATED TO THE CODE; AND (D) WITH RESPECT
 * TO YOUR EXERCISE OF ANY RIGHTS GRANTED TO YOU FOR THE CODE, HORTONWORKS IS NOT LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, PUNITIVE OR CONSEQUENTIAL DAMAGES INCLUDING, BUT NOT LIMITED TO,
 * DAMAGES RELATED TO LOST REVENUE, LOST PROFITS, LOSS OF INCOME, LOSS OF BUSINESS ADVANTAGE OR UNAVAILABILITY,
 * OR LOSS OR CORRUPTION OF DATA.
 */

import { CloudContainer } from './cloud-container.model';
import { Policy } from 'models/policy.model';
import { CloudAccountSyncStatus } from 'models/beacon-cloud-cred.model';

export enum AccountStatus {
  Expired = 'EXPIRED',
  Active = 'ACTIVE',
  Unregistered = 'UNREGISTERED' // UI status
}

export enum CloudAccountActions {
  SYNC = 'SYNC'
}

export interface CloudAccount {
  id: string;
  accountDetails: CloudAccountDetails;
  containers?: CloudContainer[];
}

export interface CloudAccountUI extends CloudAccount {
  policies: Policy[];
  status: AccountStatus;
  cloudCred: BeaconCloudCred;
  clusters: CloudAccountSyncStatus[];
}

export interface BeaconCloudCred {
  id: string;
  name: string;
  provider: string;
}

export interface CloudAccountDetails {
  provider: string;
  credentialType: string;
  accountName: string;
  userName: string;
}

export interface AddCloudStoreRequestBodyForS3 {
  id: string;
  accountDetails: AddCloudAccountDetailsForS3;
  accountCredentials: ValidateCredentialsRequestBodyForS3;
}

export interface AddCloudStoreRequestBodyForADLS {
  id: string;
  accountDetails: AddCloudAccountDetailsForADLS;
  accountCredentials: AddCloudAccountCredentialsForADLS;
}

export interface AddCloudAccountCredentialsForADLS {
  credentialType: string;
  clientId: string;
  authTokenEndpoint: string;
  clientSecret: string;
}

export interface AddCloudAccountDetailsForADLS {
  provider: string;
}

export interface AddCloudStoreRequestBodyForWASB {
  id: string;
  accountDetails: AddCloudAccountDetailsForWASB;
  accountCredentials: AddCloudAccountCredentialsForWASB;
}

export interface AddCloudAccountDetailsForWASB {
  provider: string;
  accountName: string;
}

export interface AddCloudAccountCredentialsForWASB {
  credentialType: string;
  accessKey: string;
  protocol?: string;
}

export interface AddCloudStoreRequestBodyForGCS {
  id: string;
  accountDetails: AddCloudAccountDetailsForGCS;
  accountCredentials: AddCloudAccountCredentialsForGCS;
}

export interface AddCloudAccountDetailsForGCS {
  provider: string;
  accountEmail: string;
}

export interface AddCloudAccountCredentialsForGCS {
  credentialType: string;
  accessKeyId: string;
  secretAccessKey: string;
}

export interface AddCloudAccountDetailsForS3 {
  provider: string;
  accountName?: string;
  userName?: string;
}

export interface ValidateCredentialsResponseForS3 {
  provider: string;
  credentialType: string;
  accountName: string;
  userName: string;
  payload: ValidateCredentialsRequestBodyForS3;
}

export interface HttpProgress {
  state: string;
  response: Object;
}

export interface ValidateCredentialsRequestBodyForS3 {
  credentialType: string;
  accessKeyId?: string;
  secretAccessKey?: string;
}

export interface Progress {
  addCloudStore: HttpProgress;
  validateCredentials: HttpProgress;
}

export interface CloudAccountAction {
  label: string;
  type: string;
  disabled?: (account: CloudAccountUI) => boolean;
  disabledMessage: string;
}

export interface CloudAccountStatus {
  name: string;
  status: AccountStatus;
}

export type CloudAccountsStatusResponse = CloudAccountStatus[];
