
import {DataSet} from '../../../models/data-set';
export class DataSetChartData {

    private static dataInflowData: any[] = [];
    private static usersData: any[] = [];
    private static usageData: any[] = [];
    private static data: any[] = [];

    public static getUnclassifiedDataSet(classification: string, items: string[]): DataSet[] {
        let dataSets: DataSet[] = [];

        for(let dataSetName of items) {
            let dataSize = new DataSet();
            dataSize.name = dataSetName;
            dataSize.dataCenter = classification;
            dataSize.userName = 'analyzed';
            dataSize.lastModified = new Date().toDateString();
            dataSize['hiveCount'] = (Math.floor(Math.random() * 23) + 10);
            dataSize['hbaseCount'] = (Math.floor(Math.random() * 44) + 10);
            dataSize['hdfsCount'] = (Math.floor(Math.random() * 55) + 10);

            dataSets.push(dataSize);
        }

        return dataSets;
    }

    public static getDataInflowData(): any [] {
        if (DataSetChartData.dataInflowData.length === 0) {
            DataSetChartData.dataInflowData = [
                {
                    key: 'Cumulative Return',
                    values: [
                        {
                            'label' : 'TXT' ,
                            'value' : (Math.floor(Math.random() * 30) + 10)
                        } ,
                        {
                            'label' : 'PDF' ,
                            'value' : (Math.floor(Math.random() * 30) + 10)
                        } ,
                        {
                            'label' : 'ORC' ,
                            'value' : (Math.floor(Math.random() * 30) + 10)
                        } ,
                        {
                            'label' : 'XML' ,
                            'value' : (Math.floor(Math.random() * 30) + 10)
                        },
                        {
                            'label' : 'JSON' ,
                            'value' : (Math.floor(Math.random() * 30) + 10)
                        }
                    ]
                }
            ];
        }
        return DataSetChartData.dataInflowData;
    }

    public static  getUsersData (): any [] {
        if (DataSetChartData.usersData.length === 0) {
            DataSetChartData.usersData = [
                {
                    key: 'Cumulative Return',
                    values: [
                        {
                            'label' : 'MON' ,
                            'value' : (Math.floor(Math.random() * 20) + 10)
                        } ,
                        {
                            'label' : 'TUE' ,
                            'value' : (Math.floor(Math.random() * 20) + 10)
                        } ,
                        {
                            'label' : 'WED' ,
                            'value' : (Math.floor(Math.random() * 20) + 10)
                        } ,
                        {
                            'label' : 'THU' ,
                            'value' : (Math.floor(Math.random() * 20) + 10)
                        } ,
                        {
                            'label' : 'FRI' ,
                            'value' : (Math.floor(Math.random() * 20) + 10)
                        }
                    ]
                }
            ];
        }

        return DataSetChartData.usersData;
    }

    public static getUsageData (): any [] {
        if (DataSetChartData.usageData.length === 0) {
            DataSetChartData.usageData = [
                {
                    key: 'Deleted',
                    y: 5
                },
                {
                    key: 'Created',
                    y: 2
                },
                {
                    key: 'Modified',
                    y: 9
                },
                {
                    key: 'Accessed',
                    y: 7
                }
            ];
        }

        return DataSetChartData.usageData;
    }

    public static getUnclassfiedData (): any [] {
        if (DataSetChartData.data.length === 0) {
            DataSetChartData.data = DataSetChartData.generateDataScatter(9, 1);
        }

        return DataSetChartData.data;
    }

    private static generateDataScatter(groups, points) {
        let data = [];

        for (let i = 0; i < groups; i++) {
            data.push({
                key: 'Group ' + i,
                values: []
            });

            for (let j = 0; j < points; j++) {
                data[i].values.push({
                    x: (Math.floor(Math.random() * 120) + 1)
                    , y: (Math.floor(Math.random() * 25) + 1)
                    , size: Math.random() * 8
                    , shape: 'circle'
                    , label: 'text'
                });
            }
        }
        return[
            {
                'key': 'Group 0',
                'values': [
                    {
                        'x': 42,
                        'y': 14,
                        'size': 164,
                        'shape': 'circle',
                        'label': 'FILE'
                    }
                ]
            },
            {
                'key': 'Group 1',
                'values': [
                    {
                        'x': 31,
                        'y': 19,
                        'size': 120,
                        'shape': 'circle',
                        'label': 'HBASE'
                    }
                ]
            },
            {
                'key': 'Group 2',
                'values': [
                    {
                        'x': 51,
                        'y': 7,
                        'size': 96,
                        'shape': 'circle',
                        'label': 'BMP'
                    }
                ]
            },
            {
                'key': 'Group 3',
                'values': [
                    {
                        'x': 59,
                        'y': 21,
                        'size': 60,
                        'shape': 'circle',
                        'label': 'PDF'
                    }
                ]
            },
            {
                'key': 'Group 4',
                'values': [
                    {
                        'x': 77,
                        'y': 4,
                        'size':  55,
                        'shape': 'circle',
                        'label': 'JPG'
                    }
                ]
            },
            {
                'key': 'Group 5',
                'values': [
                    {
                        'x': 90,
                        'y': 16,
                        'size':  75,
                        'shape': 'circle',
                        'label': 'HIVE'
                    }
                ]
            },
            {
                'key': 'Group 6',
                'values': [
                    {
                        'x': 67,
                        'y': 13,
                        'size':  5,
                        'shape': 'circle',
                        'label': ''
                    }
                ]
            },
            {
                'key': 'Group 7',
                'values': [
                    {
                        'x': 67,
                        'y': 13,
                        'size':  5,
                        'shape': 'circle',
                        'label': ''
                    }
                ]
            },
            {
                'key': 'Group 8',
                'values': [
                    {
                        'x': 64,
                        'y': 6,
                        'size':  5,
                        'shape': 'circle',
                        'label': ''
                    }
                ]
            },
            {
                'key': 'Group 9',
                'values': [
                    {
                        'x': 80,
                        'y': 17,
                        'size':  5,
                        'shape': 'circle',
                        'label': ''
                    }
                ]
            }
        ];
    }
}
