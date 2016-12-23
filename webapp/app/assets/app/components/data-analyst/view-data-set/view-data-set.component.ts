import {Component, OnInit} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {DataSetService} from '../../../services/data-set.service';
import {DataSet} from '../../../models/data-set';

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

    constructor(private activatedRoute: ActivatedRoute, private dataSetService: DataSetService) {}

    ngOnInit() {
        this.activatedRoute.params.subscribe(params => {
            this.dataSetName = params['id'];
            this.dataSetService.getByName(this.dataSetName).subscribe(result => {
                this.dataSet = result;
            });
        });
    }

    setActiveTab($event: any, activeTab: Tab) {
        this.activeTab = activeTab;
        $event.preventDefault();
    }
}