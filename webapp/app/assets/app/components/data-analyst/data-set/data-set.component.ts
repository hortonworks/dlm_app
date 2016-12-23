import {Router} from '@angular/router';
import {Component, OnInit} from '@angular/core';
import {DataSetService} from '../../../services/data-set.service';
import {DataSet} from '../../../models/data-set';
import {Environment} from '../../../environment';

@Component({
    selector: 'data-set',
    templateUrl: 'assets/app/components/data-analyst/data-set/data-set.component.html',
    styleUrls: ['assets/app/components/data-analyst/data-set/data-set.component.css']
})
export class DataSetComponent implements OnInit {

    dataSets: DataSet[] = [];
    dataSetsMap: {[key: string]: DataSet[]} = {};

    constructor(private dataSetService: DataSetService, private router: Router, private environment: Environment) {}

    ngOnInit() {
        this.dataSetService.getAll(this.environment.host, this.environment.dataCenterName).subscribe(results => {
            this.dataSets = results;

            for (let dataSet of this.dataSets) {
                if (!this.dataSetsMap[dataSet.category]) {
                    this.dataSetsMap[dataSet.category] = [];
                }
                this.dataSetsMap[dataSet.category].push(dataSet);
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