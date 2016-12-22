export class DataSet {
    name: string;
    dataSources: string[];
    objectCount: number;
    lastUpdated: string;
    dataSetCategory: string;

    public static getAll(): DataSet[] {
        let dataSets: DataSet[] = [];

        let dataSet = new DataSet();
        dataSet.name = 'SSN Data';
        dataSet.dataSources = ['HIVE', 'HBASE', 'HDFS'];
        dataSet.objectCount = 1276;
        dataSet.lastUpdated = '12/13/2016';
        dataSet.dataSetCategory = 'My Data Sets';
        dataSets.push(dataSet);
        let dataSet1 = new DataSet();
        dataSet1.name = 'PII Data Set';
        dataSet1.dataSources = ['HIVE', 'HDFS'];
        dataSet1.objectCount = 231;
        dataSet1.lastUpdated = '12/13/2106';
        dataSet1.dataSetCategory = 'My Data Sets';
        dataSets.push(dataSet1);

        let dataSet2 = new DataSet();
        dataSet2.name = 'Ultra Large Objects';
        dataSet2.dataSources = ['HIVE', 'HBASE', 'HDFS'];
        dataSet2.objectCount = 342;
        dataSet2.lastUpdated = '12/13/2106';
        dataSet2.dataSetCategory = 'My Data Sets';
        dataSets.push(dataSet2);

        let dataSet3 = new DataSet();
        dataSet3.name = 'Accessed in last Week';
        dataSet3.dataSources = ['HIVE', 'HBASE', 'HDFS'];
        dataSet3.objectCount = 120;
        dataSet3.lastUpdated = '12/13/2106';
        dataSet3.dataSetCategory = 'My Data Sets';
        dataSets.push(dataSet3);

        let dataSet4 = new DataSet();
        dataSet4.name = 'Not Accessed in last Week';
        dataSet4.dataSources = ['HIVE', 'HBASE', 'HDFS'];
        dataSet4.objectCount = 345;
        dataSet4.lastUpdated = '12/13/2106';
        dataSet4.dataSetCategory = 'My Data Sets';
        dataSets.push(dataSet4);

        let dataSet5 = new DataSet();
        dataSet5.name = 'Last Changed';
        dataSet5.dataSources = ['HIVE', 'HDFS'];
        dataSet5.objectCount = 231;
        dataSet5.lastUpdated = '12/13/2106';
        dataSet5.dataSetCategory = 'Unclassified';
        dataSets.push(dataSet5);

        let dataSet6 = new DataSet();
        dataSet6.name = 'Ownership Changes';
        dataSet6.dataSources = ['HIVE', 'HBASE', 'HDFS'];
        dataSet6.objectCount = 342;
        dataSet6.lastUpdated = '12/13/2106';
        dataSet6.dataSetCategory = 'Unclassified';
        dataSets.push(dataSet6);

        let dataSet7 = new DataSet();
        dataSet7.name = 'Usage';
        dataSet7.dataSources = ['HIVE', 'HBASE', 'HDFS'];
        dataSet7.objectCount = 120;
        dataSet7.lastUpdated = '12/13/2106';
        dataSet7.dataSetCategory = 'Unclassified';
        dataSets.push(dataSet7);

        let dataSet8 = new DataSet();
        dataSet8.name = 'Not Accessed in last Week';
        dataSet8.dataSources = ['HIVE', 'HBASE', 'HDFS'];
        dataSet8.objectCount = 345;
        dataSet8.lastUpdated = '12/13/2106';
        dataSet8.dataSetCategory = 'Shared Data Set';
        dataSets.push(dataSet8);

        let dataSet9 = new DataSet();
        dataSet9.name = 'Not Accessed in last Week';
        dataSet9.dataSources = ['HIVE', 'HBASE', 'HDFS'];
        dataSet9.objectCount = 345;
        dataSet9.lastUpdated = '12/13/2106';
        dataSet9.dataSetCategory = 'Shared Data Set';
        dataSets.push(dataSet9);

        let dataSet10 = new DataSet();
        dataSet10.name = 'Not Accessed in last Week';
        dataSet10.dataSources = ['HIVE', 'HBASE', 'HDFS'];
        dataSet10.objectCount = 345;
        dataSet10.lastUpdated = '12/13/2106';
        dataSet10.dataSetCategory = 'Shared Data Set';
        dataSets.push(dataSet10);

        let dataSet11 = new DataSet();
        dataSet11.name = 'Not Accessed in last Week';
        dataSet11.dataSources = ['HIVE', 'HBASE', 'HDFS'];
        dataSet11.objectCount = 345;
        dataSet11.lastUpdated = '12/13/2106';
        dataSet11.dataSetCategory = 'Shared Data Set';
        dataSets.push(dataSet11);

        return dataSets;
    }
}