export const dssCoreURLS = ['auth/in', 'auth/out'];

export const chartColors = {
  GREEN: '#2DB075',
  BLUE: '#2891C0',
  RED: '#E86164',
  YELLOW: '#E18546',
  GREY: '#666666'
};

export const MetricTypeConst: any = {
  AssetCounts: 'AssetCounts',
  TopKAssets: 'TopKAssets',
  TopKCollections: 'TopKCollections',
  TopKAssetsForCollection: 'TopKAssetsForCollection',
  ProfilerMetric: 'ProfilerMetric',
  TopKUsersPerAssetMetric: 'TopKUsersPerAsset',
  AssetDistributionBySensitivityTagMetric: 'AssetDistributionBySensitivityTag',
  QueriesAndSensitivityDistributionMetric: 'QueriesAndSensitivityDistribution',
  SecureAssetAccessUserCountMetric: 'SecureAssetAccessUserCount',
  SensitivityDistributionMetric: 'SensitivityDistribution',
  ProfilerJobs: 'ProfilerJobs'
};

export const ProfilerName: any = {
  AUDIT: 'audit',
  SENSITIVEINFO: 'sensitiveinfo',
  HIVE_METASTORE_PROFILER: 'hive_metastore_profiler',
  HIVECOLUMN: 'hivecolumn',
  TABLESTATS: 'tablestats'
};

export const ContextTypeConst: any = {
  COLLECTION: 'COLLECTION',
  CLUSTER: 'CLUSTER'
};
