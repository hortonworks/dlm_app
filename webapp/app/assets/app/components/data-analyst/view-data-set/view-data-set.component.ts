import {Component, OnInit} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {DataSetService} from '../../../services/data-set.service';
import {BackupPolicyService} from '../../../services/backup-policy.service';
import {DataSet} from '../../../models/data-set';
import {SearchQueryService} from '../../../services/search-query.service';
import {SearchQuery} from '../../../models/search-query';
import {DataFilterWrapper} from '../../../models/data-filter-wrapper';
import {DataFilter} from '../../../models/data-filter';
import {Environment} from '../../../environment';
import {SearchParamWrapper} from '../../../shared/data-plane-search/search-param-wrapper';
import {SearchParam} from '../../../shared/data-plane-search/search-param';
import {Persona} from '../../../shared/utils/persona';
import Rx from 'rxjs/Rx';

export enum Tab { HIVE, HBASE, HDFS}

@Component({
    selector: 'view-data-set',
    templateUrl: 'assets/app/components/data-analyst/view-data-set/view-data-set.component.html',
    styleUrls: ['assets/app/components/data-analyst/view-data-set/view-data-set.component.css']
})

export class ViewDataSetComponent implements OnInit {
    persona = Persona;
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

    hiveFilterResults: any[] = [];
    hbaseFilterResults: any[] = [];
    hdfsFilterResults: any[] = [];

    showAutoConfigured= false;


    constructor(private activatedRoute: ActivatedRoute, private dataSetService: DataSetService, private environment: Environment,
        private policyService: BackupPolicyService,
                private searchQueryService: SearchQueryService,  private router: Router) {
        this.hiveSearchParamWrappers = environment.hiveSearchParamWrappers;
        this.hbaseSearchParamWrappers = environment.hbaseSearchParamWrappers;
        this.hdfsSearchParamWrappers = environment.hdfsSearchParamWrappers;
    }

    ngOnInit() {
        this.activatedRoute.params.subscribe(params => {
            this.dataSetName = decodeURIComponent(decodeURIComponent(params['id'].split('?')[0]));
            this.host = this.getParameterByName('host');
            this.dataCenter = this.getParameterByName('dataCenter');

            this.showAutoConfigured = this.dataSetName === 'Storage Metrics' || this.dataSetName === 'Business Processes';

            if (!this.showAutoConfigured) {
                this.dataSetService.getByName(this.dataSetName, this.host, this.dataCenter)
                .subscribe((result:DataSet)=> {
                    this.dataSet = result;
                    this.dataSet['hiveCount'] = 0;
                    this.dataSet['hbaseCount'] = 0;
                    this.dataSet['hdfsCount'] = 0;
                    this.hiveFiltersWrapper = result.hiveFilters.map(filter =>  DataFilterWrapper.createDataFilters(filter));
                    this.hbaseFiltersWrapper = result.hBaseFilters.map(filter => DataFilterWrapper.createDataFilters(filter));
                    this.hdfsFiltersWrapper = result.fileFilters.map(filter => DataFilterWrapper.createDataFilters(filter));

                    this.fetchData(this.hiveFiltersWrapper, 'hive');
                    this.fetchData(this.hbaseFiltersWrapper, 'hbase');
                    this.fetchData(this.hdfsFiltersWrapper, 'hdfs');
                });
            }
        });

    }

    private fetchData(datafiltersWrapper: DataFilterWrapper[], dataSource: string) {
        for (let datafilterWrapper of datafiltersWrapper) {
            let searchQuery = new SearchQuery();
            searchQuery.clusterHost = this.host;
            searchQuery.dataCenter = this.dataCenter;
            searchQuery.predicates = [datafilterWrapper.dataFilter];

            this.searchQueryService.getData(searchQuery, dataSource)
              .flatMap(tableResults => {
                const rxTableResultsWithPolicies =
                  tableResults
                    .map(ctableResult => {
                      return this.policyService.getByResource(ctableResult.name, 'hive')
                        .map(policies => Object.assign({}, ctableResult, {
                          policies
                        }));
                    });
                return Rx.Observable.forkJoin(rxTableResultsWithPolicies);
              })
              .subscribe(tableResults => {
                  datafilterWrapper.data = tableResults;
                  this.dataSet[dataSource+'Count'] += tableResults.length;

                  if (dataSource === 'hive') {
                      this.hiveFilterResults = this.hiveFilterResults.concat(tableResults);
                  }

                  if (dataSource === 'hbase') {
                      this.hbaseFilterResults = this.hbaseFilterResults.concat(tableResults);
                  }

                  if (dataSource === 'hdfs') {
                      this.hdfsFilterResults = this.hdfsFilterResults.concat(tableResults);
                  }
              });
        }
    }

    addFilterAndSearch($event: {'dataFilter': DataFilter[], 'searchParam': SearchParam[]}, dataSource: string) {
        let tFilterWrappers: DataFilterWrapper[] = [];
        let newSearchParams = $event.dataFilter.map(filter =>  DataFilterWrapper.createDataFilters(filter));
        if (dataSource === 'hive') {
            tFilterWrappers = this.hiveFiltersWrapper.slice();
            this.hiveFilterResults = [];
            this.dataSet['hiveCount'] = 0;
        }
        if (dataSource === 'hbase') {
            tFilterWrappers = this.hbaseFiltersWrapper.slice();
            this.hbaseFilterResults = [];
            this.dataSet['hbaseCount'] = 0;
        }
        if (dataSource === 'hdfs') {
            tFilterWrappers = this.hdfsFiltersWrapper.slice();
            this.hdfsFilterResults = [];
            this.dataSet['hdfsCount'] = 0;
        }
        tFilterWrappers = tFilterWrappers.concat(newSearchParams);
        this.fetchData(tFilterWrappers, dataSource);
    }

    getParameterByName(name: string) {
        let url = decodeURIComponent(decodeURIComponent(window.location.href));
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

    doNavigateToDetails(resourceId: string, resourceType: string) {
      this.router.navigate([`/ui/view-data/${this.dataCenter}`], {
            queryParams : {
              host: this.host,
              resourceId: resourceId,
              resourceType: resourceType,
            }
        });
    }

    doNavigateToBackupPolicySetup() {
      this.router.navigate(['/ui/backup-policy'], {
            queryParams : {
              create: '',
              cluster: this.host,
              dataCenter: this.dataCenter,
              resourceId: this.dataSetName,
              resourceType: 'DataSet'
            }
        });
    }

    getLastModified(millisec: number): string {
        if (millisec) {
            return new Date(millisec).toDateString();
        }

        return '-';
    }
}
