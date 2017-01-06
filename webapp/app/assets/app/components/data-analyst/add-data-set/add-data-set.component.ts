import {Component, OnInit} from '@angular/core';
import {AmbariService} from '../../../services/ambari.service';
import {DataCenterService} from '../../../services/data-center.service';
import {Ambari} from '../../../models/ambari';
import {DataCenter} from '../../../models/data-center';
import {Environment} from '../../../environment';
import {SearchQueryService} from '../../../services/search-query.service';
import {DataSet} from '../../../models/data-set';
import {SearchQuery} from '../../../models/search-query';
import {SearchParamWrapper} from '../../../shared/data-plane-search/search-param-wrapper';
import {Alerts} from '../../../shared/utils/alerts';
import {DataSetService} from '../../../services/data-set.service';
import {DataFilter} from '../../../models/data-filter';
import {DataFilterWrapper} from '../../../models/data-filter-wrapper';
import {SearchParam} from '../../../shared/data-plane-search/search-param';

declare let d3: any;
declare let nv: any;
declare var Datamap:any;

export enum MainTab {
    INFORMATION,
    DATA,
    SUMMARY
}

export enum DataTab {
    HIVE,
    HBASE,
    HDFS
}

@Component({
    selector: 'add-data-set',
    templateUrl: 'assets/app/components/data-analyst/add-data-set/add-data-set.component.html',
    styleUrls: ['assets/app/components/data-analyst/add-data-set/add-data-set.component.css']
})
export class AddDataSetComponent implements OnInit {
    map: any;
    mainTab = MainTab;
    mainActiveTab: MainTab = MainTab.INFORMATION;
    dataTab = DataTab;
    dataActiveTab: DataTab = DataTab.HIVE;
    ambaris: Ambari[]= [];
    dataCenters: DataCenter[] = [];
    dataSet: DataSet = new DataSet();
    hiveSearchParamWrappers: SearchParamWrapper[] = [];
    hbaseSearchParamWrappers: SearchParamWrapper[] = [];
    hdfsSearchParamWrappers: SearchParamWrapper[] = [];
    hiveFiltersWrapper: DataFilterWrapper[] = [];
    hbaseFiltersWrapper: DataFilterWrapper[] = [];
    hdfsFiltersWrapper: DataFilterWrapper[] = [];
    options: any;
    data: any;
    chartType: any;

    constructor(private dataCenterService: DataCenterService, private ambariService: AmbariService,  private environment: Environment,
                private searchQueryService: SearchQueryService, private dataSetService: DataSetService) {
        this.hiveSearchParamWrappers = environment.hiveSearchParamWrappers;
        this.hbaseSearchParamWrappers = environment.hbaseSearchParamWrappers;
        this.hdfsSearchParamWrappers = environment.hdfsSearchParamWrappers;
    }

    sinAndCos() {
        let sin = [],sin2 = [],
            cos = [];

        // Data is represented as an array of {x,y} pairs.
        for (let i = 0; i < 100; i++) {
            sin.push({x: i, y: Math.sin(i/10)});
            sin2.push({x: i, y: i % 10 === 5 ? null : Math.sin(i/10) *0.25 + 0.5});
            cos.push({x: i, y: .5 * Math.cos(i/10+ 2) + Math.random() / 10});
        }

        // Line chart data should be sent as an array of series objects.
        return [
            {
                values: sin,      // values - represents the array of {x,y} data points
                key: 'Sine Wave', // key  - the name of the series.
                color: '#ff7f0e'  // color - optional: choose your own line color.
            },
            {
                values: cos,
                key: 'Cosine Wave',
                color: '#2ca02c'
            },
            {
                values: sin2,
                key: 'Another sine wave',
                color: '#7777ff',
                area: true      // area - set to true if you want this line to turn into a filled area chart.
            }
        ];
    }

    generateDataScatter(groups, points) {
        let data = [],
            shapes = ['circle', 'cross', 'triangle-up', 'triangle-down', 'diamond', 'square'],
            random = d3.random.normal();

        for (let i = 0; i < groups; i++) {
            data.push({
                key: 'Group ' + i,
                values: []
            });

            for (let j = 0; j < points; j++) {
                data[i].values.push({
                    x: random()
                    , y: random()
                    , size: Math.random()
                    , shape: 'circle'
                });
            }
        }
        return data;
    }

