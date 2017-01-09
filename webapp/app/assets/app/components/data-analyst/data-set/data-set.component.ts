import {Router} from '@angular/router';
import {Component, OnInit, ElementRef, ViewChild} from '@angular/core';
import {DataSetService} from '../../../services/data-set.service';
import {DataSet} from '../../../models/data-set';
import {Environment} from '../../../environment';
import {DataCenterService} from '../../../services/data-center.service';
import {DataCenter} from '../../../models/data-center';
import {Persona} from '../../../shared/utils/persona';
import {SearchQueryService} from '../../../services/search-query.service';
import {SearchQuery} from '../../../models/search-query';
import {BreadcrumbService} from '../../../services/breadcrumb.service';
import {DataSetChartData} from './data-set-chart-data';

declare let d3: any;
declare let nv: any;

export enum DataSetTab {
    DATA_SET, UNCLASSIFIED
}

@Component({
    selector: 'data-set',
    templateUrl: 'assets/app/components/data-analyst/data-set/data-set.component.html',
    styleUrls: ['assets/app/components/data-analyst/data-set/data-set.component.css']
})

export class DataSetComponent implements OnInit {
    persona = Persona;

    ALL = 'All';
    DASHBOARD = 'dashboard';
    dataSets: DataSet[] = [];
    dataSetTab = DataSetTab;
    dataSetsMapKeys: string[] = [];
    activeDataSetTab = DataSetTab.DATA_SET;
    dataSetsMap: {[key: string]: DataSet[]} = {'All': []};
    selectedCategory = this.ALL;
    showAutoGenerated = true;
    selectedUnclassifiedCategory = '';
    autoGeneratedCategory = [{'name': 'File Size', 'count': 5},
                            {'name': 'File Type', 'count': 6},
                            {'name': 'Usage', 'count': 3},
                            {'name': 'Age', 'count': 3},
                            {'name': 'Operations', 'count': 4},
                            ];

    dataInflowData: any[] = [];
    usersData: any[] = [];
    usageData: any[] = [];
    data: any[] = [];
    dataInflowConfig: any = {};
    usersConfig: any = {};
    usageConfig: any = {};
    options: any = {};


    @ViewChild('chart1') chart1: ElementRef;

    constructor(private dataSetService: DataSetService, private router: Router, private dataCenterService: DataCenterService,
                private searchQueryService: SearchQueryService, private environment: Environment,
                private breadcrumbService: BreadcrumbService) {
        this.breadcrumbService.crumbMap = [{'url': '/ui/data-analyst/analyst-dashboard', 'name': 'Data Set'}];

        let dataSize = new DataSet();
        dataSize.name = 'Storage Metrics';
        dataSize.dataCenter = 'Storage Metrics';
        dataSize.userName = 'analyzed';
        dataSize.lastModified = new Date().toDateString();
        dataSize['hiveCount'] = 1;
        dataSize['hbaseCount'] = 3;
        dataSize['hdfsCount'] = 8;

        let failedRenewal = new DataSet();
        failedRenewal.name = 'Business Processes';
        failedRenewal.dataCenter = 'Business Processes';
        failedRenewal.userName = 'analyzed';
        failedRenewal.lastModified = new Date().toDateString();
        failedRenewal['hiveCount'] = 1;
        failedRenewal['hbaseCount'] = 3;
        failedRenewal['hdfsCount'] = 8;

        this.dataSetsMap = {'All': [],
            'File Size' : DataSetChartData.getUnclassifiedDataSet('File Size' , ['Tiny', 'Small', 'Medium', 'Large', 'Huge']),
            'File Type': DataSetChartData.getUnclassifiedDataSet('File Type', [ 'PDF', 'TXT', 'CSV', 'XLS', 'Audio', 'Video']),
            'Usage': DataSetChartData.getUnclassifiedDataSet('Usage', [ 'Hot', 'Cold', 'Glacial']),
            'Age': DataSetChartData.getUnclassifiedDataSet('Age', [ 'Today', 'This Week', 'Last Year']),
            'Operations': DataSetChartData.getUnclassifiedDataSet('Operations', [ 'Create', 'Append', 'Overwrite', 'Delete']),
        };
    }

    ngOnInit() {
        // replace this with merge map
        this.dataCenterService.get().subscribe((dataCenters: DataCenter[]) => {
            this.getDataCenterDetails(dataCenters);
        });

        this.createDashboardData();
    }

    createDashboardData() {
        this.dataInflowConfig = {
            chart: {
                type: 'discreteBarChart',
                height: 300,
                width: 300,
                color: ['#EF6162'],
                x: function(d){return d.label;},
                y: function(d){return d.value;},
                duration: 500,
                yAxis: {
                    axisLabel: '#bytes',
                        axisLabelDistance: -10,
                    tickFormat: function(d){
                        return d + 'K';
                    }
                }
            }
        };

        this.usersConfig = {
            chart: {
                type: 'discreteBarChart',
                height: 300,
                width: 300,
                color: ['#1491C1'],
                x: function(d){return d.label;},
                y: function(d){return d.value;},
                duration: 500,
                xAxis: {
                    axisLabel: '%ile users'
                },
                yAxis: {
                    axisLabel: '#of jobs',
                    axisLabelDistance: -10
                }
            }
        };

        this.usageConfig =  {
            chart: {
                type: 'pieChart',
                height: 300,
                width: 300,
                donut: true,
                color: ['#F05660', '#fedc93', '#ddecc5', '#c6ecea', '#94c9dd', '#94c9dd', '#81bfd7', '#efefc8', '#d4a5a7', '#cde5ae'],
                x: function(d){return d.key;},
                y: function(d){return d.y;},
                showLabels: true,
                showLegend: false,
                duration: 500,
            }
        };

        this.options = {
            chart: {
                type: 'scatterChart',
                showLegend: false,
                showXAxis: false,
                showYAxis: false,
                forceY: [0,30],
                forceX: [0,118],
                showLabels: true,
                height: 450,
                color: ['#F05660', '#fedc93', '#ddecc5', '#c6ecea', '#94c9dd', '#94c9dd', '#81bfd7', '#efefc8', '#d4a5a7', '#cde5ae'],
                scatter: {
                    onlyCircles: false
                },
                duration: 350,
                xAxis: {
                    axisLabel: 'X Axis',
                    tickFormat: function(d){
                        return d3.format('.02f')(d);
                    }
                },
                yAxis: {
                    axisLabel: 'Y Axis',
                    tickFormat: function(d){
                        return d3.format('.02f')(d);
                    },
                    axisLabelDistance: -5
                },
                pointRange: [1000, 25000]
            }
        };

        this.dataInflowData = DataSetChartData.getDataInflowData();
        this.usersData = DataSetChartData.getUsersData();
        this.usageData = DataSetChartData.getUsageData();
        this.data = DataSetChartData.getUnclassfiedData();

        // let that = this;
        // nv.utils.windowResize(function() {
        //    debugger;
        //     that.usersConfig.chart.width =  600;
        // });
    }

