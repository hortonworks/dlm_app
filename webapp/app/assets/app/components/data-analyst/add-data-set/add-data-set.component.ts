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
    ambarisInDatacenter: Ambari[] = [];
    hiveSearchParamWrappers: SearchParamWrapper[] = [];
    hbaseSearchParamWrappers: SearchParamWrapper[] = [];
    hdfsSearchParamWrappers: SearchParamWrapper[] = [];
    hiveFiltersWrapper: DataFilterWrapper[] = [];
    hbaseFiltersWrapper: DataFilterWrapper[] = [];
    hdfsFiltersWrapper: DataFilterWrapper[] = [];

    constructor(private dataCenterService: DataCenterService, private ambariService: AmbariService,  private environment: Environment,
                private searchQueryService: SearchQueryService, private dataSetService: DataSetService) {
        this.hiveSearchParamWrappers = environment.hiveSearchParamWrappers;
        this.hbaseSearchParamWrappers = environment.hbaseSearchParamWrappers;
        this.hdfsSearchParamWrappers = environment.hdfsSearchParamWrappers;
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
    }

    getAmbariHostName(ambari: Ambari) {
        return  ambari.host;
    }

    onDataCenterChange(dataCenterName: string) {
        this.ambarisInDatacenter = [];
        for (let ambari of this.ambaris) {
            if (ambari.dataCenter === dataCenterName) {
                this.ambarisInDatacenter.push(ambari);
            }
        }
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
