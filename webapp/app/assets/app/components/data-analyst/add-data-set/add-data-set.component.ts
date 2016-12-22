import {Component, OnInit} from '@angular/core';

export enum Tab {
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
    tab = Tab;
    activeTab: Tab = Tab.HIVE;

    ngOnInit() {
        console.log('here ...');
    }
}