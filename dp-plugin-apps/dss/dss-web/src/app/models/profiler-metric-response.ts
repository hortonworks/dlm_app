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

export class AccessPerDayItems {
  date: string;
  numberOfAccesses: number;

  constructor(date: string, numberOfAccesses: number) {
    this.date = date;
    this.numberOfAccesses = numberOfAccesses;
  }
}

export class AccessPerDayResponse {
  accessPerDay: AccessPerDayItems[] = [];
  errorMessage: string;

  constructor(accessPerDay: AccessPerDayItems[]) {
    this.accessPerDay = accessPerDay;
  }
}


export class SensitivityDistributionResponse {
  totalAssets: number;
  assetsHavingSensitiveData: number;
  errorMessage: string;

  constructor(totalAssets: number, assetsHavingSensitiveData: number) {
    this.totalAssets = totalAssets;
    this.assetsHavingSensitiveData = assetsHavingSensitiveData;
  }

  static getSensitiveDataPercentage(resp: SensitivityDistributionResponse) {
    return ((resp.assetsHavingSensitiveData / resp.totalAssets) * 100).toFixed(2);
  }

  static getNonSensitiveDataPercentage(resp: SensitivityDistributionResponse) {
    return (SensitivityDistributionResponse.getNonSensitiveDataValue(resp) * 100).toFixed(2);
  }

  static getNonSensitiveDataValue(resp: SensitivityDistributionResponse) {
    return ((resp.totalAssets - resp.assetsHavingSensitiveData) / resp.totalAssets);
  }
}

export class QueriesAndSensitivityDistributionResponse {
  totalQueries: number;
  queriesRunningOnSensitiveData: number;
  errorMessage: string;

  constructor(totalQueries: number, queriesRunningOnSensitiveData: number) {
    this.totalQueries = totalQueries;
    this.queriesRunningOnSensitiveData = queriesRunningOnSensitiveData;
  }

  static getQuiresRunningOnSensitiveDataPercentage(resp: QueriesAndSensitivityDistributionResponse) {
    return ((resp.queriesRunningOnSensitiveData / resp.totalQueries) * 100).toFixed(2);
  }

  static getQuiresRunningOnNonSensitiveDataPercentage(resp: QueriesAndSensitivityDistributionResponse) {
    return (QueriesAndSensitivityDistributionResponse.getQuiresRunningOnNonSensitiveDataValue(resp) * 100).toFixed(2);
  }

  static getQuiresRunningOnNonSensitiveDataValue(resp: QueriesAndSensitivityDistributionResponse) {
    return ((resp.totalQueries - resp.queriesRunningOnSensitiveData) / resp.totalQueries);
  }
}

export class AssetDistributionBySensitivityTagResponse {
  tagToAssetCount: {[p: string]: Number};
  errorMessage: string;

  constructor(tagToAssetCount: { [p: string]: Number }) {
    this.tagToAssetCount = tagToAssetCount;
  }
}

export class SecureAssetAccessUserCountResponse {
  accessCounts: {[key: string]: Number};
  errorMessage: string;

  constructor(accessPerDay: { [p: string]: Number }) {
    this.accessCounts = accessPerDay;
  }
}

export class AssetCountsResultForADay {
  date: string;
  totalAssets: number;
  newAssets: number;

  constructor(date: string, totalAssets: number, newAssets: number) {
    this.date = date;
    this.totalAssets = totalAssets;
    this.newAssets = newAssets;
  }
}

export class AssetsAndCount {
  assetsAndCount: AssetCountsResultForADay[] |  {[p: string]: Number};

  constructor(assetsAndCount: AssetCountsResultForADay[] = []) {
    this.assetsAndCount = assetsAndCount;
  }
}

export class CollectionsAndCount {
  collectionsAndCount: {[p: string]: Number};
}

export class Metric {
  status: boolean;
  metricType: MetricType;
  definition: AssetDistributionBySensitivityTagResponse | AccessPerDayResponse | SensitivityDistributionResponse |
                QueriesAndSensitivityDistributionResponse | SecureAssetAccessUserCountResponse | AssetsAndCount |
                CollectionsAndCount;

  constructor(status: boolean,
              metricType: MetricType,
              definition: AssetDistributionBySensitivityTagResponse | AccessPerDayResponse | SensitivityDistributionResponse |
                  QueriesAndSensitivityDistributionResponse | SecureAssetAccessUserCountResponse | AssetsAndCount |
                  CollectionsAndCount) {
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
    const tagToAssetCount = new AssetDistributionBySensitivityTagResponse({
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
    });
    const accessPerDay = new AccessPerDayResponse([
      new AccessPerDayItems('2017-03-01', 19),
      new AccessPerDayItems('2017-02-28', 34),
      new AccessPerDayItems('2017-02-27', 2),
      new AccessPerDayItems('2017-02-26', 31),
      new AccessPerDayItems('2017-02-25', 7),
      new AccessPerDayItems('2017-02-24', 18),
      new AccessPerDayItems('2017-02-23', 3),
      new AccessPerDayItems('2017-02-22', 44)
    ]);
    const sensitivityDistribution = new SensitivityDistributionResponse(2, 1);
    const queriesAndSensitivityDistribution = new QueriesAndSensitivityDistributionResponse(10, 5);
    const accessCounts =  new SecureAssetAccessUserCountResponse({
      'rohit': 10,
      'gaurav': 2,
      'vimal': 16
    });

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