    ngOnInit() {
        this.dataCenterService.get().subscribe((dataCenters: DataCenter[]) => {
            this.dataCenters = dataCenters;
        });
        this.ambariService.get().subscribe((ambaris: Ambari[]) => {
            this.ambaris = ambaris;
        });
        // this.hiveFiltersWrapper.push(new DataFilterWrapper(new DataFilter()));
        // this.hbaseFiltersWrapper.push(new DataFilterWrapper(new DataFilter()));
        // this.hdfsFiltersWrapper.push(new DataFilterWrapper(new DataFilter()));
        this.options = {
            chart: {
                type: 'scatterChart',
                height: 450,
                color: d3.scale.category10().range(),
                scatter: {
                    onlyCircles: false
                },
                showDistX: true,
                showDistY: true,
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
                pointRange: [1000, 5000]
            }
        };

        // this.data = this.sinAndCos();
        this.data = this.generateDataScatter(1, 20);
    }


    getAmbariHostName(ambari: Ambari) {
        return  ambari.host;
    }

    onDataCenterChange(dataCenterName: string) {
        const ambarisOfDC = this.ambaris.filter(cAmbari => cAmbari.dataCenter === dataCenterName);

        this.dataSet.ambariHost = ambarisOfDC[0].host;
    }

    addFilterAndSearch($event: {'dataFilter': DataFilter[], 'searchParam': SearchParam[]}, dataSource: string) {
        let dataFilterWrapper = this.createFilter($event.dataFilter[0], dataSource);
        dataFilterWrapper.searchParams = $event.searchParam;
        dataFilterWrapper.progress = true;

        let searchQuery = new SearchQuery();
        searchQuery.dataCenter = this.dataSet.dataCenter;
        searchQuery.clusterHost = this.dataSet.ambariHost;
        searchQuery.predicates = $event.dataFilter;
        this.searchQueryService.getData(searchQuery, dataSource).subscribe(result => {
            dataFilterWrapper.data = result;
            dataFilterWrapper.progress = false;
        },
        error => {
            dataFilterWrapper.progress = false;
        });
    }

    getColumnNames(table: any[]) {
        return table['columns'].map(column => column.name);
    }

    createFilter(dataFilter: DataFilter, type: string) {
        let dataFilterWrapper = new DataFilterWrapper(dataFilter);

        if (type === 'hive') {
            this.hiveFiltersWrapper.unshift(dataFilterWrapper);
        }
        if (type === 'hbase') {
            this.hbaseFiltersWrapper.unshift(dataFilterWrapper);
        }
        if (type === 'hdfs') {
            this.hdfsFiltersWrapper.unshift(dataFilterWrapper);
        }

        return dataFilterWrapper;
    }

    getFiltersWrapperSummary (dataFilterWrappers: DataFilterWrapper[]) {
        let returnStr = '';
        for (let dataFilterWrapper of dataFilterWrappers) {
            returnStr += returnStr.length === 0 ? '' : ' && ';
            returnStr += returnStr.length === 0 ? '' : '<br>';
            let query = '';
            for(let searchParam of dataFilterWrapper.searchParams) {
                query += query.length === 0 ? '' : ' || ';
                query += searchParam.key + searchParam.operator + searchParam.value;
            }
            returnStr += query;
        }

        return returnStr;
    }

    onSave() {
        this.dataSet.hiveFilters = DataFilterWrapper.getDataFilters(this.hiveFiltersWrapper);
        this.dataSet.hBaseFilters = DataFilterWrapper.getDataFilters(this.hbaseFiltersWrapper);
        this.dataSet.fileFilters = DataFilterWrapper.getDataFilters(this.hdfsFiltersWrapper);
        this.dataSet.permissions =  (this.dataSet.permissions && this.dataSet.permissions.length === 0) ? 'Random Permissions': this.dataSet.permissions;
        this.dataSet.description =  (this.dataSet.description && this.dataSet.description.length === 0) ? 'Random Permissions': this.dataSet.permissions;
        this.dataSetService.post(this.dataSet).subscribe(result => {
            Alerts.showSuccessMessage('Created data set '+ this.dataSet.name);
            window.history.back();
        });

    }

    back() {
        window.history.back();
    }
}
