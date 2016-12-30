import {Router} from '@angular/router';
import {Component, OnInit} from '@angular/core';
import {DataSetService} from '../../../services/data-set.service';
import {DataSet} from '../../../models/data-set';
import {Environment} from '../../../environment';
import {DataCenterService} from '../../../services/data-center.service';
import {DataCenter} from '../../../models/data-center';
import {Persona} from '../../../shared/utils/persona';

@Component({
    selector: 'data-set',
    templateUrl: 'assets/app/components/data-analyst/data-set/data-set.component.html',
    styleUrls: ['assets/app/components/data-analyst/data-set/data-set.component.css']
})
export class DataSetComponent implements OnInit {
    persona = Persona;

    dataSets: DataSet[] = [];
    dataSetsMap: {[key: string]: DataSet[]} = {};

    constructor(private dataSetService: DataSetService, private router: Router, private dataCenterService: DataCenterService,
                private environment: Environment) {}

    ngOnInit() {

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
           for (let host of dataCenterDetail.hosts) {
               this.dataSetService.getAll(host.ambariHost, name).subscribe(results => {
                   this.dataSets = [...this.dataSets, ...results];

                   for (let dataSet of results) {
                       if (!this.dataSetsMap[dataSet.category]) {
                           this.dataSetsMap[dataSet.category] = [];
                       }
                       this.dataSetsMap[dataSet.category].push(dataSet);
                   }
               });
           }
        });
    }

    getDataSetCategorys(): string[] {
        return Object.keys(this.dataSetsMap);
    }

    getDataSources(dataSet: DataSet) {
        let dataSources: string[] = [];

        if (dataSet.hiveFilters.length > 0) {
            dataSources.push('HIVE');
        }
        if (dataSet.hBaseFilters.length > 0) {
            dataSources.push('HBASE');
        }
        if (dataSet.fileFilters.length > 0) {
            dataSources.push('HDFS');
        }

        return dataSources;
    }

    // getText(dataSet: DataSet): string {
    //     return 'Data Sources: ' + this.getDataSources(dataSet) + '<br>' +
    //            'Last Updated: ' + this.getLastUpdated() + '<br>' +
    //            'Object Count: ' + this.getObjectCount() + '<br>';
    // }

    getObjectCount() {
        return '100';
        // return Math.floor((Math.random() * 1000) + 1);
    }

    getLastUpdated() {
        return 'date ... ';
        // return new Date(new Date().getTime() - (Math.random() * 1000000)).toUTCString();
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
