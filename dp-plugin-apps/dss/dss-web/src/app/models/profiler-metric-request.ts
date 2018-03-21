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
export type MetricType = 'ProfilerMetric' | 'TopKUsersPerAssetMetric' | 'AssetDistributionBySensitivityTagMetric' |
                          'QueriesAndSensitivityDistributionMetric' | 'SecureAssetAccessUserCountMetric' |
                          'SensitivityDistributionMetric';

export type ContextType = 'COLLECTION';

export class MetricContextDefinition {
  constructor(private collectionId: string){}
}

export class ProfilerMetricDefinition {
  constructor(private k?: number, private startDate?: string, private endDate?: string) {}
}

export class ProfilerMetricContext {
  contextType: ContextType;
  definition: MetricContextDefinition = new MetricContextDefinition('');
}

export class ProfilerMetric {
  metricType: MetricType;
  definition: ProfilerMetricDefinition = new ProfilerMetricDefinition(-1, '', '');

  constructor(metricType: MetricType, definition: ProfilerMetricDefinition) {
    this.metricType = metricType;
    this.definition = definition;
  }
}

export class ProfilerMetricRequest {
  clusterId: number;
  context: ProfilerMetricContext = new ProfilerMetricContext();
  metrics: ProfilerMetric[] = [];
}
