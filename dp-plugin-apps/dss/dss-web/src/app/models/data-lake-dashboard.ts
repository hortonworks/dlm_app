class DataLakeProfilerSummary {
  status: boolean;
  noOfTables: number;
  noOfProfiledTables: number;
  noOfSensitiveTables: number;
}

class DataLakeStatValues {
  key: string;
  value: number;
}

class DataLakeStats {
  status: boolean;
  stats: DataLakeStatValues[] = [];
}

export class DataLakeDashboard {
  summary: DataLakeProfilerSummary = new DataLakeProfilerSummary();
  assetCountHistogram: DataLakeStats = new DataLakeStats();
  profiledNonProfiled: DataLakeStats = new DataLakeStats();
  sensitiveNonSensitive: DataLakeStats = new DataLakeStats();
  profilerJobs: DataLakeStats = new DataLakeStats();
  secureData: DataLakeStats = new DataLakeStats();
  topAssetCollections: DataLakeStats = new DataLakeStats();
  topAssets: DataLakeStats = new DataLakeStats();

  public static getData(): DataLakeDashboard {
    const dataLakeDashboard = new DataLakeDashboard();
    dataLakeDashboard.summary.noOfTables = 100;
    dataLakeDashboard.summary.noOfProfiledTables = 50;
    dataLakeDashboard.summary.noOfSensitiveTables = 25;

    dataLakeDashboard.assetCountHistogram.stats = [
      {key: 'Mon', value: 15},
      {key: 'Tue', value: 20},
      {key: 'Wed', value: 40},
      {key: 'Thu', value: 80},
      {key: 'Fri', value: 100},
    ];

    dataLakeDashboard.profiledNonProfiled.stats = [
      {key: 'Profiled', value: 45},
      {key: 'Non Profiled', value: 55},
    ];

    dataLakeDashboard.sensitiveNonSensitive.stats = [
      {key: 'Profiled', value: 45},
      {key: 'Non Profiled', value: 55},
    ];

    dataLakeDashboard.profilerJobs.stats = [
      {key: 'Completed', value: 67},
      {key: 'In Progress', value: 32},
      {key: 'Failed', value: 12}
    ];

    dataLakeDashboard.secureData.stats = [
      {key: 'Secured', value: 45},
      {key: 'Un Secured', value: 55},
    ];

    dataLakeDashboard.topAssetCollections.stats = [
      {key: 'temp 2017', value: 87},
      {key: 'insurance 17', value: 76},
      {key: 'insurance 16', value: 56},
      {key: 'bank 17', value: 45},
      {key: 'clickstream', value: 32},
      {key: 'insurance 20', value: 31},
      {key: 'customer 27', value: 28},
      {key: 'bank 2017', value: 15},
      {key: 'finserve 7', value: 10},
      {key: 'marketing 71', value: 5}
    ];

    dataLakeDashboard.topAssets.stats = [
      {key: 'temp 2017', value: 87},
      {key: 'insurance 17', value: 76},
      {key: 'insurance 16', value: 56},
      {key: 'bank 17', value: 45},
      {key: 'clickstream', value: 32},
      {key: 'insurance 20', value: 31},
      {key: 'customer 27', value: 28},
      {key: 'bank 2017', value: 15},
      {key: 'finserve 7', value: 10},
      {key: 'marketing 71', value: 5}
    ];

    return dataLakeDashboard;
  }
}