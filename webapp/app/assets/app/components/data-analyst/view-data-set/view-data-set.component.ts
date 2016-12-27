import {Component, OnInit} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {DataSetService} from '../../../services/data-set.service';
import {DataSet} from '../../../models/data-set';
import {SearchQueryService} from '../../../services/search-query.service';
import {SearchQuery} from '../../../models/search-query';
import {DataFilterWrapper} from '../../../models/data-filter-wrapper';
import {Environment} from '../../../environment';
import {SearchParamWrapper} from '../../../shared/data-plane-search/search-param-wrapper';

export enum Tab { HIVE, HBASE, HDFS}

@Component({
    selector: 'view-data-set',
    templateUrl: 'assets/app/components/data-analyst/view-data-set/view-data-set.component.html',
    styleUrls: ['assets/app/components/data-analyst/view-data-set/view-data-set.component.css']
})

export class ViewDataSetComponent implements OnInit {
    tab = Tab;
    dataSetName: string;
    activeTab: Tab = Tab.HIVE;
    dataSet: DataSet = new DataSet();
    hiveTables: any[] = [];
    host: string;
    dataCenter: string;
    hiveFiltersWrapper: DataFilterWrapper[] = [];
    hbaseFiltersWrapper: DataFilterWrapper[] = [];
    hdfsFiltersWrapper: DataFilterWrapper[] = [];
    hiveSearchParamWrappers: SearchParamWrapper[] = [];
    hbaseSearchParamWrappers: SearchParamWrapper[] = [];
    hdfsSearchParamWrappers: SearchParamWrapper[] = [];

    constructor(private activatedRoute: ActivatedRoute, private dataSetService: DataSetService, private environment: Environment,
                private searchQueryService: SearchQueryService,  private router: Router) {
        this.hiveSearchParamWrappers = environment.hiveSearchParamWrappers;
        this.hbaseSearchParamWrappers = environment.hbaseSearchParamWrappers;
        this.hdfsSearchParamWrappers = environment.hdfsSearchParamWrappers;
    }

    ngOnInit() {
        this.activatedRoute.params.subscribe(params => {
            this.dataSetName = params['id'];
            this.host = this.getParameterByName('host');
            this.dataCenter = this.getParameterByName('dataCenter');

            this.dataSetService.getByName(this.dataSetName, this.host, this.dataCenter).subscribe((result:DataSet)=> {
                this.dataSet = result;
                this.hiveFiltersWrapper = result.hiveFilters.map(filter =>  DataFilterWrapper.createDataFilters(filter));
                this.hbaseFiltersWrapper = result.hBaseFilters.map(filter => DataFilterWrapper.createDataFilters(filter));
                this.hdfsFiltersWrapper = result.fileFilters.map(filter => DataFilterWrapper.createDataFilters(filter));

                this.fetchData(this.hiveFiltersWrapper, 'hive');
                this.fetchData(this.hbaseFiltersWrapper, 'hbase');
                this.fetchData(this.hdfsFiltersWrapper, 'hdfs');
            });
        });

    }

    private fetchData(datafiltersWrapper: DataFilterWrapper[], dataSource: string) {
        for (let datafilterWrapper of datafiltersWrapper) {
            let searchQuery = new SearchQuery();
            searchQuery.clusterHost = this.host;
            searchQuery.dataCenter = this.dataCenter;
            searchQuery.predicates = [datafilterWrapper.dataFilter];

            this.searchQueryService.getHiveData(searchQuery, dataSource).subscribe(tableResults => {
                datafilterWrapper.data = tableResults;
            });
        }
    }

    addFilterAndSearch($event, hiveFilterWrapper: DataFilterWrapper, dataSource: string) {
        let searchQuery = new SearchQuery();
        searchQuery.dataCenter = this.dataSet.dataCenter;
        searchQuery.clusterHost = this.dataSet.ambariHost;
        searchQuery.predicates = [...[hiveFilterWrapper.dataFilter], ...$event];
        this.searchQueryService.getHiveData(searchQuery, dataSource).subscribe(result => {
            hiveFilterWrapper.data = result;
        });
    }

    getParameterByName(name: string) {
        let url = window.location.href;
        name = name.replace(/[\[\]]/g, '\\$&');
        let regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, ' '));
    }

    getDataSources() {
        let dataSources: string[] = [];

        if (this.dataSet.hiveFilters.length > 0) {
            dataSources.push('HIVE');
        }
        if (this.dataSet.hBaseFilters.length > 0) {
            dataSources.push('HBASE');
        }
        if (this.dataSet.fileFilters.length > 0) {
            dataSources.push('HDFS');
        }

        return dataSources;
    }

    showData(id: string) {
        let navigationExtras = {
            'queryParams' : {'host': this.host, 'id': id}
        };
        this.router.navigate(['ui/view-data/' + this.dataCenter], navigationExtras);
    }

    setActiveTab($event: any, activeTab: Tab) {
        this.activeTab = activeTab;
        $event.preventDefault();
    }
}