/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

export interface JobTrackinfoProgress {
  total: number;
  completed: number;
  failed: number;
  killed: number;
  filesCopied: number;
  bytesCopied: number;
  timeTaken: number;
  unit: string;
};

export interface JobTrackingInfo {
  jobId: string;
  jobType: string;
  progress: JobTrackinfoProgress;
}
