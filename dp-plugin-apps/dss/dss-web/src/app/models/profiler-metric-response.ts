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
import {MetricTypeConst} from '../shared/utils/constants';
import {MetricType} from './profiler-metric-request';

export class AccessPerDayResponse {
  date: string;
  numberOfAccesses: number;

  constructor(date: string, numberOfAccesses: number) {
    this.date = date;
    this.numberOfAccesses = numberOfAccesses;
  }
}

export class SensitivityDistributionResponse {
  totalAssets: number;
  assetsHavingSensitiveData: number;

  constructor(totalAssets: number, assetsHavingSensitiveData: number) {
    this.totalAssets = totalAssets;
    this.assetsHavingSensitiveData = assetsHavingSensitiveData;
  }

  getSensitiveDataPercentage() {
    return ((this.assetsHavingSensitiveData / this.totalAssets) * 100).toFixed(2);
  }

  getNonSensitiveDataPercentage() {
    return (this.getNonSensitiveDataValue() * 100).toFixed(2);
  }

  getNonSensitiveDataValue() {
    return ((this.totalAssets - this.assetsHavingSensitiveData) / this.totalAssets);
  }
}

export class QueriesAndSensitivityDistributionResponse {
  totalQueries: number;
  queriesRunningOnSensitiveData: number;

  constructor(totalQueries: number, queriesRunningOnSensitiveData: number) {
    this.totalQueries = totalQueries;
    this.queriesRunningOnSensitiveData = queriesRunningOnSensitiveData;
  }

  getQuiresRunningOnSensitiveDataPercentage() {
    return ((this.queriesRunningOnSensitiveData / this.totalQueries) * 100).toFixed(2);
  }

  getQuiresRunningOnNonSensitiveDataPercentage() {
    return (this.getQuiresRunningOnNonSensitiveDataValue() * 100).toFixed(2);
  }

  getQuiresRunningOnNonSensitiveDataValue() {
    return ((this.totalQueries - this.queriesRunningOnSensitiveData) / this.totalQueries);
  }
}

export class Metric {
  status: boolean;
  metricType: MetricType;
  definition: {[key: string]: Number} | AccessPerDayResponse[] | SensitivityDistributionResponse | QueriesAndSensitivityDistributionResponse;

  constructor(status: boolean,
              metricType: MetricType,
              definition: {[key: string]: Number} | AccessPerDayResponse[] | SensitivityDistributionResponse | QueriesAndSensitivityDistributionResponse) {
    this.status = status;
    this.metricType = metricType;
    this.definition = definition;
  }
}

export class ProfilerMetricResponse {
  status: boolean;
  metrics: Metric[] = [];

  static getData(): ProfilerMetricResponse {
    const profilerMetricResponse = new ProfilerMetricResponse();
    const tagToAssetCount = {
      'name': 1,
      'email': 1,
      'expirydate': 1,
      'dob': 1,
      'ukpassportnumber': 1,
      'age': 1,
      'driverlicence': 1,
      'npi': 1,
      'creditcard': 1,
      'ssn': 1
    };
    const accessPerDay = [
      new AccessPerDayResponse('2017-03-01', 19),
      new AccessPerDayResponse('2017-02-28', 34),
      new AccessPerDayResponse('2017-02-27', 2),
      new AccessPerDayResponse('2017-02-26', 31),
      new AccessPerDayResponse('2017-02-25', 7),
      new AccessPerDayResponse('2017-02-24', 18),
      new AccessPerDayResponse('2017-02-23', 3),
      new AccessPerDayResponse('2017-02-22', 44)
    ];
    const sensitivityDistribution = new SensitivityDistributionResponse(2, 1);
    const queriesAndSensitivityDistribution = new QueriesAndSensitivityDistributionResponse(10, 5);
    const accessCounts =  {
      'rohit': 10,
      'gaurav': 2,
      'vimal': 16
    };

    profilerMetricResponse.status = true;
    profilerMetricResponse.metrics = [
      new Metric(true, MetricTypeConst.AssetDistributionBySensitivityTagMetric, tagToAssetCount),
      new Metric(true, MetricTypeConst.SecureAssetAccessUserCountMetric, accessPerDay),
      new Metric(true, MetricTypeConst.SensitivityDistributionMetric, sensitivityDistribution),
      new Metric(true, MetricTypeConst.QueriesAndSensitivityDistributionMetric, queriesAndSensitivityDistribution),
      new Metric(true, MetricTypeConst.TopKUsersPerAssetMetric, accessCounts)
    ];

    return profilerMetricResponse;
  }
}