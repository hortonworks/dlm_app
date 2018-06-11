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

import { State } from '../reducers';

export const getClusters = (state: State) => state.clusters;
export const getPolicies = (state: State) => state.policies;
export const getPairings = (state: State) => state.pairings;
export const getJobs = (state: State) => state.jobs;
export const getForms = (state: State) => state.forms;
export const getEvents = (state: State) => state.events;
export const getLogs = (state: State) => state.logs;
export const getProgresses = (state: State) => state.progress;
export const getOperations = (state: State) => state.operations;
export const getFilesList = (state: State) => state.hdfsFiles;
export const getDatabasesList = (state: State) => state.hiveDatabases;
export const getBeaconAdminStatuses = (state: State) => state.beaconAdminStatus;
export const getUnreachableBeacons = (state: State) => state.unreachableBeacon;
export const getYarnQueues = (state: State) => state.yarnQueues;
export const getCloudAccounts = (state: State) => state.cloudAccounts;
export const getCloudContainers = (state: State) => state.cloudContainers;
export const getCloudContainerItems = (state: State) => state.cloudContainerItems;
export const getBeaconCloudCreds = (state: State) => state.beaconCloudCreds;
export const getCreatePolicyWizardState = (state: State) => state.createPolicyWizard;
export const getBeaconConfigStatuses = (state: State) => state.beaconConfigStatuses;
export const getAmbariInfo = (state: State)  => state.ambariInfo;
