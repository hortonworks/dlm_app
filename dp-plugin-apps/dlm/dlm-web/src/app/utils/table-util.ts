/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { JobTrackingInfo } from 'models/job-tracking-info.model';
import { getTime } from 'utils/date-util';

const getBytes = (ti: JobTrackingInfo) => ti && ti.progress && ti.progress.bytesCopied || 0;

export const transferredBytesComparator = (trackingInfoA = <JobTrackingInfo>{}, trackingInfoB = <JobTrackingInfo>{}) => {
  return getBytes(trackingInfoA) - getBytes(trackingInfoB);
};

export const timestampComparator = (timeA: string, timeB: string) => {
  return getTime(timeA) - getTime(timeB);
};
