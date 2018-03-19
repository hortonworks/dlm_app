/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
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
