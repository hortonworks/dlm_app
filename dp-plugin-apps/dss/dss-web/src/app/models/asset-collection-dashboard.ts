class AssetCollectionProfilerSummary {
  status: boolean;
  noOfTables: number;
  noOfProfiledTables: number;
  noOfSensitiveTables: number;
  noOfUnsecuredAssets: number;
  noOfNewTagsAdded: number;
}

class AssetCollectionStatValues {
  key: string;
  value: number;
}

class AssetCollectionStats {
  status: boolean;
  stats: AssetCollectionStatValues[] = [];
}

export class AssetCollectionDashboard {
  summary: AssetCollectionProfilerSummary = new AssetCollectionProfilerSummary();
  topUsers: AssetCollectionStats = new AssetCollectionStats();
  assetDistribution: AssetCollectionStats = new AssetCollectionStats();
  sensitiveAndNonSensitive: AssetCollectionStats = new AssetCollectionStats();
  quiresRunningSensitiveData: AssetCollectionStats = new AssetCollectionStats();
  usersAccessingSecureData: AssetCollectionStats = new AssetCollectionStats();

  public static getData(): AssetCollectionDashboard {
    const assetCollectionDashboard = new AssetCollectionDashboard();
    assetCollectionDashboard.summary.noOfTables = 100;
    assetCollectionDashboard.summary.noOfProfiledTables = 20;
    assetCollectionDashboard.summary.noOfSensitiveTables = 10;
    assetCollectionDashboard.summary.noOfUnsecuredAssets = 45;
    assetCollectionDashboard.summary.noOfNewTagsAdded = 5;

    assetCollectionDashboard.topUsers.stats = [
      {key: "User A", value: 25.307646510375},
      {key: "User B", value: 16.756779544553},
      {key: "User C", value: 18.451534877007},
      {key: "User D", value: 8.6142352811805},
      {key: "User E", value: 7.8082472075876},
      {key: "User F", value: 5.259101026956},
      {key: "User G", value: 0.30947953487127},
      {key: "User H", value: 0},
      {key: "User I", value: 0}
    ];

    assetCollectionDashboard.assetDistribution.stats = [
      {key: "NPI", value: 25.307646510375},
      {key: "CC", value: 16.756779544553},
      {key: "SS", value: 18.451534877007},
      {key: "Beneficiary", value: 8.6142352811805},
      {key: "Phone Number", value: 7.8082472075876},
      {key: "Address", value: 5.259101026956},
      {key: "SSN", value: 0.30947953487127},
      {key: "Pin Code", value: 0},
      {key: "Record", value: 0}
    ];

    assetCollectionDashboard.sensitiveAndNonSensitive.stats = [
      {key: "Sensitive", value: 30},
      {key: "Non Sensitive", value: 70}
    ];

    assetCollectionDashboard.quiresRunningSensitiveData.stats = [
      {key: "Sensitive", value: 30},
      {key: "Non Sensitive", value: 70}
    ];

    assetCollectionDashboard.usersAccessingSecureData.stats = [
      {key: '1523817000000', value: Math.random() * 100},
      {key: '1523903400000', value: Math.random() * 100},
      {key: '1523989800000', value: Math.random() * 100},
      {key: '1524076200000', value: Math.random() * 100},
      {key: '1524162600000', value: Math.random() * 100},
      {key: '1524249000000', value: Math.random() * 100},
      {key: '1524335400000', value: Math.random() * 100}
    ];

    return assetCollectionDashboard;
  }
}