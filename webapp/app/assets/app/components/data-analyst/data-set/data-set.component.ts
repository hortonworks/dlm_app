import {Router} from '@angular/router';
import {Component, OnInit} from '@angular/core';
import {DataSetService} from '../../../services/data-set.service';
import {DataSet} from '../../../models/data-set';

@Component({
    selector: 'data-set',
    templateUrl: 'assets/app/components/data-analyst/data-set/data-set.component.html',
    styleUrls: ['assets/app/components/data-analyst/data-set/data-set.component.css']
})
export class DataSetComponent implements OnInit {

    dataSets: DataSet[] = [];
    dataSetsMap: {[key: string]: DataSet[]} = {};

    constructor(private dataSetService: DataSetService, private router: Router) {}

    ngOnInit() {
        this.dataSetService.getAll().subscribe(results => {
            this.dataSets = results;

            for (let dataSet of this.dataSets) {
                if (!this.dataSetsMap[dataSet.dataSetCategory]) {
                    this.dataSetsMap[dataSet.dataSetCategory] = [];
                }
                this.dataSetsMap[dataSet.dataSetCategory].push(dataSet);
            }
        });
    }

    getDataSetCategorys(): string[] {
        return Object.keys(this.dataSetsMap);
    }

    getText(dataSet: DataSet): string {
        return 'Data Sources: ' + dataSet.dataSources + '<br>' +
               'Last Updated: ' + dataSet.lastUpdated + '<br>' +
               'Object Count: ' + dataSet.objectCount + '<br>';
    }

    onAddDataSet() {
        this.router.navigate(['ui/data-analyst/dataset/add']);
    }

    viewDataSet(dataSet: DataSet) {
        this.router.navigate(['ui/data-analyst/dataset/view/' + dataSet.name]);
    }
}