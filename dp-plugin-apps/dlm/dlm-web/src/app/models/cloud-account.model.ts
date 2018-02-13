/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { CloudContainer } from './cloud-container.model';

export interface CloudAccount {
  id: string;
  accountDetails: CloudAccountDetails;
  containers?: CloudContainer[];
}

export interface CloudAccountDetails {
  provider: string;
}

export interface AddCloudStoreRequestBody {
  id: string;
  accountDetails: AddCloudAccountDetails;
  accountCredentials: ValidateCredentialsRequestBody;
}

export interface AddCloudAccountDetails {
  provider: string;
  accountName: string;
  userName: string;
}

export interface ValidateCredentialsResponse {
  provider: string;
  credentialType: string;
  accountName: string;
  userName: string;
  payload: ValidateCredentialsRequestBody;
}

export interface HttpProgress {
  state: string;
  response: Object;
}

export interface ValidateCredentialsRequestBody {
  credentialType: string;
  accessKeyId: string;
  secretAccessKey: string;
}

export interface Progress {
  addCloudStore: HttpProgress;
  validateCredentials: HttpProgress;
}

export interface CloudAccountAction {
  label: string;
  type: string;
}
