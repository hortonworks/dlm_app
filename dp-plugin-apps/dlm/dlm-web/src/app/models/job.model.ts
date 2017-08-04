/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { JobTrackingInfo } from './job-tracking-info.model';
export interface Job {
  runTime: number;
  nextRun: number;
  duration: number;
  isCompleted: boolean;
  graphData: number[];
  transferred: number;
  previousRuns: Object[];

  id: string;
  policyId: string;
  name: string;
  type: string;
  executionType: string;
  user: string;
  status: string;
  startTime: string;
  endTime: string;
  trackingInfo: JobTrackingInfo;
  message: string;
}
