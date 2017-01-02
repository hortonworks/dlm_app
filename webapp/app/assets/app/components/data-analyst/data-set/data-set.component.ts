import {Router} from '@angular/router';
import {Component, OnInit} from '@angular/core';
import {DataSetService} from '../../../services/data-set.service';
import {DataSet} from '../../../models/data-set';
import {Environment} from '../../../environment';
import {DataCenterService} from '../../../services/data-center.service';
import {DataCenter} from '../../../models/data-center';
import {Persona} from '../../../shared/utils/persona';
import {SearchQueryService} from '../../../services/search-query.service';
import {SearchQuery} from '../../../models/search-query';
import {BreadcrumbService} from '../../../services/breadcrumb.service';

@Component({
    selector: 'data-set',
    templateUrl: 'assets/app/components/data-analyst/data-set/data-set.component.html',
    styleUrls: ['assets/app/components/data-analyst/data-set/data-set.component.css']
})
export class DataSetComponent implements OnInit {
    persona = Persona;

    ALL = 'All';
    dataSets: DataSet[] = [];
    dataSetsMapKeys: string[] = [];
    dataSetsMap: {[key: string]: DataSet[]} = {'All': []};
    selectedCategory = this.ALL;

    constructor(private dataSetService: DataSetService, private router: Router, private dataCenterService: DataCenterService,
                private searchQueryService: SearchQueryService, private environment: Environment,
                private breadcrumbService: BreadcrumbService) {
        this.breadcrumbService.crumbMap = [{'url': '/ui/data-analyst/analyst-dashboard', 'name': 'Data Set'}];
    }

    ngOnInit() {
        // replace this with merge map
        this.dataCenterService.get().subscribe((dataCenters: DataCenter[]) => {
            this.getDataCenterDetails(dataCenters);
        });
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

        if (dataSet.hiveFilters.length > 0) {
            searchQuery.predicates = dataSet.hiveFilters;
            this.searchQueryService.getData(searchQuery, 'hive').subscribe((result: any[]) => {
                dataSet['hiveCount'] = result.length;
            });
        }

        if (dataSet.hBaseFilters.length > 0) {
            searchQuery.predicates = dataSet.hBaseFilters;
            this.searchQueryService.getData(searchQuery, 'hbase').subscribe((result: any[]) => {
                dataSet['hbaseCount'] = result.length;
            });
        }

        if (dataSet.fileFilters.length > 0) {
            searchQuery.predicates = dataSet.fileFilters;
            this.searchQueryService.getData(searchQuery, 'hdfs').subscribe((result: any[]) => {
                dataSet['hdfsCount'] = result.length;
            });
        }

    }

    setSelectedCategory(category: string) {
        this.selectedCategory = category;
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

        return keys;
    }

    onAddDataSet() {
        this.router.navigate(['ui/data-analyst/dataset/add']);
    }

    viewDataSet(dataSet: DataSet) {
        let navigationExtras = {
            'queryParams' : {'host': dataSet.ambariHost, 'dataCenter': dataSet.dataCenter}
        };
        this.router.navigate(['ui/data-analyst/dataset/view/' + dataSet.name], navigationExtras);
    }
}