    getDataCenterDetails(dataCenters: DataCenter[]) {
        let dataCenterNamesToDataCenter = {};
        for (let dataCenter of dataCenters) {
            dataCenterNamesToDataCenter[dataCenter.name] = dataCenter;
        }

        let dataCenterNames = Object.keys(dataCenterNamesToDataCenter);

        let name = dataCenterNames.pop();
        while (name !== undefined) {
            this.getDataCenterDetailsByName(name, dataCenterNamesToDataCenter);
            name = dataCenterNames.pop();
        }
    }

    private getDataCenterDetailsByName(name:string, dataCenterNamesToDataCenter:{}) {
        this.dataCenterService.getDetails(name).subscribe((dataCenterDetail)=> {
           let hosts = {};
           for (let host of dataCenterDetail.hosts) {
               hosts[host.ambariHost] = host.ambariHost;
           }
           let uniqueHosts = Object.keys(hosts);
           for (let host of uniqueHosts) {
               this.dataSetService.getAll(host, name).subscribe(results => {
                   this.dataSets = [...this.dataSets, ...results];

                   for (let dataSet of results) {
                       if (!this.dataSetsMap[dataSet.category]) {
                           this.dataSetsMap[dataSet.category] = [];
                       }
                       if (!this.dataSetsMap[this.ALL]) {
                           this.dataSetsMap[this.ALL] = [];
                       }
                       this.dataSetsMap[dataSet.category].push(dataSet);
                       this.dataSetsMap[this.ALL].push(dataSet);
                       this.getDataCount(dataSet);
                   }
               });
           }
        });
    }

    getDataCount(dataSet: DataSet) {
        let searchQuery = new SearchQuery();
        searchQuery.clusterHost = dataSet.ambariHost;
        searchQuery.dataCenter = dataSet.dataCenter;

        dataSet['hiveCount'] = 0;
        dataSet['hdfsCount'] = 0;
        dataSet['hbaseCount'] = 0;

        if (dataSet.hiveFilters.length > 0) {
            for (let dataFilter of dataSet.hiveFilters) {
                searchQuery.predicates = [dataFilter];
                this.searchQueryService.getData(searchQuery, 'hive').subscribe((result: any[]) => {
                    dataSet['hiveCount'] += result.length;
                });
            }
        }

        if (dataSet.hBaseFilters.length > 0) {
            for (let dataFilter of dataSet.hBaseFilters) {
                searchQuery.predicates = [dataFilter];
                this.searchQueryService.getData(searchQuery, 'hbase').subscribe((result:any[]) => {
                    dataSet['hbaseCount'] += result.length;
                });
            }
        }

        if (dataSet.fileFilters.length > 0) {
            for (let dataFilter of dataSet.fileFilters) {
                searchQuery.predicates = [dataFilter];
                this.searchQueryService.getData(searchQuery, 'hdfs').subscribe((result:any[]) => {
                    dataSet['hdfsCount'] += result.length;
                });
            }
        }

    }

    setSelectedCategory(category: string) {
        this.selectedCategory = category;
        this.selectedUnclassifiedCategory = '';
    }

    getLastModified(millisec: number): string {
        if (millisec) {
            return new Date(millisec).toDateString();
        }
        return '-';
    }

    getDataSetCategorys(): string[] {
        let keys = Object.keys(this.dataSetsMap).sort().filter(value=> value !== this.ALL);
        if (keys.length > 0) {
            keys.unshift(this.ALL);
        }

      keys.splice(keys.indexOf('File Size'), 1);
      keys.splice(keys.indexOf('File Type'), 1);
      keys.splice(keys.indexOf('Usage'), 1);
      keys.splice(keys.indexOf('Age'), 1);
      keys.splice(keys.indexOf('Operations'), 1);

        return keys;
    }

    onAddDataSet() {
        this.router.navigate(['ui/data-analyst/dataset/add']);
    }

    viewDataSet(dataSet: DataSet) {

        this.breadcrumbService.crumbMap.shift();
        this.breadcrumbService.crumbMap.unshift({'url': '/ui/data-analyst/analyst-dashboard', 'name': dataSet.dataCenter});

        let navigationExtras = {
            'queryParams' : {'host': dataSet.ambariHost, 'dataCenter': dataSet.dataCenter}
        };
        this.router.navigate(['ui/data-analyst/dataset/view/' + dataSet.name], navigationExtras);
    }

    doNothing() {
        // nothing here ...
    }
}
